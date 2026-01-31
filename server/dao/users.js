import { get } from '../db.js';

export const getUserByUsername = (username) =>
  get('SELECT id, username, salt, hash FROM users WHERE username = ?', [username]);

export const getUserById = (id) =>
  get('SELECT id, username, salt, hash FROM users WHERE id = ?', [id]);

export const sanitizeUser = (user) => {
  if (!user) return null;
  return { id: user.id, username: user.username };
};
