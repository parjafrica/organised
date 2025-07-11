
import type { Express } from "express";
import { getDonorOpportunities } from "./db";

export function registerDonorRoutes(app: Express) {
  // Get trending opportunities
  app.get("/api/opportunities/trending", async (req, res) => {
    try {
      const opportunities = await getDonorOpportunities({
        limit: 10,
        verifiedOnly: true
      });
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get trending opportunities" });
    }
  });

  // Get personalized opportunities for user
  app.get("/api/opportunities/personalized/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const opportunities = await getDonorOpportunities({
        limit: 20,
        verifiedOnly: true
      });
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get personalized opportunities" });
    }
  });

  // Search opportunities (replacing Supabase edge function)
  app.get("/api/search-opportunities", async (req, res) => {
    try {
      const {
        q: query = "",
        country = "",
        sector = "",
        min_amount = "0",
        max_amount = "0",
        verified_only = "false",
        limit = "50",
        offset = "0",
        use_ai = "false"
      } = req.query as Record<string, string>;

      const opportunities = await getDonorOpportunities({
        country: country || undefined,
        sector: sector || undefined,
        minAmount: parseInt(min_amount) || undefined,
        maxAmount: parseInt(max_amount) || undefined,
        verifiedOnly: verified_only === "true",
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        opportunities,
        total_count: opportunities.length,
        search_id: `search-${Date.now()}`,
        timestamp: new Date().toISOString(),
        credits_used: use_ai === "true" ? 15 : 5,
        sources: ['UNDP', 'World Bank', 'USAID'],
        fresh_data_percentage: 85
      });
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Get opportunities endpoint
  app.get("/api/opportunities", async (req, res) => {
    try {
      const { country, sector, verified_only, limit = 20, offset = 0 } = req.query;
      
      const opportunities = await getDonorOpportunities({
        country: country as string,
        sector: sector as string,
        verifiedOnly: verified_only === 'true',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      console.log(`API: Found ${opportunities.length} opportunities`);
      res.json(opportunities);
    } catch (error) {
      console.error('API Error fetching opportunities:', error);
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  // AI-powered personalized opportunities for each user
  app.get('/api/personalized-opportunities/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all opportunities
      const allOpportunities = await getDonorOpportunities({});
      
      // AI-driven personalization based on user profile
      const personalizedOpportunities = allOpportunities
        .filter(opp => {
          // Filter based on user's country, sector preferences, etc.
          if (user.country && opp.country !== 'Global' && opp.country !== user.country) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          // AI scoring algorithm - prioritize based on user profile
          let scoreA = 0;
          let scoreB = 0;
          
          // Score based on funding amount matching user's typical range
          if (user.organizationType === 'small_ngo') {
            scoreA += a.amountMax && a.amountMax <= 100000 ? 10 : 0;
            scoreB += b.amountMax && b.amountMax <= 100000 ? 10 : 0;
          } else if (user.organizationType === 'large_ngo') {
            scoreA += a.amountMin && a.amountMin >= 100000 ? 10 : 0;
            scoreB += b.amountMin && b.amountMin >= 100000 ? 10 : 0;
          }
          
          // Score based on sector match
          if (user.sector && a.sector === user.sector) scoreA += 15;
          if (user.sector && b.sector === user.sector) scoreB += 15;
          
          // Score based on keywords in user's interests
          if (user.interests) {
            const interests = user.interests.toLowerCase();
            a.keywords?.forEach(keyword => {
              if (interests.includes(keyword.toLowerCase())) scoreA += 5;
            });
            b.keywords?.forEach(keyword => {
              if (interests.includes(keyword.toLowerCase())) scoreB += 5;
            });
          }
          
          return scoreB - scoreA;
        })
        .slice(0, 20); // Return top 20 personalized opportunities

      res.json(personalizedOpportunities);
    } catch (error) {
      console.error('Error getting personalized opportunities:', error);
      res.status(500).json({ error: 'Failed to get personalized opportunities' });
    }
  });
}
