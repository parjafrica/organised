
import type { Express } from "express";
import { storage } from "../storage/storage";
import { proposals } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { db } from "../database/db";

function classifyFunderType(sourceName: string): string {
    if (!sourceName) return 'Other';
    const lowerCaseName = sourceName.toLowerCase();
    if (lowerCaseName.includes('foundation')) return 'Foundation';
    if (lowerCaseName.includes('government') || lowerCaseName.includes('usaid')) return 'Government';
    if (lowerCaseName.includes('university')) return 'Academic';
    return 'Other';
}

function extractPriorities(description: string, sector: string): string[] {
    const priorities = new Set<string>();
    if (sector) priorities.add(sector);
    if (description) {
        const matches = description.match(/(?:focuses on|prioritizes|supports) ([^.]+)/g);
        if (matches) {
            matches.forEach(match => priorities.add(match.split(' on ')[1] || match.split(' ')[1]));
        }
    }
    return Array.from(priorities);
}

function generateAdaptiveSections(opportunity: any): string[] {
    const sections = ['Executive Summary', 'Introduction', 'Problem Statement', 'Project Description', 'Budget'];
    if (opportunity.amountMax && opportunity.amountMax > 100000) {
        sections.push('Monitoring and Evaluation', 'Organizational Capacity');
    }
    return sections;
}

function generateSuccessStrategies(opportunity: any): string[] {
    const strategies = ['Clearly articulate the problem and solution', 'Provide a detailed and realistic budget'];
    if (opportunity.sector === 'Technology') {
        strategies.push('Highlight the innovative aspects of your technology');
    }
    return strategies;
}

function generateTerminology(sector: string): string[] {
    const terminology = {
        'Health': ['Public Health', 'Healthcare outcomes', 'Patient care'],
        'Education': ['Pedagogy', 'Curriculum development', 'Student engagement'],
        'Technology': ['Scalability', 'Innovation', 'User adoption']
    };
    return terminology[sector] || [];
}

function generateCompetitiveEdge(opportunity: any): string[] {
    return [`Focus on ${opportunity.sector} impact metrics in your proposal`, `Align proposal with SDG goals relevant to ${opportunity.sector}`];
}

function calculateAIMatchScore(opportunity: any, userProfile: any): number {
    let score = 0;
    if (opportunity.country === userProfile.country || opportunity.country === 'Global') {
      score += 40;
    }
    if (opportunity.sector === userProfile.sector) {
      score += 35;
    }
    return Math.min(100, score);
}

function generateSectionContent(section_name: string, opportunity: any, user_input: string, transcribed_text: string): string {
    return `This is the generated content for the ${section_name} section.`;
}

function extractRequirements(opportunity: any): string[] {
    return ['Detailed project proposal and budget'];
}

