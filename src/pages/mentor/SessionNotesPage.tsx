import React, { useState, useEffect } from 'react';
import { FileText, Plus, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { getReports, createReport } from '../../api/report.api';
import { getAllocations } from '../../api/allocation.api';
import { getUsers } from '../../api/user.api';

export default function SessionNotesPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentFilter, setStudentFilter] = useState('All');
  
  const [newNote, setNewNote] = useState({
    allocationId: '',
    content: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportsData = await getReports();
        const allocationsData = await getAllocations();
        const myAllocations = allocationsData.filter(a => a.mentorId === user?.id);
        
        // Filter reports for my allocations
        const myReports = reportsData.filter(r => myAllocations.some(a => a.id === r.allocationId));
        setReports(myReports);
        setAllocations(myAllocations);

        const usersData = await getUsers('student');
        setStudents(usersData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const handleCreateNote = async () => {
    try {
      const created = await createReport(newNote);
      setReports([created, ...reports]);
      setIsModalOpen(false);
      setNewNote({ allocationId: '', content: '' });
    } catch (error) {
      console.error('Error creating note', error);
    }
  };

  const getStudentName = (allocationId: string) => {
    const allocation = allocations.find(a => a.id === allocationId);
    if (!allocation) return 'Unknown Student';
    const student = students.find(s => s.id === allocation.menteeId);
    return student?.name || student?.email || 'Unknown Student';
  };

  const filteredReports = studentFilter === 'All' 
    ? reports 
    : reports.filter(r => r.allocationId === studentFilter);

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', margin: 0 }}>
          <FileText size={24} color="var(--accent-cyan)" /> Session Notes
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Select 
            options={[
              { label: 'All Students', value: 'All' },
              ...allocations.map(a => ({
                label: getStudentName(a.id),
                value: a.id
              }))
            ]}
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
          />
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> New Note
          </Button>
        </div>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size="lg" /></div> : (
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: '11px', top: '0', bottom: '0', width: '2px', background: 'var(--border)' }}></div>
          
          {filteredReports.length === 0 ? (
            <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>No session notes found.</div>
          ) : (
            filteredReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((report, idx) => (
              <div key={report.id} style={{ position: 'relative', marginBottom: '2rem' }}>
                {/* Timeline dot */}
                <div style={{ 
                  position: 'absolute', left: '-2rem', top: '20px', width: '16px', height: '16px', 
                  borderRadius: '50%', background: 'var(--accent-cyan)', border: '4px solid var(--bg-base)' 
                }}></div>
                
                <Card style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} color="var(--text-muted)" />
                      <span style={{ fontWeight: 'bold' }}>{getStudentName(report.allocationId)}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {new Date(report.date).toLocaleDateString()} {new Date(report.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ 
                    background: 'var(--bg-base)', padding: '1rem', borderRadius: '4px', 
                    whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                    lineHeight: '1.5', border: '1px solid var(--border)'
                  }}>
                    {report.content}
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Session Note">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select 
            label="Student" 
            value={newNote.allocationId}
            onChange={(e) => setNewNote({...newNote, allocationId: e.target.value})}
            options={[
              { label: 'Select a student...', value: '' },
              ...allocations.map(a => ({
                label: getStudentName(a.id),
                value: a.id
              }))
            ]} 
          />
          <div className="input-wrapper">
            <label className="input-label">Note Content</label>
            <textarea 
              className="input-field"
              rows={6}
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              placeholder="Enter detailed notes from the session..."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateNote}>Save Note</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
