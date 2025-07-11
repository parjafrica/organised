import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Dashboard routes are working!' });
});

// Add more dashboard-specific routes here

export default router;
