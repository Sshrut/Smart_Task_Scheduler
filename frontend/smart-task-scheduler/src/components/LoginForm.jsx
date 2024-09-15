import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log(`Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        localStorage.setItem('authToken', data.token);
        onLogin(username); // Pass the username to onLogin
        navigate('/dashboard'); // Redirect to dashboard after successful login
      } else {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Invalid username or password');
    }
  };

  const redirectToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-form">
      <div className="login-card">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <button onClick={redirectToRegister}>Go to Register</button>
      </div>
    </div>
  );
};

export default LoginForm;
