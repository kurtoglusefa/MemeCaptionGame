import React from 'react';
import { Button } from 'design-react-kit';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const AppHeader = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-bottom bg-white">
      <div className="container d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between py-3 gap-3">
        <Link
          to="/"
          className="d-flex align-items-center gap-3 text-decoration-none"
        >
          <img src="/wa1.png" alt="Meme Game" width="44" height="44" />
          <div>
            <div className="fw-bold">Meme Game</div>
            <small className="text-muted-soft">3 rounds · 30 seconds · 1 best caption</small>
          </div>
        </Link>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button color="primary" outline tag={Link} to="/game">
            Play
          </Button>
          {user ? (
            <>
              <span className="badge badge-soft">Signed in as {user.username}</span>
              <Button color="secondary" outline onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="primary" tag={Link} to="/login">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
