import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Business routes are working!' });
});

// Add more business-specific routes here

export default router;
