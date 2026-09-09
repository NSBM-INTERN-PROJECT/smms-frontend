import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Calendar, Clock, BookOpen,
  ArrowUpRight, CheckCircle2, UserCheck, MessageSquarePlus
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/auth.store';

export default function MentorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated fetch from GET /api/v1/dashboard/mentor
    setTimeout(() => {
      setData({
        myStudents: 15,
        maxCapacity: 20,
        nextMeeting: {
          studentName: 'Dilshan Silva',
          time: 'Today, 2:30 PM',
          mode: 'ONLINE',
          topic: 'Semester Project Progress & Code Review',
        },
        pendingRequests: 3,
        completedSessionsThisMonth: 18,
        assignedStudents: [
          { id: 1, name: 'Dilshan Silva', batch: '2024', status: 'ON_TRACK', lastMeeting: '10 Sep 2026' },
          { id: 2, name: 'Amara Perera', batch: '2024', status: 'NEEDS_ATTENTION', lastMeeting: '05 Sep 2026' },
          { id: 3, name: 'Kasun Fernando', batch: '2023', status: 'AT_RISK', lastMeeting: '28 Aug 2026' },
          { id: 4, name: 'Nisal Jayasinghe', batch: '2025', status: 'ON_TRACK', lastMeeting: '12 Sep 2026' },
        ]
      });
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        title={`Welcome back, ${user?.fullName || 'Mentor'}`}
        subtitle="Manage your allocated students, upcoming mentoring slots, and session notes."
        icon={<GraduationCap size={28} />}
        badge="Mentor Portal"
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate('/mentor/slots')}>
              <Clock size={16} />
              <span>Manage Slots</span>
            </Button>
            <Button variant="primary" onClick={() => navigate('/mentor/session-notes')}>
              <BookOpen size={16} />
              <span>Log Session Note</span>
            </Button>
          </>
        }
      />

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-cyan)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Allocated Students</span>
            <div className="stat-icon" style={{ color: 'var(--accent-cyan)' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">{data.myStudents} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {data.maxCapacity}</span></div>
            <div style={{ fontSize: '0.8125rem', color: '#34D399', marginTop: '0.5rem' }}>
              Capacity: 75% Utilized
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-violet)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Upcoming Meeting</span>
            <div className="stat-icon" style={{ color: 'var(--accent-violet)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {data.nextMeeting.studentName}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', marginTop: '0.375rem', fontWeight: 600 }}>
              {data.nextMeeting.time}
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-amber)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Pending Meeting Requests</span>
            <div className="stat-icon" style={{ color: 'var(--accent-amber)' }}>
              <MessageSquarePlus size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{data.pendingRequests}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--accent-amber)', marginTop: '0.5rem' }}>
              Requires Approval
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Sessions Held This Month</span>
            <div className="stat-icon" style={{ color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">{data.completedSessionsThisMonth}</div>
            <div style={{ fontSize: '0.8125rem', color: '#34D399', marginTop: '0.5rem' }}>
              All Notes Submitted
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.75rem' }}>
        
        {/* Allocated Students Summary */}
        <Card className="card-interactive">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>My Student Roster</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Progress overview of students under your mentorship</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/mentor/students')}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data.assignedStudents.map((st: any) => (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(9, 13, 22, 0.4)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{st.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batch: {st.batch} • Last meeting: {st.lastMeeting}</p>
                </div>
                <Badge variant={st.status === 'ON_TRACK' ? 'success' : st.status === 'NEEDS_ATTENTION' ? 'warning' : 'error'}>
                  {st.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Immediate Upcoming Session Focus */}
        <Card className="card-interactive" style={{ background: 'linear-gradient(145deg, rgba(34, 211, 238, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <Badge variant="cyan">Next Session Agenda</Badge>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.75rem' }}>{data.nextMeeting.studentName}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{data.nextMeeting.topic}</p>
          </div>

          <div style={{
            background: 'rgba(9, 13, 22, 0.6)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>{data.nextMeeting.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Badge variant="violet">{data.nextMeeting.mode}</Badge>
              <span>Meeting Link Attached</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => navigate('/mentor/meetings')}>
              <span>Launch Meeting Room</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate('/mentor/session-notes')}>
              <span>View Notes</span>
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
