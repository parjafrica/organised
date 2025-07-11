from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from server.database import db_manager
from psycopg2.extras import RealDictCursor
from server.app.agent.manus import Manus
from app.logger import logger
import json

router = APIRouter()

async def run_agent_with_prompt(prompt: str):
    """Helper function to create and run a Manus agent with a given prompt."""
    try:
        agent = await Manus.create()
        response_str = await agent.run(prompt)
        # The agent's response is expected to be a JSON string.
        return json.loads(response_str)
    except json.JSONDecodeError as e:
        logger.error(f"Agent response was not valid JSON: {response_str}")
        raise HTTPException(status_code=500, detail="Agent returned an invalid response format.")
    except Exception as e:
        logger.error(f"Error running agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/opportunities")
async def get_opportunities(
    country: Optional[str] = None,
    sector: Optional[str] = None,
    verified_only: bool = False,
    limit: int = 50,
    natural_language_query: Optional[str] = None
):
    """Get funding opportunities with filters, optionally using a natural language query."""
    try:
        if natural_language_query:
            prompt = f"""
            Find funding opportunities based on the following criteria:
            Natural Language Query: {natural_language_query}
            Country: {country if country else 'Any'}
            Sector: {sector if sector else 'Any'}
            Verified Only: {verified_only}
            Limit: {limit}

            Return a JSON object containing a list of funding opportunities. Each opportunity should have fields like:
            id, title, description, amount_min, amount_max, currency, deadline, source_url, source_name, country, sector,
            eligibility_criteria, application_process, keywords, focus_areas, is_verified, scraped_at, created_at.
            """
            return await run_agent_with_prompt(prompt)
        else:
            with db_manager.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    query = """
                        SELECT id, title, description, amount_min, amount_max, currency,
                               deadline, source_url, source_name, country, sector,
                               eligibility_criteria, application_process, keywords,
                               focus_areas, is_verified, scraped_at, created_at
                        FROM donor_opportunities
                        WHERE is_active = true
                    """
                    params = []
                    
                    if country:
                        query += " AND (country = %s OR country = 'Global')"
                        params.append(country)
                    
                    if sector:
                        query += " AND sector = %s"
                        params.append(sector)
                    
                    if verified_only:
                        query += " AND is_verified = true"
                    
                    query += " ORDER BY created_at DESC LIMIT %s"
                    params.append(limit)
                    
                    cursor.execute(query, params)
                    opportunities = cursor.fetchall()
                    
                    return {"opportunities": [dict(row) for row in opportunities]}
                    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/opportunities")
async def create_opportunity(opportunity_data: Dict[str, Any]):
    """Create a new funding opportunity, with Manus agent enrichment."""
    prompt = f"""
    The user wants to create a new funding opportunity with the following initial data:
    {json.dumps(opportunity_data, indent=2)}

    Please enrich this data. Specifically, you should:
    - Validate the provided fields.
    - Suggest additional keywords and focus areas if not already present.
    - Generate a content_hash if not provided.
    - Ensure all necessary fields for a funding opportunity are present and well-formed.

    Return the enriched opportunity data as a JSON object, ready for database insertion.
    """
    enriched_data = await run_agent_with_prompt(prompt)

    try:
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO donor_opportunities (
                        title, description, amount_min, amount_max, currency,
                        deadline, source_url, source_name, country, sector,
                        eligibility_criteria, application_process, keywords,
                        focus_areas, content_hash, is_verified, is_active,
                        scraped_at, created_at, updated_at
                    ) VALUES (
                        %(title)s, %(description)s, %(amount_min)s, %(amount_max)s, %(currency)s,
                        %(deadline)s, %(source_url)s, %(source_name)s, %(country)s, %(sector)s,
                        %(eligibility_criteria)s, %(application_process)s, %(keywords)s,
                        %(focus_areas)s, %(content_hash)s, %(is_verified)s, %(is_active)s,
                        NOW(), NOW(), NOW()
                    ) RETURNING id
                """, enriched_data)
                
                opportunity_id = cursor.fetchone()[0]
                conn.commit()
                
                return {"id": opportunity_id, "message": "Opportunity created successfully"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))