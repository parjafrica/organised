import { Router, type Express } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Notifications routes are working!' });
});

// Add more notification-specific routes here

export function registerNotificationRoutes(app: Express) {
  app.use('/api/notifications', router);
}
