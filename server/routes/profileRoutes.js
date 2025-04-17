import express from 'express';
import { getScoresByUserId, getTotalScoreByUserId } from '../scoreDAO.js';

const router = express.Router();

router.get('/:userId/scores', async (req, res) => {
  const userId = req.params.userId;
  try {
    const scores = await getScoresByUserId(userId);
    if (!scores) return res.status(404).json({ error: 'Scores not found' });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

router.get('/:userId/totalScore', async (req, res) => {
  const userId = req.params.userId;
  try {
    const totalScore = await getTotalScoreByUserId(userId);
    res.json({ totalScore });
  } catch (error) {
    res.status(500).send('Failed to fetch total score');
  }
});

export default router;
