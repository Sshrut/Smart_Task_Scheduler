import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackButton from './BackButton';
import './TaskInputForm.css';

const TaskInputForm = () => {
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!task.trim()) {
      alert('Please enter a task description');
      return;
    }

    const dateTimeString = date && time ? `${date}T${time}` : date || null;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/add-task`,
        { task, date: dateTimeString, priority },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.status === 201) {
        alert('Task added successfully!');
        setTask('');
        setDate('');
        setTime('');
        setPriority('medium');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  // Get the current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="task-input-container">
      <BackButton />
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="task">Task Description *</label>
          <input
            type="text"
            id="task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Due Date</label>
          <input
            type="date"
            id="date"
            value={date}
            min={getCurrentDate()}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">Due Time</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <button type="submit" className="submit-btn">Add Task</button>
      </form>
      <button className="view-tasks-btn" onClick={() => navigate('/view-tasks')}>View Tasks</button>
    </div>
  );
};

export default TaskInputForm;
