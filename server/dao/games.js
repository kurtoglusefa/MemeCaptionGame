import { all, get, run } from '../db.js';

export const createGame = async (userId, roundsTotal = 3) => {
  const result = await run(
    'INSERT INTO games (user_id, rounds_total) VALUES (?, ?)',
    [userId, roundsTotal]
  );
  return result.lastID;
};

export const getGameById = (gameId) =>
  get('SELECT * FROM games WHERE id = ?', [gameId]);

export const addRound = async ({
  gameId,
  memeId,
  captionId,
  isCorrect,
  score,
  timeTaken,
}) =>
  run(
    `INSERT INTO rounds (game_id, meme_id, caption_id, is_correct, score, time_taken)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [gameId, memeId, captionId ?? null, isCorrect ? 1 : 0, score, timeTaken ?? null]
  );

export const getRoundCount = async (gameId) => {
  const row = await get(
    'SELECT COUNT(*) AS count FROM rounds WHERE game_id = ?',
    [gameId]
  );
  return row?.count ?? 0;
};

export const getUsedMemeIds = async (gameId) => {
  const rows = await all('SELECT meme_id FROM rounds WHERE game_id = ?', [
    gameId,
  ]);
  return rows.map((row) => row.meme_id);
};

export const getGameTotalScore = async (gameId) => {
  const row = await get(
    'SELECT COALESCE(SUM(score), 0) AS totalScore FROM rounds WHERE game_id = ?',
    [gameId]
  );
  return row?.totalScore ?? 0;
};

export const finishGame = async (gameId, totalScore) =>
  run('UPDATE games SET ended_at = datetime("now"), total_score = ? WHERE id = ?', [
    totalScore,
    gameId,
  ]);
