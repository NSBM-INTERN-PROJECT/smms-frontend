import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BarChart3, CheckCircle, Clock as ClockIcon, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { getMeetings } from '../../api/meeting.api';
import { getAllocations } from '../../api/allocation.api';
import { getReports } from '../../api/report.api';

export default function ProgressPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ meetings: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  // Mock data for milestones and feedback
  const overallProgress = 65; // percentage
  
  const milestones = [
    { id: 1, date: 'Oct 15, 2023', description: 'Initial Mentor Assignment', status: 'completed' },
    { id: 2, date: 'Nov 01, 2023', description: 'First Intro Meeting', status: 'completed' },
    { id: 3, date: 'Nov 20, 2023', description: 'Project Proposal Approved', status: 'completed' },
    { id: 4, date: 'Dec 15, 2023', description: 'Midterm Review Submission', status: 'current' },
    { id: 5, date: 'Jan 10, 2024', description: 'Draft Report Submission', status: 'upcoming' },
    { id: 6, date: 'Feb 05, 2024', description: 'Final Defense', status: 'upcoming' }
  ];

  const feedbacks = [
    { id: 1, date: 'Nov 22, 2023', mentor: 'Dr. Jane Smith', text: 'Good progress on the proposal. Ensure you include more recent literature in your review.' },
    { id: 2, date: 'Nov 02, 2023', mentor: 'Dr. Jane Smith', text: 'Great first meeting. Clear understanding of the project scope.' }
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const allocations = await getAllocations({ menteeId: user?.id ? String(user.id) : undefined });
      let meetingCount = 0;
      let reportCount = 0;
      
      if (allocations.length > 0) {
        const allocId = allocations[0].id;
        const [meetings, reports] = await Promise.all([
          getMeetings(allocId).catch(() => []),
          getReports(allocId).catch(() => [])
        ]);
        meetingCount = meetings.filter((m: any) => m.status === 'completed').length;
        reportCount = reports.length;
      }
      setMetrics({ meetings: meetingCount, reports: reportCount });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'var(--accent-green)';
    if (status === 'current') return 'var(--accent-cyan)';
    return 'var(--text-muted)';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <BarChart3 size={32} style={{ color: 'var(--accent-cyan)' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
          My Progress
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Overall Progress & Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 text-center flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Overall Completion</h2>
            
            <div 
              className="relative rounded-full flex items-center justify-center mb-6"
              style={{
                width: '160px',
                height: '160px',
                background: `conic-gradient(var(--accent-cyan) ${overallProgress}%, var(--bg-elevated) 0)`,
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)'
              }}
            >
              <div 
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  width: '130px',
                  height: '130px',
                  background: 'var(--bg-surface)'
                }}
              >
                <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{overallProgress}%</span>
              </div>
            </div>
            
            <Badge variant="success" className="text-sm px-3 py-1">You are on track!</Badge>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={18} style={{ color: 'var(--accent-amber)' }}/> Meetings
            </h3>
            <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              <span>Attended: {metrics.meetings}</span>
              <span>Target: 10</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min((metrics.meetings/10)*100, 100)}%`, background: 'var(--accent-amber)' }}></div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <MessageSquare size={18} style={{ color: 'var(--accent-green)' }}/> Reports
            </h3>
            <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              <span>Submitted: {metrics.reports}</span>
              <span>Target: 5</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min((metrics.reports/5)*100, 100)}%`, background: 'var(--accent-green)' }}></div>
            </div>
          </Card>

          <Card className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} style={{ color: 'var(--accent-cyan)' }} />
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Risk Level</h3>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Based on attendance</span>
              </div>
            </div>
            <Badge variant="success">Low</Badge>
          </Card>
        </div>

        {/* Right Column - Timeline and Feedback */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Mentoring Timeline</h2>
            <div className="relative border-l-2 ml-4 space-y-8" style={{ borderColor: 'var(--border)' }}>
              {milestones.map((milestone, idx) => (
                <div key={milestone.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div 
                    className="absolute rounded-full -left-[9px] top-1 flex items-center justify-center"
                    style={{ 
                      width: '16px', height: '16px', 
                      background: 'var(--bg-surface)',
                      border: `2px solid ${getStatusColor(milestone.status)}`
                    }}
                  >
                    {milestone.status === 'completed' && <CheckCircle size={10} style={{ color: 'var(--accent-green)' }} />}
                    {milestone.status === 'current' && <div className="rounded-full w-2 h-2" style={{ background: 'var(--accent-cyan)' }}></div>}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold mb-1" style={{ color: getStatusColor(milestone.status) }}>
                      {milestone.date}
                    </span>
                    <span className="text-lg" style={{ color: milestone.status === 'upcoming' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {milestone.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Mentor Feedback</h2>
            <div className="space-y-4">
              {feedbacks.map(fb => (
                <Card key={fb.id} className="p-5" style={{ background: 'linear-gradient(145deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)' }}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-sm" style={{ color: 'var(--accent-cyan)' }}>{fb.mentor}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      <ClockIcon size={12} className="inline mr-1"/> {fb.date}
                    </span>
                  </div>
                  <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>"{fb.text}"</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
