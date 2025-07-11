
import type { Express } from "express";
import { storage } from "../core/storage";
import { setupAuth, requireAuth } from "../auth/auth";
import session from "express-session";
import { URLSearchParams } from "url";

export function registerUserRoutes(app: Express) {
  // Authentication endpoints
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (req.session?.user) {
        // Return user from session
        const user = await storage.getUser(req.session.user.id);
        if (user) {
          res.json(user);
        } else {
          res.status(401).json({ message: "User not found" });
        }
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Comprehensive user registration with all profile fields
  app.post("/api/users/comprehensive-register", async (req, res) => {
    try {
      const profileData = req.body;
      const { email, password, firstName, lastName } = profileData;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create comprehensive user profile
      const userData = {
        ...profileData,
        hashedPassword,
        fullName: `${firstName} ${lastName}`,
        // Convert comma-separated strings to arrays for array fields
        academicAchievements: profileData.academicAchievements ? 
          (typeof profileData.academicAchievements === 'string' ? 
            profileData.academicAchievements.split(',').filter(Boolean) : 
            profileData.academicAchievements) : [],
        researchInterests: profileData.researchInterests ? 
          (typeof profileData.researchInterests === 'string' ? 
            profileData.researchInterests.split(',').filter(Boolean) : 
            profileData.researchInterests) : [],
        extracurricularActivities: profileData.extracurricularActivities ? 
          (typeof profileData.extracurricularActivities === 'string' ? 
            profileData.extracurricularActivities.split(',').filter(Boolean) : 
            profileData.extracurricularActivities) : [],
        scholarshipsReceived: profileData.scholarshipsReceived ? 
          (typeof profileData.scholarshipsReceived === 'string' ? 
            profileData.scholarshipsReceived.split(',').filter(Boolean) : 
            profileData.scholarshipsReceived) : [],
        targetBeneficiaries: profileData.targetBeneficiaries ? 
          (typeof profileData.targetBeneficiaries === 'string' ? 
            profileData.targetBeneficiaries.split(',').filter(Boolean) : 
            profileData.targetBeneficiaries) : [],
        partnerOrganizations: profileData.partnerOrganizations ? 
          (typeof profileData.partnerOrganizations === 'string' ? 
            profileData.partnerOrganizations.split(',').filter(Boolean) : 
            profileData.partnerOrganizations) : [],
        mainPrograms: profileData.mainPrograms ? 
          (typeof profileData.mainPrograms === 'string' ? 
            profileData.mainPrograms.split(',').filter(Boolean) : 
            profileData.mainPrograms) : [],
        responsibilities: profileData.responsibilities ? 
          (typeof profileData.responsibilities === 'string' ? 
            profileData.responsibilities.split(',').filter(Boolean) : 
            profileData.responsibilities) : [],
        organizationAchievements: profileData.organizationAchievements ? 
          (typeof profileData.organizationAchievements === 'string' ? 
            profileData.organizationAchievements.split(',').filter(Boolean) : 
            profileData.organizationAchievements) : [],
        mainProducts: profileData.mainProducts ? 
          (typeof profileData.mainProducts === 'string' ? 
            profileData.mainProducts.split(',').filter(Boolean) : 
            profileData.mainProducts) : [],
        mainServices: profileData.mainServices ? 
          (typeof profileData.mainServices === 'string' ? 
            profileData.mainServices.split(',').filter(Boolean) : 
            profileData.mainServices) : [],
        keyPartners: profileData.keyPartners ? 
          (typeof profileData.keyPartners === 'string' ? 
            profileData.keyPartners.split(',').filter(Boolean) : 
            profileData.keyPartners) : [],
        businessAchievements: profileData.businessAchievements ? 
          (typeof profileData.businessAchievements === 'string' ? 
            profileData.businessAchievements.split(',').filter(Boolean) : 
            profileData.businessAchievements) : [],
        intellectualProperty: profileData.intellectualProperty ? 
          (typeof profileData.intellectualProperty === 'string' ? 
            profileData.intellectualProperty.split(',').filter(Boolean) : 
            profileData.intellectualProperty) : [],
        fundingGoals: profileData.fundingGoals ? 
          (typeof profileData.fundingGoals === 'string' ? 
            profileData.fundingGoals.split(',').filter(Boolean) : 
            profileData.fundingGoals) : [],
        interests: profileData.interests ? 
          (typeof profileData.interests === 'string' ? 
            profileData.interests.split(',').filter(Boolean) : 
            profileData.interests) : [],
        primaryGoals: profileData.primaryGoals ? 
          (typeof profileData.primaryGoals === 'string' ? 
            profileData.primaryGoals.split(',').filter(Boolean) : 
            profileData.primaryGoals) : [],
        careerGoals: profileData.careerGoals ? 
          (typeof profileData.careerGoals.split(',').filter(Boolean) : 
            profileData.careerGoals) : [],
        investorsInterested: profileData.investorsInterested ? 
          (typeof profileData.investorsInterested === 'string' ? 
            profileData.investorsInterested.split(',').filter(Boolean) : 
            profileData.investorsInterested) : [],
      };

      // Remove password field from userData before saving
      delete userData.password;

      const user = await storage.createUser(userData);

      // Log user behavior tracking for onboarding completion
      try {
        await storage.trackUserBehavior({
          userId: user.id,
          actionType: 'onboarding_completed',
          page: '/onboard',
          metadata: {
            userType: profileData.userType,
            country: profileData.country,
            completionPercentage: profileData.profileCompleteness || 100,
            onboardingDuration: Date.now(),
            deviceType: profileData.deviceType,
            referralSource: profileData.referralSource
          }
        });
      } catch (trackingError) {
        console.warn('User behavior tracking failed:', trackingError);
      }

      const { hashedPassword: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        message: "Comprehensive profile created successfully", 
        user: userWithoutPassword,
        redirectTo: profileData.userType === 'student' ? '/student-dashboard' : 
                   profileData.userType === 'business' ? '/business-dashboard' : '/dashboard'
      });
    } catch (error) {
      console.error("Comprehensive registration error:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  // Social OAuth routes for onboarding
  app.get('/api/auth/google', (req, res) => {
    const redirectUrl = req.query.redirect || '/';
    // In production, redirect to Google OAuth
    // For demo, redirect to callback with demo data
    const params = new URLSearchParams({
      code: 'demo_code',
      state: 'demo_state'
    });
    res.redirect(`/api/auth/callback/google?${params.toString()}&redirect=${encodeURIComponent(redirectUrl as string)}`);
  });

  app.get('/api/auth/github', (req, res) => {
    const redirectUrl = req.query.redirect || '/';
    const params = new URLSearchParams({
      code: 'demo_code',
      state: 'demo_state'
    });
    res.redirect(`/api/auth/callback/github?${params.toString()}&redirect=${encodeURIComponent(redirectUrl as string)}`);
  });

  app.get('/api/auth/linkedin', (req, res) => {
    const redirectUrl = req.query.redirect || '/';
    const params = new URLSearchParams({
      code: 'demo_code',
      state: 'demo_state'
    });
    res.redirect(`/api/auth/callback/linkedin?${params.toString()}&redirect=${encodeURIComponent(redirectUrl as string)}`);
  });

  // OAuth callbacks (demo implementation)
  app.get('/api/auth/callback/:provider', (req, res) => {
    const { provider } = req.params;
    const redirectUrl = req.query.redirect || '/';
    
    // Demo social login data
    const demoData = {
      google: { 
        firstName: 'John',
        lastName: 'Doe', 
        email: 'john.doe@gmail.com',
        organization: 'Google Workspace',
        experience: 'Professional'
      },
      github: { 
        firstName: 'Alex',
        lastName: 'Developer', 
        email: 'alex.dev@users.noreply.github.com',
        organization: 'Open Source Community',
        sector: 'Technology'
      },
      linkedin: { 
        firstName: 'Sarah',
        lastName: 'Professional', 
        email: 'sarah.pro@company.com',
        organization: 'Professional Network',
        experience: 'Senior Level'
      }
    };
    
    const userData = demoData[provider as keyof typeof demoData];
    const params = new URLSearchParams({
      auth_success: 'true',
      provider: provider,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      organization: userData.organization,
      experience: userData.experience || '',
      sector: userData.sector || ''
    });
    
    res.redirect(`${redirectUrl}?${params.toString()}`);
  });

  // User creation endpoint for chat-based onboarding
  app.post('/api/users', async (req, res) => {
    try {
      const userData = req.body;
      
      // Create user with enhanced profile data
      const user = await storage.createUser({
        id: `user_${Date.now()}`,
        email: userData.email,
        fullName: `${userData.firstName} ${userData.lastName}`,
        hashedPassword: userData.hashedPassword,
        isActive: true,
        isSuperuser: false,
        organizationId: null
      });

      res.json({ 
        user, 
        message: 'User profile created successfully',
        personalizedReady: true 
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user profile' });
    }
  });

  // Get user profile
  app.get("/api/user/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (user) {
        res.json({
          id: user.id,
          fullName: `${user.firstName} ${user.lastName}`,
          country: user.country,
          sector: user.sector,
          organizationType: user.organizationType,
          credits: user.credits
        });
      } else {
        res.json({
          id: 'demo_user',
          fullName: 'Demo User',
          country: 'UG',
          sector: 'Health',
          organizationType: 'NGO',
          credits: 1000
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get user profile" });
    }
  });

  // Wabden Admin API Routes
  app.get('/api/wabden/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ success: true, users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/wabden/users', async (req, res) => {
    try {
      const { email, firstName, lastName, userType, credits } = req.body;
      
      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        userType: userType || 'user',
        credits: credits || 100,
        fullName: `${firstName} ${lastName}`,
        password: 'temp_password_' + Date.now(),
        organization: null,
        country: null,
        sector: null,
        organizationType: null,
        isBanned: false,
        isActive: true,
        isSuperuser: false,
        organizationId: null
      });

      res.json({ success: true, user: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.post('/api/wabden/users/:id/toggle-ban', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await storage.updateUser(id, {
        isBanned: !user.isBanned
      });

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });
}
