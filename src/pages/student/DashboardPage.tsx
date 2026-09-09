import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Calendar, TrendingUp, MessageSquarePlus,
  ShieldCheck, Clock, ArrowUpRight, BookOpen, UserCheck
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/auth.store';

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated fetch from GET /api/v1/dashboard/student
    setTimeout(() => {
      setData({
        overallProgress: 82,
        riskStatus: 'LOW_RISK',
        assignedMentor: {
          name: 'Dr. K. L. Wickramasinghe',
          department: 'Computer Science & Software Engineering',
          email: 'wickramasinghe@nsbm.ac.lk',
        },
        upcomingMeeting: {
          date: 'Tomorrow, 10:00 AM',
          topic: 'Final Year Research Topic Selection & Methodology',
          mode: 'IN_PERSON',
          location: 'Building B, Office 304',
        },
        recentNotes: [
          { id: 1, date: '08 Sep 2026', status: 'ON_TRACK', summary: 'Reviewed milestone 1 submission. Feedback provided on database normalization.' },
          { id: 2, date: '22 Aug 2026', status: 'ON_TRACK', summary: 'Initial mentoring orientation and academic goal setting for current semester.' },
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
        title={`Welcome back, ${user?.fullName || user?.email?.split('@')[0] || 'Student'}`}
        subtitle="Track your academic mentoring progress, upcoming meetings, and mentor feedback."
        icon={<GraduationCap size={28} />}
        badge="Student Portal"
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate('/student/meetings')}>
              <Calendar size={16} />
              <span>My Meetings</span>
            </Button>
            <Button variant="primary" onClick={() => navigate('/student/meeting-requests')}>
              <MessageSquarePlus size={16} />
              <span>Request Meeting</span>
            </Button>
          </>
        }
      />

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Academic Progress Score</span>
            <div className="stat-icon" style={{ color: 'var(--accent-emerald)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">{data.overallProgress}%</div>
            <div style={{ fontSize: '0.8125rem', color: '#34D399', marginTop: '0.5rem' }}>
              ● On Track for Graduation
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-cyan)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Status Risk Flag</span>
            <div className="stat-icon" style={{ color: 'var(--accent-cyan)' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>
              <Badge variant="emerald">GOOD STANDING</Badge>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No open escalations
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-violet)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Assigned Mentor</span>
            <div className="stat-icon" style={{ color: 'var(--accent-violet)' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {data.assignedMentor.name}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {data.assignedMentor.department}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.75rem' }}>
        
        {/* Next Scheduled Meeting Card */}
        <Card className="card-interactive" style={{ background: 'linear-gradient(145deg, rgba(34, 211, 238, 0.04) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <Badge variant="cyan">Next Scheduled Mentoring</Badge>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONFIRMED</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{data.upcomingMeeting.topic}</h3>
          
          <div style={{
            background: 'rgba(9, 13, 22, 0.5)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            margin: '1.25rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>{data.upcomingMeeting.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Badge variant="violet">{data.upcomingMeeting.mode.replace('_', ' ')}</Badge>
              <span>{data.upcomingMeeting.location}</span>
            </div>
          </div>

          <Button variant="ghost" style={{ width: '100%' }} onClick={() => navigate('/student/meetings')}>
            <span>View All Scheduled Sessions</span>
            <ArrowUpRight size={14} />
          </Button>
        </Card>

        {/* Recent Session Notes & Feedback */}
        <Card className="card-interactive">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Recent Mentor Notes</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Feedback logged by your assigned mentor</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/progress')}>
              <BookOpen size={14} />
              <span>Progress Log</span>
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.recentNotes.map((note: any) => (
              <div
                key={note.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(9, 13, 22, 0.4)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{note.date}</span>
                  <Badge variant="emerald">{note.status.replace('_', ' ')}</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {note.summary}
                </p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
