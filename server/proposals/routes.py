from fastapi import APIRouter, HTTPException, Form, UploadFile, File
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

@router.post("/proposal/analyze")
async def analyze_proposal(request: Dict[str, Any]):
    """Analyze proposal content using the Manus agent."""
    proposal_content = request.get("proposalContent", {})
    opportunity_details = request.get("opportunityDetails", {})

    prompt = f"""
    Analyze the following grant proposal based on the provided opportunity details.

    **Opportunity Details:**
    {json.dumps(opportunity_details, indent=2)}

    **Proposal Content:**
    {json.dumps(proposal_content, indent=2)}

    Provide a detailed analysis of the proposal. The output MUST be a JSON object with the following keys:
    - "score": A score from 0 to 100.
    - "strengths": A list of strings detailing the proposal's strengths.
    - "weaknesses": A list of strings detailing the proposal's weaknesses.
    - "recommendations": A list of strings with recommendations for improvement.
    - "competitiveAdvantage": A list of strings describing the competitive advantage.
    - "riskFactors": A list of strings identifying potential risk factors.
    - "fundingProbability": A float between 0 and 1 indicating the probability of funding.
    """
    return await run_agent_with_prompt(prompt)

@router.post("/proposal/optimize")
async def optimize_proposal(request: Dict[str, Any]):
    """Get AI-powered optimization suggestions for proposal improvement using the Manus agent."""
    proposal_content = request.get("proposalContent", {})
    opportunity_details = request.get("opportunityDetails", {})

    prompt = f"""
    Analyze the following grant proposal and provide optimization suggestions.

    **Opportunity Details:**
    {json.dumps(opportunity_details, indent=2)}

    **Proposal Content:**
    {json.dumps(proposal_content, indent=2)}

    Provide a detailed set of optimizations. The output MUST be a JSON object with the following keys:
    - "suggestedChanges": A list of objects, each with "section", "current", "suggested", "reasoning", and "impact".
    - "keywordOptimization": An object with "missing", "overused", and "trending" keywords (each a list of strings).
    - "structureRecommendations": A list of strings with recommendations for improving the proposal's structure.
    """
    return await run_agent_with_prompt(prompt)

@router.post("/proposal/insights")
async def get_smart_insights(request: Dict[str, Any]):
    """Generate smart insights about the proposal-opportunity match using the Manus agent."""
    proposal_content = request.get("proposalContent", {})
    opportunity_details = request.get("opportunityDetails", {})
    user_profile = request.get("userProfile", {})

    prompt = f"""
    Generate smart insights for the following grant proposal.

    **Opportunity Details:**
    {json.dumps(opportunity_details, indent=2)}

    **Proposal Content:**
    {json.dumps(proposal_content, indent=2)}

    **User Profile:**
    {json.dumps(user_profile, indent=2)}

    Provide a detailed set of insights. The output MUST be a JSON object with the following keys:
    - "matchScore": A float between 0 and 1 indicating the match between the proposal and opportunity.
    - "deadlineUrgency": A string (e.g., "low", "medium", "high").
    - "competitionLevel": A string (e.g., "low", "medium", "high").
    - "successProbability": A float between 0 and 1.
    - "suggestedActions": A list of strings with recommended next steps.
    - "timeToComplete": A string estimating the time to complete the proposal (e.g., "5-7 days").
    """
    return await run_agent_with_prompt(prompt)

@router.post("/proposal/enhance")
async def enhance_content(request: Dict[str, Any]):
    """AI-powered content enhancement for specific sections using the Manus agent."""
    section = request.get("section", "")
    current_content = request.get("currentContent", "")
    context = request.get("context", {})

    prompt = f"""
    Enhance the following content for a grant proposal.

    **Section to Enhance:**
    {section}

    **Current Content:**
    {current_content}

    **Additional Context:**
    {json.dumps(context, indent=2)}

    Rewrite and improve the content, making it more compelling, professional, and aligned with funder expectations.
    The output MUST be a JSON object with a single key, "enhancedContent", containing the improved text as a string.
    """
    return await run_agent_with_prompt(prompt)

@router.post("/proposal/competitive-analysis")
async def get_competitive_analysis(request: Dict[str, Any]):
    """Generate a competitive analysis for the proposal using the Manus agent."""
    opportunity_details = request.get("opportunityDetails", {})
    user_profile = request.get("userProfile", {})

    prompt = f"""
    Perform a competitive analysis for a grant proposal based on the following details.

    **Opportunity Details:**
    {json.dumps(opportunity_details, indent=2)}

    **User Profile / Organization Background:**
    {json.dumps(user_profile, indent=2)}

    Provide a detailed competitive analysis. The output MUST be a JSON object with the following keys:
    - "competitorCount": An estimated integer number of other applicants.
    - "competitiveAdvantages": A list of strings describing the user's key competitive advantages.
    - "recommendedDifferentiators": A list of strings suggesting ways to differentiate the proposal.
    - "marketPosition": A string describing the user's likely market position (e.g., "Strong contender").
    - "winProbability": A float between 0 and 1.
    """
    return await run_agent_with_prompt(prompt)

@router.post("/proposals/generate")
async def generate_proposal(
    opportunity_id: str = Form(...),
    user_input: str = Form(""),
    audio_file: Optional[UploadFile] = File(None)
):
    """Generate AI proposal content using the Manus agent."""
    try:
        # Get opportunity details from the database
        with db_manager.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM donor_opportunities WHERE id = %s", (opportunity_id,))
                opportunity = cursor.fetchone()
                if not opportunity:
                    raise HTTPException(status_code=404, detail="Opportunity not found")

        # Placeholder for audio transcription
        transcribed_text = ""
        if audio_file:
            transcribed_text = "Audio transcription would be processed here."

        prompt = f"""
        Generate a comprehensive grant proposal based on the following information.

        **Funding Opportunity Details:**
        {json.dumps(dict(opportunity), indent=2, default=str)}

        **User's Initial Input/Notes:**
        {user_input}

        **Transcribed Audio Notes:**
        {transcribed_text}

        Generate a complete, well-structured grant proposal. The output MUST be a JSON object with keys for each
        major section of the proposal, for example:
        - "executive_summary"
        - "problem_statement"
        - "project_description"
        - "goals_and_objectives"
        - "methodology"
        - "monitoring_and_evaluation"
        - "budget_narrative"
        - "organizational_background"
        Each key should contain the generated text for that section as a string.
        """
        return await run_agent_with_prompt(prompt)

    except HTTPException as e:
        raise e # Re-raise HTTPException
    except Exception as e:
        logger.error(f"Error generating proposal: {e}")
        raise HTTPException(status_code=500, detail=str(e))
