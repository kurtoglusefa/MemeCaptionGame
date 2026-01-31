import { get } from '../db.js';

export const getRandomMeme = async (excludeIds = []) => {
  const baseSql = 'SELECT id, image_url FROM memes';
  if (excludeIds.length === 0) {
    return get(`${baseSql} ORDER BY RANDOM() LIMIT 1`);
  }
  const placeholders = excludeIds.map(() => '?').join(',');
  const sql = `${baseSql} WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`;
  return get(sql, excludeIds);
};

export const getMemeById = (id) =>
  get('SELECT id, image_url FROM memes WHERE id = ?', [id]);
