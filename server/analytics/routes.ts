import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Analytics routes are working!' });
});

// Add more analytics-specific routes here

export default router;
