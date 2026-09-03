import React, { useState } from 'react';
import { AlertTriangle, Plus, MessageCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';

export default function EscalationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock data for escalations
  const escalations = [
    { 
      id: '1', 
      student: 'Alice Smith', 
      issue: 'Student has missed 3 consecutive mentoring sessions without prior notice.', 
      priority: 'High', 
      status: 'Open', 
      dateRaised: '2023-10-25',
      coordinator: 'Dr. Robert Chen'
    },
    { 
      id: '2', 
      student: 'Bob Johnson', 
      issue: 'Student reported facing severe personal issues affecting academic performance.', 
      priority: 'Critical', 
      status: 'In Progress', 
      dateRaised: '2023-10-26',
      coordinator: 'Prof. Sarah Williams'
    },
    { 
      id: '3', 
      student: 'Charlie Brown', 
      issue: 'Requesting change of mentorship track due to change in majors.', 
      priority: 'Medium', 
      status: 'Resolved', 
      dateRaised: '2023-10-15',
      coordinator: 'Dr. Robert Chen'
    },
    { 
      id: '4', 
      student: 'Diana Prince', 
      issue: 'Technical difficulties with the portal preventing report submission.', 
      priority: 'Low', 
      status: 'Open', 
      dateRaised: '2023-10-27',
      coordinator: 'IT Support'
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'var(--accent-red)';
      case 'High': return 'var(--accent-amber)';
      case 'Medium': return 'var(--accent-cyan)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', margin: 0 }}>
          <AlertTriangle size={24} color="var(--accent-red)" /> Escalations
        </h1>
        <Button variant="danger" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Raise Escalation
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {escalations.map(esc => (
          <Card key={esc.id} style={{ borderLeft: `4px solid ${getPriorityColor(esc.priority)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Issue regarding {esc.student}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Raised: {esc.dateRaised}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MessageCircle size={14} /> Assigned to: {esc.coordinator}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Badge variant={esc.priority === 'Critical' || esc.priority === 'High' ? 'error' : esc.priority === 'Medium' ? 'warning' : 'default'}>
                  {esc.priority} Priority
                </Badge>
                <Badge variant={esc.status === 'Resolved' ? 'success' : esc.status === 'In Progress' ? 'warning' : 'info'}>
                  {esc.status}
                </Badge>
              </div>
            </div>
            
            <div style={{ 
              background: 'var(--bg-base)', padding: '1rem', borderRadius: '6px', 
              border: '1px solid var(--border)', marginBottom: '1rem' 
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description:</strong>
              {esc.issue}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="sm">Add Update</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise New Escalation">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-wrapper">
             <label className="input-label">Student</label>
             <select className="input-field" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '6px', width: '100%' }}>
                <option value="">Select a student...</option>
                <option value="1">Alice Smith</option>
                <option value="2">Bob Johnson</option>
             </select>
          </div>
          <Select 
            label="Priority Level" 
            options={[
              { label: 'Low - Informational', value: 'Low' },
              { label: 'Medium - Needs Attention', value: 'Medium' },
              { label: 'High - Urgent Action Required', value: 'High' },
              { label: 'Critical - Immediate Intervention', value: 'Critical' },
            ]} 
          />
          <div className="input-wrapper">
            <label className="input-label">Issue Description</label>
            <textarea 
              className="input-field"
              rows={5}
              placeholder="Provide detailed context about the escalation..."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setIsModalOpen(false)}>Submit Escalation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
