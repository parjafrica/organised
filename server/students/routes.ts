import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ message: 'Students routes are working!' });
});

// Add more student-specific routes here

export default router;
