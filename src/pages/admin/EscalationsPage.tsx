import React, { useState } from 'react';
import { AlertTriangle, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

interface Escalation {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Pending' | 'Resolved';
  date: string;
  assignedCoordinator?: string;
}

const mockEscalations: Escalation[] = [
  { id: '1', title: 'Mentor unresponsive for 3 weeks', description: 'Student has tried reaching out multiple times without success.', priority: 'High', status: 'Open', date: '2023-10-01', assignedCoordinator: 'Alice Smith' },
  { id: '2', title: 'Conflict between mentor and student', description: 'Disagreement over project direction has stalled progress.', priority: 'High', status: 'Pending', date: '2023-10-05' },
  { id: '3', title: 'Student missing sessions', description: 'Student has not attended the last two scheduled meetings.', priority: 'Medium', status: 'Open', date: '2023-10-08', assignedCoordinator: 'Bob Jones' },
  { id: '4', title: 'Platform access issues', description: 'Mentor cannot access the resource library.', priority: 'Low', status: 'Resolved', date: '2023-09-20', assignedCoordinator: 'Charlie Brown' },
  { id: '5', title: 'Request for new mentor', description: 'Student feels the current mentor is not a good fit for their goals.', priority: 'Medium', status: 'Open', date: '2023-10-10' },
  { id: '6', title: 'Inappropriate behavior reported', description: 'Pending investigation into comments made during session.', priority: 'High', status: 'Open', date: '2023-10-12' },
  { id: '7', title: 'Feedback form not submitted', description: 'Mentor has not submitted the mandatory monthly feedback.', priority: 'Low', status: 'Pending', date: '2023-10-14', assignedCoordinator: 'Alice Smith' },
  { id: '8', title: 'Session scheduling difficulties', description: 'Timezone differences making it hard to find a common time.', priority: 'Medium', status: 'Resolved', date: '2023-09-25', assignedCoordinator: 'Bob Jones' }
];

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>(mockEscalations);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEscalationId, setSelectedEscalationId] = useState<string | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState('');

  const filteredEscalations = escalations.filter(e => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && e.priority !== priorityFilter) return false;
    return true;
  });

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'Open': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const handleAssign = () => {
    if (selectedEscalationId && selectedCoordinator) {
      setEscalations(prev => prev.map(e => e.id === selectedEscalationId ? { ...e, assignedCoordinator: selectedCoordinator, status: e.status === 'Open' ? 'Pending' : e.status } : e));
      setAssignModalOpen(false);
      setSelectedCoordinator('');
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={32} color="var(--accent-red)" />
          <h1 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>Escalations</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className="input-field"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px', height: '36px', padding: '0 1rem' }}
          >
            {['All', 'Open', 'Pending', 'Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            className="input-field"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px', height: '36px', padding: '0 1rem' }}
          >
            {['All', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredEscalations.map(esc => (
          <Card key={esc.id}>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem' }}>{esc.title}</h3>
                <Badge variant={getPriorityBadgeVariant(esc.priority)}>{esc.priority}</Badge>
              </div>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, flexGrow: 1 }}>{esc.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} /> {esc.date}
                </div>
                <Badge variant={getStatusBadgeVariant(esc.status)}>{esc.status}</Badge>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {esc.assignedCoordinator ? (
                    <span>Assigned: <strong style={{ color: 'var(--accent-cyan)' }}>{esc.assignedCoordinator}</strong></span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => { setSelectedEscalationId(esc.id); setAssignModalOpen(true); }}
                >
                  <UserPlus size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredEscalations.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No escalations found matching filters.</div>
        )}
      </div>

      <Modal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Coordinator">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select 
            label="Select Coordinator" 
            options={[
              { label: 'Alice Smith', value: 'Alice Smith' },
              { label: 'Bob Jones', value: 'Bob Jones' },
              { label: 'Charlie Brown', value: 'Charlie Brown' }
            ]} 
            value={selectedCoordinator} 
            onChange={e => setSelectedCoordinator(e.target.value)} 
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAssign} disabled={!selectedCoordinator}>Assign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
