import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';


function getJson(httpResponsePromise) {
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {
          response.json()
            .then(json => resolve(json))
            .catch(err => reject({ error: "Cannot parse server response" }));
        } else {
          response.json()
            .then(obj => reject(obj))
            .catch(err => reject({ error: "Cannot parse server response" }));
        }
      })
      .catch(err => reject({ error: "Cannot communicate" }));
  });
}


// Authentication APIs
const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  }));
};

const logOut = async () => {
  return getJson(fetch(SERVER_URL + 'auth/logout', {
    method: 'POST',
    credentials: 'include'
  }));
};



// GAME APIs

const startGame = async () => {
  try {
    const response = await fetch(SERVER_URL + 'game/start', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to start the game');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in startGame:', error);
    throw error;
  }
};


const nextMeme = async () => {
  try {
    const response = await fetch(SERVER_URL + 'game/nextMeme', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch next meme');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in nextMeme:', error);
    throw error;
  }
};



const submitAnswer = async (userId, memeId, captionId) => {
  try {

    const response = await fetch(SERVER_URL + 'game/submitAnswer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId, memeId, captionId }),
    });


    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }


    const responseData = await response.json();


    const score = responseData.score || 0;


    await recordGameHistory(userId, memeId, captionId, score);

    return responseData;
  } catch (error) {
    console.error('Error in submitAnswer:', error);
    throw error;
  }
};




const recordGameHistory = async (userId, memeId, captionId, score) => {
  try {

    const timestamp = dayjs().tz(dayjs.tz.guess()).format();

    const historyResponse = await fetch(SERVER_URL + 'game/recordGameHistory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId, memeId, captionId, score, timestamp }),
    });


    if (!historyResponse.ok) {
      throw new Error('Failed to record game history');
    }

    console.log('Game history recorded successfully');
  } catch (error) {
    console.error('Error in recordGameHistory:', error);
    throw error;
  }
};




// PROFILE APIs

const getScoresByUserId = async (userId) => {
  try {
    const response = await fetch(`${SERVER_URL}profile/${userId}/scores`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch scores');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getScoresByUserId:', error);
    throw error;
  }
};




const getTotalScoreByUserId = async (userId) => {
  try {
    const response = await fetch(`${SERVER_URL}profile/${userId}/totalScore`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch total score');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getTotalScoreByUserId:', error);
    throw error;
  }
};




// USER INFO APIs

const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'auth/user', {
    credentials: 'include'
  }));
};




const API = {
  logIn,
  logOut,
  startGame,
  nextMeme,
  submitAnswer,
  getScoresByUserId,
  getTotalScoreByUserId,
  getUserInfo,
  recordGameHistory
};

export default API;

