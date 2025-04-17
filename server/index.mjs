'use strict';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';

import { getUserByUsername } from './userDAO.js';

// New route imports
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

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
  getUserByUsername(username)
    .then(user => {
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
    })
    .catch(err => {
      console.error('Error in getUserByUsername:', err);
      done(err);
    });
}));

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  getUserByUsername(username)
    .then(user => { done(null, user); })
    .catch(err => done(err));
});

// Mount routes under /api/*
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/profile', profileRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

