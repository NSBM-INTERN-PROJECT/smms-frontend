import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Video, Filter, Link as LinkIcon, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { getMeetings, createMeeting } from '../../api/meeting.api';
import { getAllocations } from '../../api/allocation.api';
import { getUsers } from '../../api/user.api';

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [allocations, setAllocations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [newMeeting, setNewMeeting] = useState({
    allocationId: '',
    studentUserId: '',
    title: '',
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: 30,
    meetingLink: '',
    mode: 'PHYSICAL'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch actual meetings based on allocations.
        // Since we don't have a complex backend filter, we'll fetch mock or all meetings
        const meetingsData = await getMeetings();
        setMeetings(meetingsData);

        const allocationsData = await getAllocations();
        const myAllocations = allocationsData.filter(a => a.mentorId === user?.id?.toString());
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

  const handleCreateMeeting = async () => {
    try {
      const created = await createMeeting(newMeeting);
      setMeetings(prev => [created, ...prev]);
      setIsModalOpen(false);
      setNewMeeting({ allocationId: '', studentUserId: '', title: '', scheduledDate: '', scheduledTime: '', durationMinutes: 30, meetingLink: '', mode: 'PHYSICAL' });
    } catch (error) {
      console.error('Error creating meeting', error);
      alert('Failed to schedule meeting. Please check all fields are filled.');
    }
  };

  const getStudentName = (meeting: any) => {
    // Try from allocation first, then direct studentUserId match
    const allocation = allocations.find(a => a.id === meeting.allocationId?.toString());
    const studentId = meeting.studentUserId?.toString() || allocation?.menteeId;
    const student = students.find(s => s.id === studentId);
    return student?.name || student?.email || 'Unknown Student';
  };

  const columns = [
    { key: 'title', title: 'Title' },
    { key: 'student', title: 'Student', render: (row: any) => getStudentName(row) },
    { key: 'date', title: 'Date & Time', render: (row: any) => {
      if (row.scheduledDate && row.scheduledTime) return `${row.scheduledDate} ${row.scheduledTime}`;
      if (row.date) return new Date(row.date).toLocaleString();
      return '-';
    }},
    { key: 'durationMinutes', title: 'Duration (min)' },
    { key: 'status', title: 'Status', render: (row: any) => (
      <Badge variant={row.status === 'SCHEDULED' ? 'warning' : row.status === 'COMPLETED' ? 'success' : 'error'}>
        {row.status}
      </Badge>
    )},
    { key: 'actions', title: 'Actions', render: (row: any) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {row.status === 'SCHEDULED' && (
          <>
            <Button variant="ghost" size="sm" style={{ color: 'var(--accent-green)' }}><CheckCircle size={16} /></Button>
            <Button variant="ghost" size="sm" style={{ color: 'var(--accent-red)' }}><XCircle size={16} /></Button>
          </>
        )}
      </div>
    )}
  ];

  const todaysMeetings = meetings.filter(m => new Date(m.date).toDateString() === new Date().toDateString());

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', margin: 0 }}>
          <Calendar size={24} color="var(--accent-cyan)" /> Meetings
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Select 
            options={[
              { label: 'All', value: 'All' },
              { label: 'Scheduled', value: 'SCHEDULED' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' }
            ]}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Schedule Meeting
          </Button>
        </div>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size="lg" /></div> : (
        <>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Today's Meetings</h2>
          {todaysMeetings.length === 0 ? (
            <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No meetings scheduled for today.
            </Card>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
              {todaysMeetings.map(m => (
                <Card key={m.id} style={{ minWidth: '300px', borderLeft: '4px solid var(--accent-cyan)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                    <Badge variant="info"><Video size={12} style={{marginRight: '4px'}}/>Online</Badge>
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{getStudentName(m.allocationId)}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {m.meetingLink && (
                      <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => window.open(m.meetingLink, '_blank')}>
                        <LinkIcon size={14} style={{ marginRight: '4px' }}/> Join
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" style={{ flex: 1, color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}>
                       Mark Complete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', marginTop: '2rem' }}>All Meetings</h2>
          <Table 
            columns={columns} 
            data={filter === 'All' ? meetings : meetings.filter(m => m.status === filter)} 
            rowKey={(row) => row.id} 
          />
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Meeting">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select 
            label="Student" 
            value={newMeeting.allocationId}
            onChange={(e) => {
              const alloc = allocations.find(a => a.id === e.target.value);
              setNewMeeting({...newMeeting, allocationId: e.target.value, studentUserId: alloc?.menteeId || ''});
            }}
            options={[
              { label: 'Select a student...', value: '' },
              ...allocations.map(a => ({
                label: getStudentName({ allocationId: a.id, studentUserId: a.menteeId }),
                value: a.id
              }))
            ]} 
          />
          <Input 
            label="Title" 
            value={newMeeting.title}
            onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
          />
          <Input 
            label="Date" 
            type="date" 
            value={newMeeting.scheduledDate}
            onChange={(e) => setNewMeeting({...newMeeting, scheduledDate: e.target.value})}
          />
          <Input 
            label="Time" 
            type="time" 
            value={newMeeting.scheduledTime}
            onChange={(e) => setNewMeeting({...newMeeting, scheduledTime: e.target.value})}
          />
          <Select 
            label="Duration" 
            value={newMeeting.durationMinutes.toString()}
            onChange={(e) => setNewMeeting({...newMeeting, durationMinutes: parseInt(e.target.value)})}
            options={[
              { label: '15 minutes', value: '15' },
              { label: '30 minutes', value: '30' },
              { label: '45 minutes', value: '45' },
              { label: '60 minutes', value: '60' },
            ]} 
          />
          <Select 
            label="Mode" 
            value={newMeeting.mode}
            onChange={(e) => setNewMeeting({...newMeeting, mode: e.target.value})}
            options={[
              { label: 'In-Person (Physical)', value: 'PHYSICAL' },
              { label: 'Online', value: 'ONLINE' },
            ]} 
          />
          <Input 
            label="Meeting Link / Location" 
            value={newMeeting.meetingLink}
            onChange={(e) => setNewMeeting({...newMeeting, meetingLink: e.target.value})}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateMeeting}
              disabled={!newMeeting.allocationId || !newMeeting.title || !newMeeting.scheduledDate || !newMeeting.scheduledTime}
            >Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
