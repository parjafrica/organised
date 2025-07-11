import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'System routes are working!' });
});

// Add more system-specific routes here

export default router;
