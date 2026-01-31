import React from 'react';
import { Button } from 'design-react-kit';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="card-elevated p-5 text-center">
    <h2 className="h3 fw-semibold mb-2">Page not found</h2>
    <p className="text-muted-soft mb-4">
      The page you are looking for does not exist.
    </p>
    <Button color="primary" tag={Link} to="/">
      Go home
    </Button>
  </div>
);

export default NotFound;
