import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackButton from './BackButton';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      console.log('Fetched tasks:', response.data.tasks);
      const priorities = { urgent:1, high: 2, medium: 3, low: 4 };

      // Format tasks including date and time
      const formattedTasks = response.data.tasks.map(task => {
        const [date, time] = task.date.split('T'); // Extract date and time
        let formattedTime = '';
        if (time) {
          const [hour, minute] = time.split(':');
          const date = new Date(0, 0, 0, hour, minute);
          const options = { hour: '2-digit', minute: '2-digit', hour12: true };
          formattedTime = date.toLocaleTimeString([], options);
        }
        return { ...task, date, time: formattedTime };
      });

      // Grouping tasks by date
      const groupedTasks = formattedTasks.reduce((groups, task) => {
        const date = task.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(task);
        return groups;
      }, {});

      // Sorting tasks by time and priority
      Object.keys(groupedTasks).forEach(date => {
        groupedTasks[date].sort((a, b) => {
          if (a.time !== b.time) {
            return a.time.localeCompare(b.time);
          }
          return priorities[a.priority] - priorities[b.priority];
        });
      });

      setTasks(groupedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/update-task/${taskId}`,
        { completed: true },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task. Please try again.');
    }
  };

  const handleUndo = async (taskId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/update-task/${taskId}`,
        { completed: false },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error undoing task completion:', error);
      setError('Failed to undo task completion. Please try again.');
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time ? time.split(':') : [0, 0];
    const date = new Date(0, 0, 0, hour, minute);
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return isNaN(date.getTime()) ? time : date.toLocaleTimeString([], options);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString();
  };

  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-none';
    }
  };

  const isPastDue = (dateStr) => {
    const taskDate = new Date(dateStr);
    return taskDate < new Date();
  };

  if (loading) {
    return <div className="task-list-container"><p>Loading tasks...</p></div>;
  }

  if (error) {
    return <div className="task-list-container"><p className="error-message">{error}</p></div>;
  }

  const sortedDates = Object.keys(tasks).sort((a, b) => new Date(a) - new Date(b));

  const uncompletedTasks = sortedDates.map(date => ({
    date,
    tasks: tasks[date].filter(task => !task.completed),
  })).filter(group => group.tasks.length > 0);

  const completedTasks = sortedDates.map(date => ({
    date,
    tasks: tasks[date].filter(task => task.completed),
  })).filter(group => group.tasks.length > 0);

  return (
    <div className="task-list-container">
      <BackButton />
      <br></br>
      <h2 className="section-heading">Your Tasks</h2>
      {uncompletedTasks.length === 0 ? (
        <p>No tasks found. Start by adding a new task!</p>
      ) : (
        <>
          {uncompletedTasks.map(group => (
            <div key={group.date} className="task-date-group">
              <h3>{formatDate(group.date)}</h3>
              <ul className="task-list">
                {group.tasks.map(task => (
                  <li key={task.id} className={`task-item ${isPastDue(task.date) ? 'past-due' : ''}`}>
                    <div className="task-info">
                      <h3 className="task-title">{task.task}</h3>
                      {task.date && <p className="task-due">Due: {formatDate(task.date)} {formatTime(task.time)}</p>}
                      {isPastDue(task.date) && <p className="past-task-message">This task is pending!</p>}
                      <span className={`priority ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                    </div>
                    <div className="task-actions">
                      <button onClick={() => handleComplete(task.id)} className="complete-btn">
                        Complete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
      {completedTasks.length > 0 && (
        <>
          <h3 className="completed-heading">Completed Tasks</h3>
          {completedTasks.map(group => (
            <div key={group.date} className="completed-task-date-group">
              <h3>{formatDate(group.date)}</h3>
              <ul className="task-list completed-tasks">
                {group.tasks.map((task) => (
                  <li key={task.id} className="task-item completed">
                    <div className="task-info">
                      <h3 className="task-title">{task.task}</h3>
                      {task.date && <p className="task-due">Due: {formatDate(task.date)} {formatTime(task.time)}</p>}
                      <span className={`priority ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                    </div>
                    <div className="task-actions">
                      <button onClick={() => handleUndo(task.id)} className="undo-btn">
                        Mark as Incomplete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TaskList;
