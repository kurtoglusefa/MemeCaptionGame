import express from 'express';
import { ensureAuthenticated } from '../middleware.js';
import { getRandomMeme } from '../dao/memes.js';
import { getCaptionsForMeme } from '../dao/captions.js';
import {
  addRound,
  createGame,
  finishGame,
  getGameById,
  getGameTotalScore,
  getRoundCount,
  getUsedMemeIds,
} from '../dao/games.js';

const router = express.Router();

const MAX_ROUNDS = 3;
const MAX_TIME_SECONDS = 30;
const CORRECT_SCORE = 5;

const serializeCaptions = (captions) =>
  captions.map((caption) => ({ id: caption.id, text: caption.text }));

const getBestMatches = (captions) =>
  captions.filter((caption) => caption.is_best_match).map((caption) => ({
    id: caption.id,
    text: caption.text,
  }));

const buildNextRound = async (excludeMemeIds = []) => {
  let meme = await getRandomMeme(excludeMemeIds);
  if (!meme && excludeMemeIds.length > 0) {
    meme = await getRandomMeme();
  }
  if (!meme) {
    throw new Error('No meme available');
  }
  const captions = await getCaptionsForMeme(meme.id);
  if (!captions || captions.length === 0) {
    throw new Error('No captions found for this meme');
  }
  return { meme, captions: serializeCaptions(captions) };
};

router.use(ensureAuthenticated);

router.post('/start', async (req, res) => {
  try {
    const gameId = await createGame(req.user.id, MAX_ROUNDS);
    const firstRound = await buildNextRound();
    res.send({
      gameId,
      round: 1,
      totalRounds: MAX_ROUNDS,
      ...firstRound,
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to start game' });
  }
});

router.post('/answer', async (req, res) => {
  const { gameId, memeId, captionId, timeTaken } = req.body;
  if (!gameId || !memeId) {
    return res.status(400).send({ error: 'gameId and memeId are required' });
  }

  try {
    const normalizedGameId = Number(gameId);
    const normalizedMemeId = Number(memeId);
    const normalizedCaptionId =
      captionId !== undefined && captionId !== null ? Number(captionId) : null;

    const game = await getGameById(normalizedGameId);
    if (!game) {
      return res.status(404).send({ error: 'Game not found' });
    }
    if (game.user_id !== req.user.id) {
      return res.status(403).send({ error: 'Forbidden' });
    }

    const captions = await getCaptionsForMeme(normalizedMemeId);
    if (!captions || captions.length === 0) {
      return res.status(500).send({ error: 'No captions found for this meme' });
    }

    const bestMatchIds = captions
      .filter((caption) => caption.is_best_match)
      .map((caption) => caption.id);

    const answeredCorrectly = Boolean(
      normalizedCaptionId && bestMatchIds.includes(normalizedCaptionId)
    );
    const normalizedTime =
      typeof timeTaken === 'number'
        ? timeTaken
        : timeTaken !== undefined && timeTaken !== null
          ? Number(timeTaken)
          : null;
    const inTime = normalizedTime !== null ? normalizedTime <= MAX_TIME_SECONDS : true;
    const score = answeredCorrectly && inTime ? CORRECT_SCORE : 0;

    await addRound({
      gameId: normalizedGameId,
      memeId: normalizedMemeId,
      captionId: normalizedCaptionId,
      isCorrect: answeredCorrectly,
      score,
      timeTaken: normalizedTime,
    });

    const roundsPlayed = await getRoundCount(normalizedGameId);
    const totalScore = await getGameTotalScore(normalizedGameId);
    const gameOver = roundsPlayed >= (game.rounds_total || MAX_ROUNDS);

    let nextRound = null;
    if (gameOver) {
      await finishGame(normalizedGameId, totalScore);
    } else {
      const usedMemeIds = await getUsedMemeIds(normalizedGameId);
      const upcomingRound = roundsPlayed + 1;
      nextRound = { round: upcomingRound, ...(await buildNextRound(usedMemeIds)) };
    }

    res.send({
      round: roundsPlayed,
      score,
      totalScore,
      answeredCorrectly,
      bestMatches: getBestMatches(captions),
      gameOver,
      nextRound,
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to submit answer' });
  }
});

export default router;
