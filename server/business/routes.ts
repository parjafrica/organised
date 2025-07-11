import { Router, type Express } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Business routes are working!' });
});

// Add more business-specific routes here

export function registerBusinessRoutes(app: Express) {
  app.use('/api/business', router);
}
