import express from 'express';
import passport from 'passport';
import { getUserByUsername } from '../userDAO.js';

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send({ message: 'Logged in' });
});

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.send({ message: 'Logged out' });
  });
});

router.get('/user', (req, res) => {
  if (req.user) {
    getUserByUsername(req.user.username)
      .then(user => res.json(user))
      .catch(err => res.status(500).json({ error: 'Internal server error' }));
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
