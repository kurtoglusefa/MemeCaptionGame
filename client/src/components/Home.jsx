import React from 'react';
import { Link } from 'react-router-dom';
import '../Home.css';

function Home() {
  return (
    <div className="home-container">
      <img src="/wa1.png" alt="Meme Image" className="app-image" />
      <h1 className="app-name">Welcome to What Do You Meme?</h1>
      <nav className="nav-links">
        <Link to="/login" className="nav-link">Login</Link>
        <span className="separator"> - </span>
        <Link to="/game" className="nav-link">Play Game</Link>
        <span className="separator"> - </span>
        <Link to="/profile" className="nav-link">Profile</Link>
      </nav>
    </div>
  );
}

export default Home;
