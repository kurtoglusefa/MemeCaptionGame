'use strict';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('meme.db');


const startGame = async () => {
  try {
    const meme = await getRandomMeme();
    const captions = await getRandomCaptions();
    return { meme, captions };
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};


const getRandomCaptions = async () => {
  const query = 'SELECT id, text FROM captions ORDER BY RANDOM() LIMIT 7;';
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};



function getRandomMeme() {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM memes ORDER BY RANDOM() LIMIT 1', [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}



function getMemeById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM memes WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}



function getAllMemes() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM memes', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = { getRandomMeme, getMemeById, getAllMemes, startGame, getRandomCaptions };
