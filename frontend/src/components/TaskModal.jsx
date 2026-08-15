import React, { useState, useEffect } from 'react';

export default function TaskModal({ isOpen, onClose, onSave, task, columnId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
    }
    setError('');
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }
    onSave({ id: task?.id, title, description, priority, column_id: columnId || task?.column_id });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
        <h3 style={{ margin: '0 0 16px' }}>{task ? 'Edit Task' : 'Create Task'}</h3>
        {error && <div style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Title *</label>
            <input
              type="text"
              style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement API"
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Description</label>
            <textarea
              rows={3}
              style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra details..."
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Priority</label>
            <select
              style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
