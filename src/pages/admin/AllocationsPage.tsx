import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Plus, CheckCircle, Clock, XCircle, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { getAllocations, createAllocation } from '../../api/allocation.api';
import type { Allocation } from '../../types/allocation.types';
import { getUsers } from '../../api/user.api';
import type { User } from '../../types/user.types';

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ mentorId: '', menteeId: '', sessionId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allocs, allUsers] = await Promise.all([
        getAllocations(),
        getUsers()
      ]);
      setAllocations(allocs || []);
      setMentors((allUsers || []).filter(u => u.role === 'mentor'));
      setStudents((allUsers || []).filter(u => u.role === 'student' || u.role === 'mentee'));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAllocation(formData);
      setCreateModalOpen(false);
      fetchData();
      setFormData({ mentorId: '', menteeId: '', sessionId: 'default' });
    } catch (error) {
      console.error('Failed to create allocation', error);
    }
  };

  const columns = [
    { key: 'mentor', title: 'Mentor', render: (a: Allocation) => {
      const mentor = mentors.find(m => m.id === a.mentorId);
      return <div><div style={{ fontWeight: 'bold' }}>{mentor?.name || 'Unknown'}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mentor?.email}</div></div>;
    }},
    { key: 'student', title: 'Student', render: (a: Allocation) => {
      const student = students.find(s => s.id === a.menteeId);
      return <div><div style={{ fontWeight: 'bold' }}>{student?.name || 'Unknown'}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student?.email}</div></div>;
    }},
    { key: 'status', title: 'Status', render: (a: Allocation) => {
      const statusMap: Record<string, 'success'|'warning'|'info'|'error'> = {
        'active': 'success',
        'pending': 'warning',
        'completed': 'info',
        'cancelled': 'error'
      };
      return <Badge variant={statusMap[a.status] || 'default'}>{a.status.toUpperCase()}</Badge>;
    }},
    { key: 'date', title: 'Created Date', render: (a: Allocation) => new Date(a.createdAt).toLocaleDateString() },
    { key: 'actions', title: 'Actions', render: () => (
      <Button size="sm" variant="ghost">Manage</Button>
    )}
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LinkIcon size={32} color="var(--accent-amber)" />
          <h1 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>Allocations</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}><Plus size={18} style={{ marginRight: '0.5rem' }} /> New Allocation</Button>
        </div>
      </div>

      <Card>
        <div style={{ padding: '1rem' }}>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div> : (
            allocations.length > 0 ? (
              <Table columns={columns} data={allocations} rowKey={(a) => a.id} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No allocations found.</div>
            )
          )}
        </div>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="New Allocation">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <Select 
            label="Mentor" 
            options={[{ label: 'Select a mentor...', value: '' }, ...mentors.map(m => ({ label: `${m.name} (${m.email})`, value: m.id }))]} 
            value={formData.mentorId} 
            onChange={e => setFormData({...formData, mentorId: e.target.value})} 
          />
          <Select 
            label="Student" 
            options={[{ label: 'Select a student...', value: '' }, ...students.map(s => ({ label: `${s.name} (${s.email})`, value: s.id }))]} 
            value={formData.menteeId} 
            onChange={e => setFormData({...formData, menteeId: e.target.value})} 
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" type="button" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={!formData.mentorId || !formData.menteeId}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
