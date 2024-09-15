import React, { createContext, useState, useContext } from 'react';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };

  const completeTask = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  const tasksRemaining = tasks.filter((task) => !task.completed).length;
  const tasksCompleted = tasks.filter((task) => task.completed).length;

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, completeTask, tasksRemaining, tasksCompleted }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;
