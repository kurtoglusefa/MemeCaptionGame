import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import '../Login.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await API.logIn({ username, password });
      console.log('Login response:', response);
      navigate('/game');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
    }
  };

  const handleLogout = async () => {
    try {
      await API.logOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <br />
        <button type="submit" className="login-button">Login</button>
      </form>
      {error && <p className="login-error">{error}</p>}
      <br />
      <button onClick={handleLogout} className="logout-button">Go to the Main Menu</button>
    </div>
  );
}

export default Login;
