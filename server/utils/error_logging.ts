import type { Express } from "express";

export function registerErrorLoggingRoutes(app: Express) {
  // Error logging endpoint for frontend error handling system
  app.post("/api/errors/log", async (req, res) => {
    try {
      const errorContext = req.body;
      
      // Log to console and optionally store in database
      console.error('Frontend Error Logged:', {
        timestamp: new Date().toISOString(),
        errorType: errorContext.errorType,
        message: errorContext.message,
        userFriendlyMessage: errorContext.userFriendlyMessage,
        severity: errorContext.severity,
        page: errorContext.page,
        userAgent: errorContext.userAgent,
        userId: errorContext.userId,
        stackTrace: errorContext.stackTrace
      });

      res.status(200).json({ message: "Error logged successfully" });
    } catch (error) {
      console.error("Error logging failed:", error);
      res.status(500).json({ message: "Error logging failed" });
    }
  });
}
