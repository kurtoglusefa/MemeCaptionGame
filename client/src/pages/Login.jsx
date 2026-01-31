import React, { useState } from 'react';
import { Button } from 'design-react-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ username, password });
      const redirectTo = location.state?.from?.pathname || '/game';
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-5">
        <div className="card-elevated p-4 p-lg-5">
          <h2 className="h4 fw-semibold mb-3">Sign in to play</h2>
          <p className="text-muted-soft mb-4">
            Use one of the demo accounts to jump in immediately.
          </p>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="user1"
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="form-control"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="password1"
                required
              />
            </div>
            <Button color="primary" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-muted-soft">
            Demo users: <strong>user1/password1</strong> or{' '}
            <strong>user2/password2</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
