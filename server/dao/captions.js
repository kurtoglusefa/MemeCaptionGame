import { all } from '../db.js';

export const getCaptionsForMeme = (memeId) =>
  all(
    `SELECT captions.id,
            captions.text,
            MAX(meme_captions.is_best_match) AS is_best_match
     FROM captions
     JOIN meme_captions ON captions.id = meme_captions.caption_id
     WHERE meme_captions.meme_id = ?
     GROUP BY captions.id, captions.text`,
    [memeId]
  );
