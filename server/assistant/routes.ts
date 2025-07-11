import type { Express } from "express";
import { storage } from "../storage/storage";

export function registerAssistantRoutes(app: Express) {
  // Track intelligent assistant behavior and advice
  app.post('/api/assistant/track-behavior', async (req, res) => {
    try {
      const { userId, behaviorData, adviceGenerated } = req.body;
      
      // Generate a valid UUID for demo user
      const validUserId = userId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      
      await storage.createUserInteraction({
        userId: validUserId,
        action: 'assistant_analysis',
        page: behaviorData?.currentPage || 'unknown',
        details: {
          type: 'intelligent_assistant',
          behavior: behaviorData,
          advice: adviceGenerated,
          timestamp: new Date().toISOString()
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking assistant behavior:', error);
      res.status(500).json({ error: 'Failed to track assistant behavior' });
    }
  });

  // Get user behavior analytics for intelligent assistant
  app.get('/api/assistant/analytics/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const interactions = await storage.getUserInteractions(userId);
      const assistantInteractions = interactions.filter(i => 
        i.details?.type === 'intelligent_assistant'
      );
      
      const analytics = {
        totalSessions: assistantInteractions.length,
        averageSessionDuration: assistantInteractions.reduce((avg, interaction) => {
          const duration = interaction.details?.behavior?.sessionDuration || 0;
          return avg + duration;
        }, 0) / assistantInteractions.length || 0,
        mostCommonAdviceType: getMostCommonAdviceType(assistantInteractions),
        strugglingPatterns: getStrugglingPatterns(assistantInteractions),
        successIndicators: getSuccessIndicators(assistantInteractions)
      };
      
      res.json({ success: true, analytics });
    } catch (error) {
      console.error('Error getting assistant analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  function getMostCommonAdviceType(interactions: any[]): string {
    const adviceTypes = interactions
      .map(i => i.details?.advice?.type)
      .filter(Boolean);
    
    const typeCounts = adviceTypes.reduce((counts: any, type: string) => {
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});
    
    return Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b, 'guidance'
    );
  }

  function getStrugglingPatterns(interactions: any[]): string[] {
    return interactions
      .flatMap(i => i.details?.behavior?.strugglingIndicators || [])
      .filter((indicator: string, index: number, arr: string[]) => 
        arr.indexOf(indicator) === index
      );
  }

  function getSuccessIndicators(interactions: any[]): string[] {
    return interactions
      .flatMap(i => i.details?.behavior?.successIndicators || [])
      .filter((indicator: string, index: number, arr: string[]) => 
        arr.indexOf(indicator) === index
      );
  }
}
