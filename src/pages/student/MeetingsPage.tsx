import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMeetings } from '../../api/meeting.api';
import { getAllocations } from '../../api/allocation.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { Calendar, Clock, Video, MapPin, ChevronDown, ExternalLink } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface Meeting {
  id: string;
  allocationId: string;
  title: string;
  date: string;
  durationMinutes: number;
  status: string;
  meetingLink?: string;
}

interface Allocation {
  id: string;
  mentorId: string;
  menteeId: string;
  sessionId: string;
  status: string;
  createdAt: string;
}

export default function MeetingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mentorName] = useState('Dr. Jane Smith'); // Mocking mentor name for display

  useEffect(() => {
    if (user?.id) {
      loadMeetings();
    }
  }, [user]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      // Fetch allocation first to get allocationId
      const allocations = await getAllocations({ menteeId: user?.id ? String(user.id) : undefined });
      if (allocations.length > 0) {
        const allocationId = allocations[0].id;
        const meetingsData = await getMeetings(allocationId);
        setMeetings(meetingsData);
      } else {
        // Fallback or empty state if no allocation
        setMeetings([]);
      }
    } catch (error) {
      showToast('Failed to load meetings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  
  const upcomingMeetings = meetings.filter(m => new Date(m.date) > now && m.status !== 'cancelled');
  
  let pastMeetings = meetings.filter(m => new Date(m.date) <= now || m.status === 'cancelled');
  if (statusFilter !== 'all') {
    pastMeetings = pastMeetings.filter(m => m.status.toLowerCase() === statusFilter.toLowerCase());
  }

  const getCountdown = (dateString: string) => {
    const meetingDate = new Date(dateString);
    const diffTime = Math.abs(meetingDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const columns = [
    { key: 'title', title: 'Meeting Title' },
    { 
      key: 'date', 
      title: 'Date & Time', 
      render: (record: Meeting) => new Date(record.date).toLocaleString()
    },
    { 
      key: 'duration', 
      title: 'Duration', 
      render: (record: Meeting) => `${record.durationMinutes} mins`
    },
    {
      key: 'status',
      title: 'Status',
      render: (record: Meeting) => {
        let variant: 'success' | 'error' | 'warning' | 'default' = 'default';
        if (record.status.toLowerCase() === 'completed') variant = 'success';
        if (record.status.toLowerCase() === 'cancelled') variant = 'error';
        if (record.status.toLowerCase() === 'scheduled') variant = 'warning';
        return <Badge variant={variant}>{record.status}</Badge>;
      }
    },
    {
      key: 'attendance',
      title: 'Attendance',
      render: (record: Meeting) => {
        if (record.status.toLowerCase() === 'completed') return <Badge variant="success">Attended</Badge>;
        if (record.status.toLowerCase() === 'cancelled') return <span>-</span>;
        return <Badge variant="warning">Pending</Badge>;
      }
    }
  ];

  if (loading) return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
          <Calendar size={28} style={{ color: 'var(--accent-cyan)' }} /> My Meetings
        </h1>
        <div className="w-48">
          <Select 
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' }
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Upcoming Meetings</h2>
        {upcomingMeetings.length === 0 ? (
          <Card className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            No upcoming meetings scheduled.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="p-6 flex flex-col justify-between" style={{ 
                borderLeft: '4px solid var(--accent-cyan)',
                background: 'linear-gradient(to right, rgba(34,211,238,0.05) 0%, transparent 50%)'
              }}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{meeting.title}</h3>
                    <Badge variant={meeting.meetingLink ? 'info' : 'default'}>
                      {meeting.meetingLink ? 'Online' : 'In-Person'}
                    </Badge>
                  </div>
                  <div className="space-y-2 mt-4" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} /> {new Date(meeting.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} /> {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({meeting.durationMinutes} mins)
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Mentor:</span> {mentorName}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-semibold text-sm" style={{ color: 'var(--accent-amber)' }}>
                    {getCountdown(meeting.date)}
                  </span>
                  {meeting.meetingLink && (
                    <Button variant="primary" size="sm" className="flex items-center gap-2" onClick={() => window.open(meeting.meetingLink, '_blank')}>
                      <Video size={16} /> Join Meeting
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Past Meetings</h2>
        <Card className="overflow-hidden">
          {pastMeetings.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No past meetings found.</div>
          ) : (
            <Table 
              data={pastMeetings} 
              columns={columns} 
              rowKey={(record) => record.id} 
            />
          )}
        </Card>
      </div>
    </div>
  );
}
