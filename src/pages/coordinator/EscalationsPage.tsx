import React, { useState } from 'react';
import { AlertTriangle, Clock, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function EscalationsPage() {
  // Mock data
  const initialEscalations = [
    { id: '1', student: 'Alice Johnson', issue: 'Mentor unresponsive for 2 weeks', priority: 'High', status: 'New', date: '2023-10-01' },
    { id: '2', student: 'Bob Smith', issue: 'Schedule conflict with mentor', priority: 'Medium', status: 'New', date: '2023-10-02' },
    { id: '3', student: 'Charlie Davis', issue: 'Requesting mentor change', priority: 'High', status: 'In Progress', date: '2023-09-28' },
    { id: '4', student: 'Diana Prince', issue: 'Technical issue with platform', priority: 'Low', status: 'In Progress', date: '2023-09-29' },
    { id: '5', student: 'Evan Wright', issue: 'Missed orientation session', priority: 'Medium', status: 'Resolved', date: '2023-09-20' },
    { id: '6', student: 'Fiona Gallagher', issue: 'Feedback not provided', priority: 'Low', status: 'Resolved', date: '2023-09-15' },
  ];

  const [escalations] = useState(initialEscalations);
  const [filter, setFilter] = useState('All');

  const getPriorityBadgeVariant = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const renderColumn = (title: string, status: string, color: string) => {
    const colItems = escalations.filter(e => e.status === status && (filter === 'All' || e.priority === filter));

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: color }}></span>
            {title}
          </h3>
          <Badge variant="default">{colItems.length}</Badge>
        </div>

        {colItems.map(item => (
          <div 
            key={item.id} 
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
              e.currentTarget.style.borderColor = color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <Badge variant={getPriorityBadgeVariant(item.priority) as any}>{item.priority}</Badge>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <MoreVertical size={16} />
              </button>
            </div>
            
            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{item.student}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: 1.4 }}>{item.issue}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Clock size={12} />
                {new Date(item.date).toLocaleDateString()}
              </div>
              <Button variant="ghost" size="sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: color }}>
                Take Action
              </Button>
            </div>
          </div>
        ))}

        {colItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No escalations
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-body)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <AlertTriangle size={24} color="var(--accent-red)" />
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.8rem' }}>
            Escalation Queue
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              background: 'var(--bg-surface)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              padding: '0.5rem 1rem',
              outline: 'none'
            }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '1.5rem', minHeight: '600px' }}>
        {renderColumn('New', 'New', 'var(--accent-cyan)')}
        {renderColumn('In Progress', 'In Progress', 'var(--accent-amber)')}
        {renderColumn('Resolved', 'Resolved', 'var(--accent-green)')}
      </div>
    </div>
  );
}
