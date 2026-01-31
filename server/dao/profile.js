import { all, get } from '../db.js';

export const getUserTotalScore = async (userId) => {
  const row = await get(
    `SELECT COALESCE(SUM(rounds.score), 0) AS totalScore
     FROM rounds
     JOIN games ON games.id = rounds.game_id
     WHERE games.user_id = ?`,
    [userId]
  );
  return row?.totalScore ?? 0;
};

export const getRecentGames = (userId, limit = 5) =>
  all(
    `SELECT games.id,
            games.started_at,
            games.ended_at,
            games.total_score,
            games.rounds_total,
            (SELECT COUNT(*) FROM rounds WHERE rounds.game_id = games.id) AS rounds_played
     FROM games
     WHERE games.user_id = ?
     ORDER BY games.started_at DESC
     LIMIT ?`,
    [userId, limit]
  );

export const getRecentRounds = (userId, limit = 10) =>
  all(
    `SELECT rounds.id,
            rounds.game_id,
            rounds.meme_id,
            rounds.caption_id,
            rounds.is_correct,
            rounds.score,
            rounds.time_taken,
            rounds.created_at,
            memes.image_url
     FROM rounds
     JOIN games ON games.id = rounds.game_id
     JOIN memes ON memes.id = rounds.meme_id
     WHERE games.user_id = ?
     ORDER BY rounds.created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
