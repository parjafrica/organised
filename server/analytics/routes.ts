import { Router, type Express } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Analytics routes are working!' });
});

// Add more analytics-specific routes here

export function registerAnalyticsRoutes(app: Express) {
  app.use('/api/analytics', router);
}
