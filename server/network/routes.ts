import type { Express } from "express";
import { storage } from "../storage";

export function registerNetworkRoutes(app: Express) {
  // Business network endpoint - connects to user database for networking
  app.get("/api/network", async (req, res) => {
    try {
      // Get network connections from user database
      const users = await storage.getAllUsers();
      
      // Filter for business-related users and connections
      const networkConnections = users
        .filter(user => user.userType === 'business' || user.userType === 'organization')
        .slice(0, 12) // Limit to 12 connections
        .map(user => ({
          id: user.id,
          name: user.fullName || `${user.firstName} ${user.lastName}`,
          title: user.position || 'Business Professional',
          company: user.organizationName || 'Independent',
          sector: user.sector || 'Business',
          location: user.country || 'Global',
          connectionType: Math.random() > 0.5 ? 'investor' : 'mentor',
          profileImage: user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=random`,
          isConnected: Math.random() > 0.7 // 30% already connected
        }));

      res.json({
        connections: networkConnections,
        stats: {
          totalConnections: networkConnections.length,
          investors: networkConnections.filter(c => c.connectionType === 'investor').length,
          mentors: networkConnections.filter(c => c.connectionType === 'mentor').length,
          businessPartners: Math.floor(networkConnections.length * 0.3)
        }
      });
    } catch (error) {
      console.error('Network API error:', error);
      res.status(500).json({ error: "Failed to fetch network data" });
    }
  });
}
