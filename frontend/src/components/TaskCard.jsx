import React from 'react';

const priorityColors = {
  Low: { bg: '#dcfce7', text: '#15803d' },
  Medium: { bg: '#fef3c7', text: '#b45309' },
  High: { bg: '#fee2e2', text: '#b91c1c' }
};

export default function TaskCard({ task, columns, onEdit, onDelete, onMove }) {
  const currentPriority = priorityColors[task.priority] || priorityColors.Medium;

  return (
    <div style={{ background: '#fff', padding: '14px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', background: currentPriority.bg, color: currentPriority.text }}>
          {task.priority}
        </span>
        <div>
          <button onClick={() => onEdit(task)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#2563eb' }}>✏️</button>
          <button onClick={() => onDelete(task.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#dc2626', marginLeft: '6px' }}>🗑️</button>
        </div>
      </div>
      
      <h4 style={{ margin: '8px 0 4px', fontSize: '15px' }}>{task.title}</h4>
      {task.description && <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px' }}>{task.description}</p>}

      {/* Move Task Control Dropdown */}
      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Move to:</span>
        <select
          value={task.column_id}
          onChange={(e) => onMove(task.id, Number(e.target.value))}
          style={{ fontSize: '12px', padding: '4px', border: '1px solid #d1d5db', borderRadius: '4px' }}
        >
          {columns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