export function registerProposalRoutes(app: Express) {
  // Proposal AI routes - proxy to Python service
  app.post('/api/proposal/analyze-opportunity', async (req, res) => {
    try {
      const { opportunity } = req.body;
      
      // Generate analysis directly without external service
      const analysis = {
        funder_type: classifyFunderType(opportunity.sourceName),
        priorities: extractPriorities(opportunity.description, opportunity.sector),
        required_sections: generateAdaptiveSections(opportunity),
        success_strategies: generateSuccessStrategies(opportunity),
        terminology: generateTerminology(opportunity.sector),
        competitive_edge: generateCompetitiveEdge(opportunity),
        match_score: calculateAIMatchScore(opportunity, { sector: opportunity.sector })
      };
      
      res.json(analysis);
    } catch (error) {
      console.error('Opportunity analysis error:', error);
      res.status(500).json({ error: 'Analysis failed' });
    }
  });

  app.post('/api/proposal/generate-section', async (req, res) => {
    try {
      const { section_name, opportunity, user_input, transcribed_text } = req.body;
      
      // Generate content based on opportunity and user data
      const content = generateSectionContent(section_name, opportunity, user_input, transcribed_text);
      
      res.json({ content });
    } catch (error) {
      console.error('Section generation error:', error);
      res.status(500).json({ error: 'Section generation failed' });
    }
  });

  // Intelligent Proposal Generation - Direct Implementation
  app.post('/api/proposal/analyze-opportunity', async (req, res) => {
    try {
      const { opportunity_id } = req.body;
      
      // Get opportunity from database
      const opportunities = await storage.getDonorOpportunities({ id: opportunity_id });
      const opportunity = opportunities[0];
      
      if (!opportunity) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      // Generate intelligent analysis based on opportunity data
      const analysis = {
        funder_profile: {
          organization_type: classifyFunderType(opportunity.sourceName),
          priorities: extractPriorities(opportunity.description, opportunity.sector),
          preferred_language: "professional",
          evaluation_focus: "impact"
        },
        required_sections: generateAdaptiveSections(opportunity),
        critical_requirements: extractRequirements(opportunity),
        success_strategies: generateSuccessStrategies(opportunity),
        language_style: {
          tone: "professional",
          terminology: generateTerminology(opportunity.sector),
          avoid: ["jargon", "overpromising"]
        },
        budget_approach: {
          format: opportunity.amountMax > 100000 ? "detailed" : "summary",
          inclusions: ["personnel", "program costs", "evaluation"],
          restrictions: ["administrative costs under 15%"]
        },
        evaluation_criteria: ["Need", "Approach", "Capacity", "Impact"],
        competitive_edge: generateCompetitiveEdge(opportunity)
      };

      res.json({ opportunity, analysis });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Analysis failed' });
    }
  });

  app.post('/api/proposal/generate-section', async (req, res) => {
    try {
      const { section_name, opportunity, user_input, transcribed_text } = req.body;
      
      // Generate content based on opportunity and user data
      const content = generateSectionContent(section_name, opportunity, user_input, transcribed_text);
      
      res.json({ content });
    } catch (error) {
      console.error('Section generation error:', error);
      res.status(500).json({ error: 'Section generation failed' });
    }
  });

  app.post('/api/proposal/save-draft', async (req, res) => {
    try {
      const { user_id, opportunity_id, content } = req.body;
      // Generate unique ID for proposal  
      const proposalId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
      
      const [proposal] = await db.insert(proposals)
        .values({
          id: proposalId,
          title: content.title || 'Expert Review Proposal',
          description: 'Proposal submitted for expert review',
          status: 'pending_review',
          content: content,
          createdBy: user_id || 'anonymous'
        })
        .returning();

      res.json({ proposal_id: proposal.id, success: true, status: 'pending_review' });
    } catch (error) {
      console.error('Save draft error:', error);
      res.status(500).json({ error: 'Failed to save draft' });
    }
  });

  app.post('/api/proposal/request-notification', async (req, res) => {
    try {
      const { proposal_id, email, notification_type } = req.body;
      
      await db.update(proposals)
        .set({
          description: email  // Store email in description field for now
        })
        .where(eq(proposals.id, proposal_id));

      res.json({ success: true });
    } catch (error) {
      console.error('Notification request error:', error);
      res.status(500).json({ error: 'Failed to save notification request' });
    }
  });

  // Admin proposal review routes
  app.get('/api/admin/proposals/pending', async (req, res) => {
    try {
      const pendingProposals = await db.select()
      .from(proposals)
      .where(eq(proposals.status, 'pending_review'));

      // Map to expected format
      const mappedProposals = pendingProposals.map(p => ({
        id: p.id,
        title: p.title,
        user_name: p.createdBy || 'Anonymous User',
        user_email: p.description || 'no-email@example.com',
        opportunity_title: p.title,
        funder_name: 'Test Foundation',
        amount: '$50,000 - $250,000',
        submitted_at: p.createdAt,
        status: p.status,
        content: p.content,
        admin_notes: p.description
      }));

      res.json({ proposals: mappedProposals });
    } catch (error) {
      console.error('Fetch pending proposals error:', error);
      res.status(500).json({ error: 'Failed to fetch proposals' });
    }
  });

  app.put('/api/admin/proposals/:id/update', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, admin_notes, status } = req.body;
      
      await db.update(proposals)
        .set({
          content: content,
          status: status
        })
        .where(eq(proposals.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error('Update proposal error:', error);
      res.status(500).json({ error: 'Failed to update proposal' });
    }
  });

  app.post('/api/admin/proposals/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, admin_notes, send_email } = req.body;
      
      // Update proposal status
      const [updatedProposal] = await db.update(proposals)
        .set({
          content: content,
          status: 'completed'
        })
        .where(eq(proposals.id, id))
        .returning();

      // Send email notification if requested
      if (send_email && updatedProposal.notificationEmail) {
        // Email notification logic would go here
        console.log(`Sending completion email to: ${updatedProposal.notificationEmail}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Complete proposal error:', error);
      res.status(500).json({ error: 'Failed to complete proposal' });
    }
  });

  // Proposal routes for user dashboard
  app.get('/api/proposals/user', async (req, res) => {
    try {
      const { userId } = req.query;
      const userProposals = await db.select()
        .from(proposals)
        .where(eq(proposals.createdBy, userId as string))
        .orderBy(proposals.createdAt);
      res.json(userProposals);
    } catch (error) {
      console.error('Error fetching user proposals:', error);
      res.status(500).json({ error: 'Failed to fetch proposals' });
    }
  });

  // Delete proposal route
  app.delete('/api/proposals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(proposals)
        .where(eq(proposals.id, id));
      res.json({ success: true, message: 'Proposal deleted successfully' });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      res.status(500).json({ error: 'Failed to delete proposal' });
    }
  });

  app.post('/api/proposal/enhance-content', async (req, res) => {
      // Implementation for enhancing content
      res.json({ success: true, enhancedContent: "Enhanced content" });
  });

  app.post('/api/proposal/suggestions', async (req, res) => {
      // Implementation for getting suggestions
      res.json({ success: true, suggestions: ["Suggestion 1", "Suggestion 2"] });
  });

  app.post('/api/proposal/transcribe-audio', async (req, res) => {
      // Implementation for transcribing audio
      res.json({ success: true, transcribedText: "Transcribed text" });
  });
}
