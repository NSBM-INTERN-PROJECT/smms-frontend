import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, AlertTriangle, BarChart3,
  TrendingUp, Calendar, ArrowUpRight, ShieldCheck, UserPlus
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated fetch from GET /api/v1/dashboard
    setTimeout(() => {
      setData({
        totalStudents: 1520,
        activeMentors: 145,
        sessionsCompleted: 320,
        openEscalations: 12,
        allocationRate: 88,
        recentEscalations: [
          { id: 'ESC-101', title: 'Student S-402 inactive for 3 consecutive weeks', category: 'ACADEMIC_RISK', status: 'HIGH', date: 'Today, 10:30 AM' },
          { id: 'ESC-102', title: 'Mentor M-14 requested allocation transfer', category: 'ALLOCATION_TRANSFER', status: 'MEDIUM', date: 'Yesterday' },
          { id: 'ESC-103', title: 'Special attendance exception required', category: 'ATTENDANCE', status: 'LOW', date: '14 Sep 2026' },
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
        title="Admin Control Center"
        subtitle="System-wide performance KPIs, mentor allocations, and high-priority case escalations."
        icon={<BarChart3 size={28} />}
        badge="System Admin"
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate('/admin/reports')}>
              <BarChart3 size={16} />
              <span>System Reports</span>
            </Button>
            <Button variant="primary" onClick={() => navigate('/admin/users')}>
              <UserPlus size={16} />
              <span>Manage Accounts</span>
            </Button>
          </>
        }
      />

      {/* KPI Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-cyan)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Total Registered Students</span>
            <div className="stat-icon" style={{ color: 'var(--accent-cyan)' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">{data.totalStudents.toLocaleString()}</div>
            <div style={{ fontSize: '0.8125rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
              <TrendingUp size={14} />
              <span>+12.4% from last semester</span>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-violet)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Active Faculty Mentors</span>
            <div className="stat-icon" style={{ color: 'var(--accent-violet)' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">{data.activeMentors}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Avg. 10.4 students per mentor
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Mentoring Sessions Held</span>
            <div className="stat-icon" style={{ color: 'var(--accent-emerald)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">{data.sessionsCompleted}</div>
            <div style={{ fontSize: '0.8125rem', color: '#34D399', marginTop: '0.5rem' }}>
              94.2% Attendance Rate
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': 'var(--accent-amber)' } as React.CSSProperties}>
          <div className="stat-card-header">
            <span className="stat-label">Open Escalations</span>
            <div className="stat-icon" style={{ color: 'var(--accent-amber)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{data.openEscalations}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--accent-amber)', marginTop: '0.5rem' }}>
              Requires Coordinator Review
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Action Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.75rem' }}>
        
        {/* Allocation Capacity Visualizer */}
        <Card className="card-interactive">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Mentor Allocation Ratio</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Distribution of assigned vs unassigned students</p>
            </div>
            <span className="badge badge-emerald font-mono">{data.allocationRate}% Assigned</span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ height: '10px', width: '100%', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${data.allocationRate}%`, background: 'linear-gradient(90deg, #22D3EE, #818CF8)', borderRadius: 'var(--radius-full)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allocated Students</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>1,338</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unallocated Pool</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.25rem' }}>182</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/allocations')}>
              <span>Run Allocation Engine</span>
              <ArrowUpRight size={16} />
            </Button>
          </div>
        </Card>

        {/* Priority Escalations Card */}
        <Card className="card-interactive">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Active Escalations</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>High-priority student cases flagged for review</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/escalations')}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data.recentEscalations.map((esc: any) => (
              <div
                key={esc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(9, 13, 22, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  gap: '1rem',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{esc.id}</span>
                    <Badge variant={esc.status === 'HIGH' ? 'error' : esc.status === 'MEDIUM' ? 'warning' : 'info'}>
                      {esc.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {esc.title}
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{esc.date}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
