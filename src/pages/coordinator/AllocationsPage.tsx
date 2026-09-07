import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';

import { useToast } from '../../hooks/useToast';
import { getAllocations, createAllocation } from '../../api/allocation.api';
import { getUsers } from '../../api/user.api';
import { getSessions } from '../../api/session.api';

interface User { id: string; email: string; role: string; name?: string; profileData?: any; }
interface Allocation { id: string; mentorId: string; menteeId: string; sessionId: string; status: string; createdAt: string; }
interface Session { id: string; name: string; startDate: string; endDate: string; isActive: boolean; }

export default function AllocationsPage() {
  const { showToast } = useToast();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlloc, setNewAlloc] = useState({ mentorId: '', menteeId: '', sessionId: '' });

  // Filters
  const [sessionFilter, setSessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Quick match selection
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedMentor, setSelectedMentor] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, mentorsRes, studentsRes, sessionsRes] = await Promise.all([
        getAllocations(),
        getUsers('mentor'),
        getUsers('student'),
        getSessions()
      ]);
      setAllocations(allocRes || []);
      setMentors(mentorsRes || []);
      setStudents(studentsRes || []);
      setSessions(sessionsRes || []);
    } catch (err) {
      showToast?.('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAllocation = async (data: { mentorId: string, menteeId: string, sessionId: string }) => {
    if (!data.mentorId || !data.menteeId || !data.sessionId) {
      showToast?.('Please fill all fields', 'warning');
      return;
    }
    try {
      setLoading(true);
      await createAllocation(data);
      showToast?.('Allocation created successfully', 'success');
      setIsModalOpen(false);
      fetchData(); // Refresh
      setSelectedStudent('');
      setSelectedMentor('');
    } catch (err) {
      showToast?.('Failed to create allocation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAllocations = allocations.filter(a => {
    const matchStatus = statusFilter === 'All' || a.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSession = !sessionFilter || a.sessionId === sessionFilter;
    return matchStatus && matchSession;
  });

  const columns = [
    {
      key: 'mentor',
      title: 'Mentor',
      render: (record: Allocation) => {
        const m = mentors.find(x => x.id === record.mentorId);
        return <div style={{ color: 'var(--text-primary)' }}>{m?.name || m?.email || record.mentorId}</div>;
      }
    },
    {
      key: 'student',
      title: 'Student',
      render: (record: Allocation) => {
        const s = students.find(x => x.id === record.menteeId);
        return <div style={{ color: 'var(--text-primary)' }}>{s?.name || s?.email || record.menteeId}</div>;
      }
    },
    {
      key: 'session',
      title: 'Session',
      render: (record: Allocation) => {
        const sess = sessions.find(x => x.id === record.sessionId);
        return <div style={{ color: 'var(--text-muted)' }}>{sess?.name || record.sessionId}</div>;
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (record: Allocation) => {
        const isAct = record.status.toLowerCase() === 'active';
        const isComp = record.status.toLowerCase() === 'completed';
        const variant = isAct ? 'success' : isComp ? 'info' : 'warning';
        return <Badge variant={variant as any}>{record.status}</Badge>;
      }
    },
    {
      key: 'date',
      title: 'Date',
      render: (record: Allocation) => <div style={{ color: 'var(--text-muted)' }}>{new Date(record.createdAt).toLocaleDateString()}</div>
    }
  ];

  const total = allocations.length;
  const activeCount = allocations.filter(a => a.status.toLowerCase() === 'active').length;
  const pendingCount = allocations.filter(a => a.status.toLowerCase() === 'pending').length;

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-body)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.8rem' }}>My Allocations</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Select 
            options={[{label: 'All Sessions', value: ''}, ...sessions.map(s => ({label: s.name, value: s.id}))]}
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
          />
          <Select 
            options={[{label: 'All Statuses', value: 'All'}, {label: 'Active', value: 'Active'}, {label: 'Pending', value: 'Pending'}, {label: 'Completed', value: 'Completed'}]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Suggest Allocation
            </div>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
            <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Users size={24} color="var(--accent-cyan)" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Total Allocations</p>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem' }}>{total}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <CheckCircle size={24} color="var(--accent-green)" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Active Pairs</p>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem' }}>{activeCount}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Clock size={24} color="var(--accent-amber)" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Pending Assignments</p>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem' }}>{pendingCount}</h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Layout */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Column */}
        <div style={{ flex: '6' }}>
          <Card style={{ height: '100%' }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginTop: 0, marginBottom: '1.5rem' }}>Allocation List</h3>
            {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Spinner /></div> : (
              <Table columns={columns} data={filteredAllocations} rowKey={r => r.id} />
            )}
            {!loading && filteredAllocations.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No allocations found.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ flex: '4' }}>
          <Card style={{ height: '100%' }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginTop: 0, marginBottom: '1.5rem' }}>Quick Match</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Select a student and mentor to pair them instantly.</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>1. Select Unassigned Student</label>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                {students.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => setSelectedStudent(s.id)}
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      background: selectedStudent === s.id ? 'var(--bg-elevated)' : 'transparent',
                      border: selectedStudent === s.id ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {s.name || s.email}
                  </div>
                ))}
                {students.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>No students available</div>}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>2. Select Mentor</label>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                {mentors.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => setSelectedMentor(m.id)}
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      background: selectedMentor === m.id ? 'var(--bg-elevated)' : 'transparent',
                      border: selectedMentor === m.id ? '1px solid var(--accent-amber)' : '1px solid transparent',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {m.name || m.email}
                  </div>
                ))}
                {mentors.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>No mentors available</div>}
              </div>
            </div>

            <Button 
              variant="primary" 
              style={{ width: '100%', marginTop: 'auto' }}
              disabled={!selectedStudent || !selectedMentor}
              onClick={() => {
                const activeSession = sessions.find(s => s.isActive) || sessions[0];
                handleCreateAllocation({
                  menteeId: selectedStudent,
                  mentorId: selectedMentor,
                  sessionId: activeSession?.id || 'session-default'
                });
              }}
            >
              Match Selected
            </Button>
          </Card>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Suggest Allocation">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Session</label>
            <Select 
              options={[{label: 'Select Session', value: ''}, ...sessions.map(s => ({label: s.name, value: s.id}))]}
              value={newAlloc.sessionId}
              onChange={(e) => setNewAlloc({...newAlloc, sessionId: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Student</label>
            <Select 
              options={[{label: 'Select Student', value: ''}, ...students.map(s => ({label: s.name || s.email, value: s.id}))]}
              value={newAlloc.menteeId}
              onChange={(e) => setNewAlloc({...newAlloc, menteeId: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mentor</label>
            <Select 
              options={[{label: 'Select Mentor', value: ''}, ...mentors.map(m => ({label: m.name || m.email, value: m.id}))]}
              value={newAlloc.mentorId}
              onChange={(e) => setNewAlloc({...newAlloc, mentorId: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => handleCreateAllocation(newAlloc)}>Create</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
