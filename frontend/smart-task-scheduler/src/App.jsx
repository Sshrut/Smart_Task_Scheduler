import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TaskInputForm from './components/TaskInputForm';
import TaskList from './components/TaskList';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
    localStorage.setItem('username', username); // Store username in localStorage
    console.log('Logged in as:', username);
  };

  const handleRegister = () => {
    // Can add additional steps after registration if required
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username'); // Remove username from localStorage
    setIsLoggedIn(false);
    setUsername('');
  };

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const data = await response.json();
      console.log('API Response:', data);
      if (data && data.username) {
        console.log('Username found:', data.username);
        setUsername(data.username);
        localStorage.setItem('username', data.username); // Ensure username is stored in localStorage
      } else {
        console.log('Username not found in API response:', data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (username) {
      console.log('Username state updated:', username);
    }
  }, [username]);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm onRegister={handleRegister} />} />
          <Route path="/dashboard" element={isLoggedIn ? <HomePage onLogout={handleLogout} username={username} /> : <Navigate to="/login" />} />
          <Route path="/add-task" element={isLoggedIn ? <TaskInputForm /> : <Navigate to="/login" />} />
          <Route path="/view-tasks" element={isLoggedIn ? <TaskList /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
