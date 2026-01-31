import express from 'express';
import { ensureAuthenticated } from '../middleware.js';
import {
  getRecentGames,
  getRecentRounds,
  getUserTotalScore,
} from '../dao/profile.js';

const router = express.Router();

router.use(ensureAuthenticated);

router.get('/me', async (req, res) => {
  try {
    const [totalScore, recentGames, recentRounds] = await Promise.all([
      getUserTotalScore(req.user.id),
      getRecentGames(req.user.id, 5),
      getRecentRounds(req.user.id, 10),
    ]);

    res.json({
      totalScore,
      recentGames,
      recentRounds,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

export default router;
