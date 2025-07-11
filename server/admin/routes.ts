import { Router, type Express } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Admin routes are working!' });
});

// Add more admin-specific routes here

export function registerAdminRoutes(app: Express) {
  app.use('/api/admin', router);
}
