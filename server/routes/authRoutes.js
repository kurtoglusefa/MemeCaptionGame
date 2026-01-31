import express from 'express';
import passport from 'passport';
import { ensureAuthenticated } from '../middleware.js';
import { sanitizeUser } from '../dao/users.js';

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send({ message: 'Logged in', user: sanitizeUser(req.user) });
});

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.send({ message: 'Logged out' });
  });
});

router.get('/user', ensureAuthenticated, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

export default router;
