import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerPaymentRoutes } from "../payments/routes";
import { setupAuth, requireAuth } from "../auth/auth";
import session from "express-session";

import { registerProposalRoutes } from "../proposals/routes";
import { registerDonorRoutes } from "../donors/routes";
import { registerUserRoutes } from "../users/routes";
import { registerStudentRoutes } from "../students/routes";
import { registerBusinessRoutes } from "../business/routes";
import { registerAdminRoutes } from "../admin/routes";
import { registerBotRoutes } from "../bots/routes";
import { registerAnalyticsRoutes } from "../analytics/routes";
import { registerNotificationRoutes } from "../notifications/routes";
import { registerAssistantRoutes } from "../assistant/routes";
import { registerNetworkRoutes } from "../network/routes";
import { registerPersonalizedRoutes } from "../personalized/routes";
import { registerSystemRoutes } from "../system/routes";
import { registerDashboardRoutes } from "../dashboard/routes";
import { registerErrorLoggingRoutes } from "../utils/error_logging";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Setup social authentication
  setupAuth(app);
  
  // Register payment processing routes
  registerPaymentRoutes(app);

  // Register proposal routes
  registerProposalRoutes(app);

  // Register donor routes
  registerDonorRoutes(app);

  // Register user routes
  registerUserRoutes(app);

  // Register student routes
  registerStudentRoutes(app);

  // Register business routes
  registerBusinessRoutes(app);

  // Register admin routes
  registerAdminRoutes(app);

  // Register bot routes
  registerBotRoutes(app);

  // Register analytics routes
  registerAnalyticsRoutes(app);

  // Register notification routes
  registerNotificationRoutes(app);

  // Register assistant routes
  registerAssistantRoutes(app);

  // Register network routes
  registerNetworkRoutes(app);

  // Register personalized routes
  registerPersonalizedRoutes(app);

  // Register system routes
  registerSystemRoutes(app);

  // Register dashboard routes
  registerDashboardRoutes(app);

  // Register error logging routes
  registerErrorLoggingRoutes(app);

  const server = createServer(app);
  return server;
}