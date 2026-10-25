import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [tasks, setTasks] = useState([]);
  
  // Auth Form State
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'User' });

  // Task Form State
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, authForm);
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser({});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/tasks`, taskForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([res.data, ...tasks]);
      setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleMoveStatus = async (id, newStatus) => {
    try {
      const res = await axios.patch(`${API_URL}/tasks/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', fontFamily: 'Arial', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>{isRegister ? 'Register Account' : 'TaskFlow Login'}</h2>
        <form onSubmit={handleAuth}>
          {isRegister && (
            <input 
              type="text" 
              placeholder="Name" 
              value={authForm.name}
              onChange={e => setAuthForm({...authForm, name: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            value={authForm.email}
            onChange={e => setAuthForm({...authForm, email: e.target.value})}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={authForm.password}
            onChange={e => setAuthForm({...authForm, password: e.target.value})}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            required 
          />
          {isRegister && (
            <select 
              value={authForm.role}
              onChange={e => setAuthForm({...authForm, role: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          )}
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer' }}>
          {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0284c7', color: '#fff', padding: '10px 20px', borderRadius: '5px' }}>
        <h2>TaskFlow App Header | User Avatar (Role: {user.role})</h2>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '3px' }}>Logout</button>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Task title (min 3 chars)..." 
          value={taskForm.title}
          onChange={e => setTaskForm({...taskForm, title: e.target.value})}
          style={{ flex: 2, padding: '8px' }}
          required 
        />
        <input 
          type="text" 
          placeholder="Description..." 
          value={taskForm.description}
          onChange={e => setTaskForm({...taskForm, description: e.target.value})}
          style={{ flex: 2, padding: '8px' }}
        />
        <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} style={{ padding: '8px' }}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input 
          type="date" 
          value={taskForm.dueDate}
          onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 20px', background: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer' }}>Add Task</button>
      </form>

      {/* Search Filter */}
      <input 
        type="text" 
        placeholder="Filter tasks by title..." 
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box' }}
      />

      {/* 3-Column Kanban Board */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {['To-Do', 'In-Progress', 'Completed'].map(colStatus => (
          <div key={colStatus} style={{ flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ borderBottom: '2px solid #0284c7', paddingBottom: '8px' }}>{colStatus} Column</h3>
            {filteredTasks.filter(t => t.status === colStatus).map(task => (
              <div key={task._id} style={{ background: '#fff', padding: '12px', marginBottom: '10px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontWeight: 'bold' }}>{task.title}</div>
                <div style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>{task.description}</div>
                <div style={{ fontSize: '12px', margin: '5px 0' }}>Priority: <strong>{task.priority}</strong></div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                  {colStatus !== 'To-Do' && (
                    <button onClick={() => handleMoveStatus(task._id, 'To-Do')} style={{ fontSize: '11px', padding: '3px 6px' }}>← To-Do</button>
                  )}
                  {colStatus !== 'In-Progress' && (
                    <button onClick={() => handleMoveStatus(task._id, 'In-Progress')} style={{ fontSize: '11px', padding: '3px 6px' }}>In-Progress</button>
                  )}
                  {colStatus !== 'Completed' && (
                    <button onClick={() => handleMoveStatus(task._id, 'Completed')} style={{ fontSize: '11px', padding: '3px 6px' }}>Completed →</button>
                  )}
                  <button onClick={() => handleDelete(task._id)} style={{ fontSize: '11px', padding: '3px 6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '3px', marginLeft: 'auto' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}