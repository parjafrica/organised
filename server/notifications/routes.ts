import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Notifications routes are working!' });
});

// Add more notification-specific routes here

export default router;
