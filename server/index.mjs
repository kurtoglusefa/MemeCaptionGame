'use strict';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { getUserByUsername } from './userDAO.js';
import { getRandomMeme, getMemeById, getAllMemes } from './memeDAO.js';
import { getCaptionsByMemeId, getCaptionById } from './captionDAO.js';
import { saveScore, getScoresByUserId, getTotalScoreByUserId, recordGameHistory } from './scoreDAO.js';
import crypto from 'crypto';


const app = express();
app.use(bodyParser.json());


const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));




app.use(session({
  secret: 'sshh... it is secret.',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy((username, password, done) => {
  getUserByUsername(username).then(user => {
    if (!user) {
      console.log('User not found');
      return done(null, false, { message: 'Incorrect username.' });
    }
    const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    if (hashedPassword !== user.hash) {
      console.log('Incorrect password');
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  }).catch(err => {
    console.error('Error in getUserByUsername:', err);
    done(err);
  });
}));


passport.serializeUser((user, done) => {
  done(null, user.username);
});


passport.deserializeUser((username, done) => {
  getUserByUsername(username).then(user => {
    done(null, user);
  }).catch(err => done(err));
});



app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
  res.send({ message: 'Logged in' });
});


app.post('/api/auth/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.send({ message: 'Logged out' });
  });
});



app.get('/api/auth/user', (req, res) => {
  const loggedInUser = req.user;

  if (loggedInUser) {
    getUserByUsername(loggedInUser.username)
      .then(user => {
        if (user) {
          res.json(user);
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      })
      .catch(err => {
        console.error('Error retrieving user:', err);
        res.status(500).json({ error: 'Internal server error' });
      });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});


app.get('/api/game/start', (req, res) => {
  getRandomMeme().then(meme => {
    if (!meme) {
      console.error('No meme found');
      return res.status(500).send({ error: 'No meme found' });
    }

    getCaptionsByMemeId(meme.id).then(captions => {
      if (!captions || captions.length === 0) {
        console.error(`No captions found for memeId: ${meme.id}`);
        return res.status(500).send({ error: 'No captions found for this meme' });
      }
      res.send({ meme, captions });
    }).catch(error => {
      console.error('Error fetching captions:', error);
      res.status(500).send({ error: 'Failed to fetch captions' });
    });
  }).catch(error => {
    console.error('Error fetching meme:', error);
    res.status(500).send({ error: 'Failed to fetch meme' });
  });
});



app.get('/api/game/nextMeme', (req, res) => {
  getRandomMeme()
    .then(meme => {
      return getCaptionsByMemeId(meme.id)
        .then(captions => {
          if (captions.length < 2) {
            throw new Error('Not enough captions found for this meme');
          }
          res.send({ meme, captions });
        });
    })
    .catch(error => {
      console.error('Error fetching next meme and captions:', error);
      res.status(500).send({ error: error.message });
    });
});



app.post('/api/game/submitAnswer', async (req, res) => {
  const { userId, memeId, captionId } = req.body;

  try {
    const captions = await getCaptionsByMemeId(memeId);

    if (!captions || captions.length === 0) {
      return res.status(500).send({ error: 'No captions found for this meme' });
    }

    const correctCaptions = captions.filter(caption => caption.is_best_match).map(caption => caption.id);
    const score = correctCaptions.includes(captionId) ? 5 : 0;

    await saveScore(userId, memeId, score);

    res.send({ score }); 

  } catch (error) {
    console.error('Error processing submitAnswer request:', error);
    res.status(500).send({ error: 'Failed to process submitAnswer request' });
  }
});



app.post('/api/game/recordGameHistory', async (req, res) => {
  const { userId, memeId, captionId, score } = req.body;

  try {
    const result = await recordGameHistory(userId, memeId, captionId, score);
    console.log('Game history recorded successfully:', result);
    res.send({ message: 'Game history recorded successfully', result });
  } catch (error) {
    console.error('Error recording game history:', error);
    res.status(500).send({ error: 'Failed to record game history' });
  }
});




app.get('/api/profile/:userId/scores', async (req, res) => {
  const userId = req.params.userId;

  try {
    const scores = await getScoresByUserId(userId);
    if (!scores) {
      return res.status(404).json({ error: 'Scores not found' });
    }
    res.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});



app.get('/api/profile/:userId/totalScore', async (req, res) => {
  const userId = req.params.userId;
  try {
    const totalScore = await getTotalScoreByUserId(userId);
    res.json({ totalScore });
  } catch (error) {
    console.error('Failed to fetch total score:', error);
    res.status(500).send('Failed to fetch total score');
  }
});



// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

