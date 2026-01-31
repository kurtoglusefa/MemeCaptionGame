import React from 'react';
import { Button } from 'design-react-kit';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column gap-5">
      <section className="card-elevated p-4 p-lg-5">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-6">
            <h1 className="display-5 fw-bold mb-3">Caption the meme. Beat the clock.</h1>
            <p className="lead text-muted-soft mb-4">
              Pick the best caption from 7 options. You have 30 seconds per meme
              and 3 rounds to stack your score.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Button color="primary" tag={Link} to={user ? '/game' : '/login'}>
                {user ? 'Start a New Game' : 'Log in to Play'}
              </Button>
              <Button color="secondary" outline tag={Link} to="/profile">
                View Profile
              </Button>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <img
              src="/wa1.png"
              alt="Meme preview"
              className="img-fluid rounded-4 shadow"
            />
          </div>
        </div>
      </section>

      <section className="row g-3">
        {[
          {
            title: 'Pick fast',
            text: 'A round ends when you choose or time runs out.',
          },
          {
            title: 'Score smart',
            text: 'Only the best captions score. Nail it for 5 points.',
          },
          {
            title: 'Track your run',
            text: 'Review your last games and round-by-round results.',
          },
        ].map((item) => (
          <div key={item.title} className="col-12 col-md-4">
            <div className="card-elevated p-4 h-100">
              <h3 className="h5 fw-semibold">{item.title}</h3>
              <p className="text-muted-soft mb-0">{item.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
