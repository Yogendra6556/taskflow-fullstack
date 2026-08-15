import React, { useState, useEffect } from 'react';
import { fetchBoard, createTask, updateTask, moveTask, deleteTask } from './services/api';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';

export default function App() {
  const [boardData, setBoardData] = useState({ board: null, columns: [] });
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [activeColId, setActiveColId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setErrorMsg('');
      const data = await fetchBoard();
      setBoardData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Server error. Make sure backend is running.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTask = async (taskPayload) => {
    try {
      if (taskPayload.id) {
        await updateTask(taskPayload.id, taskPayload);
      } else {
        await createTask(taskPayload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (taskId, columnId) => {
    try {
      await moveTask(taskId, columnId);
      loadData();
    } catch (err) {
      alert('Error moving task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      loadData();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 12px', fontSize: '26px' }}>TaskFlow Board</h1>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', width: '220px' }}
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', maxWidth: '1200px', margin: '0 auto 20px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Kanban Board Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {boardData.columns.map((col) => {
          const visibleTasks = col.tasks.filter((t) => {
            const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesPriority && matchesSearch;
          });

          return (
            <div key={col.id} style={{ background: '#f1f5f9', borderRadius: '8px', padding: '16px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  {col.name} <span style={{ fontSize: '12px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>{visibleTasks.length}</span>
                </h3>
                <button
                  onClick={() => { setActiveTask(null); setActiveColId(col.id); setModalOpen(true); }}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                >
                  + Add
                </button>
              </div>

              <div>
                {visibleTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    columns={boardData.columns}
                    onEdit={(task) => { setActiveTask(task); setModalOpen(true); }}
                    onDelete={handleDelete}
                    onMove={handleMove}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={activeTask}
        columnId={activeColId}
      />
    </div>
  );
}
