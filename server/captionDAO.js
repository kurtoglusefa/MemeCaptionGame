'use strict';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('meme.db');


function getCaptionsByMemeId(memeId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT captions.* FROM captions JOIN meme_captions ON captions.id = meme_captions.caption_id WHERE meme_captions.meme_id = ?", [memeId], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return reject(err);
      }
      if (!rows || rows.length === 0) {
        console.warn(`No captions found for memeId: ${memeId}`);
        return resolve([]); // Resolve with an empty array
      }
      resolve(rows);
    });
  });
}


function getCaptionById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM captions WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}



module.exports = { getCaptionsByMemeId, getCaptionById };
