import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const HomePage = ({ onLogout, username }) => {
  const [remainingTasks, setRemainingTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    console.log('Username received in HomePage:', username); // Add this line for debugging
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const tasks = response.data.tasks;
        setRemainingTasks(tasks.filter(task => !task.completed).length);
        setCompletedTasks(tasks.filter(task => task.completed).length);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    fetchTasks();
  }, [username]); // Add username to the dependency array

  return (
    <div className="home-page">
      <div className="header">
        <h1>Smart Task Scheduler</h1>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
      <div className="content-card">
        <h2>Welcome, {username}!</h2>
        <nav className="nav-menu">
          <Link to="/add-task" className="nav-link">Add New Task</Link>
          <Link to="/view-tasks" className="nav-link">View Tasks</Link>
        </nav>
        <div className="dashboard-content">
          <h2>Your Dashboard</h2>
          <p>Manage your tasks efficiently with Smart Task Scheduler.</p> 
          <p>Use the navigation above to add new tasks or view your existing tasks.</p>
          <div className="task-stats">
            <div className="task-card task-remaining">
              <div className="task-label">Tasks Remaining</div>
              <div className="task-number">{remainingTasks}</div>
            </div>
            <div className="task-card task-completed">
              <div className="task-label">Tasks Completed</div>
              <div className="task-number">{completedTasks}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
