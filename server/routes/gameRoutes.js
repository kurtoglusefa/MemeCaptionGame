import express from 'express';
import { getRandomMeme } from '../memeDAO.js';
import { getCaptionsByMemeId } from '../captionDAO.js';
import { saveScore, recordGameHistory } from '../scoreDAO.js';

const router = express.Router();

router.get('/start', async (req, res) => {
  try {
    const meme = await getRandomMeme();
    const captions = await getCaptionsByMemeId(meme.id);
    if (!captions || captions.length === 0) {
      return res.status(500).send({ error: 'No captions found for this meme' });
    }
    res.send({ meme, captions });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch meme or captions' });
  }
});

router.get('/nextMeme', async (req, res) => {
  try {
    const meme = await getRandomMeme();
    const captions = await getCaptionsByMemeId(meme.id);
    if (captions.length < 2) throw new Error('Not enough captions found for this meme');
    res.send({ meme, captions });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post('/submitAnswer', async (req, res) => {
  const { userId, memeId, captionId } = req.body;
  try {
    const captions = await getCaptionsByMemeId(memeId);
    if (!captions || captions.length === 0) {
      return res.status(500).send({ error: 'No captions found for this meme' });
    }
    const correctCaptions = captions.filter(caption => caption.is_best_match).map(caption => caption.id);
    const score = correctCaptions.includes(captionId) ? 5 : 0;
    await saveScore(userId, memeId, score);
    res.send({ score });
  } catch (error) {
    res.status(500).send({ error: 'Failed to process submitAnswer request' });
  }
});

router.post('/recordGameHistory', async (req, res) => {
  const { userId, memeId, captionId, score } = req.body;
  try {
    const result = await recordGameHistory(userId, memeId, captionId, score);
    res.send({ message: 'Game history recorded successfully', result });
  } catch (error) {
    res.status(500).send({ error: 'Failed to record game history' });
  }
});

export default router;
