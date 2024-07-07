'use strict';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('meme.db');

dayjs.extend(utc);
dayjs.extend(timezone);

function saveScore(userId, memeId, score) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO scores (user_id, meme_id, score) VALUES (?, ?, ?)', [userId, memeId, score], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, userId, memeId, score });
      }
    });
  });
}



function getScoresByUserId(userId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT scores.*, memes.image_url 
      FROM scores 
      JOIN memes ON scores.meme_id = memes.id 
      WHERE scores.user_id = ?
    `;
    db.all(query, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}




function getTotalScoreByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT SUM(score) AS totalScore FROM scores WHERE user_id = ?', [userId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.totalScore);
      }
    });
  });
}



async function recordGameHistory(userId, memeId, captionId, score) {
  if (score === undefined) {
    throw new Error('Score is required for recording game history');
  }

  const timestamp = new Date().toISOString();

  // Assuming we are using SQLite with a query to insert into game_history table
  const result = await db.run(
    'INSERT INTO game_history (user_id, meme_id, caption_id, score, timestamp) VALUES (?, ?, ?, ?, ?)',
    [userId, memeId, captionId, score, timestamp]
  );

  return result;
}




module.exports = { saveScore, getScoresByUserId, getTotalScoreByUserId, recordGameHistory };
