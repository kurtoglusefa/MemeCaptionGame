export function errorHandler(err, req, res, next) {
    res.status(500).send({ error: err.message });
  }
  
  export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).send({ error: 'Unauthorized' });
  }
  