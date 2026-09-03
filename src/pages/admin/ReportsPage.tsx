import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, ChevronDown, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { getReports, Report } from '../../api/report.api';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(data || []);
    } catch (error) {
      console.error('Failed to fetch reports', error);
      // Mock data if API fails or is empty for preview
      setReports([
        { id: '1', allocationId: 'a1', submittedById: 'u1', content: 'Mentoring going well. Covered basic React concepts.', date: '2023-10-15' },
        { id: '2', allocationId: 'a2', submittedById: 'u2', content: 'Student struggling with state management.', date: '2023-10-16' },
        { id: '3', allocationId: 'a3', submittedById: 'u3', content: 'Great progress on the final project.', date: '2023-10-18' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedReportId(expandedReportId === id ? null : id);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BarChart3 size={32} color="var(--accent-cyan)" />
          <h1 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>Reports & Analytics</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <Calendar size={16} color="var(--text-muted)" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }} />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }} />
          </div>
          <Button variant="primary"><Download size={18} style={{ marginRight: '0.5rem' }} /> Generate Report</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[
          { label: 'Total Reports', value: reports.length || 124, color: 'var(--accent-cyan)' },
          { label: 'This Month', value: 32, color: 'var(--accent-amber)' },
          { label: 'Pending Reviews', value: 8, color: 'var(--accent-red)' },
          { label: 'Average Score', value: '4.8/5', color: 'var(--accent-green)' }
        ].map(stat => (
          <Card key={stat.label}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Activity Overview</h3>
          <div style={{ 
            height: '200px', 
            borderRadius: '8px', 
            background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0) 100%)',
            border: '1px dashed var(--border)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '1rem',
            gap: '1rem'
          }}>
            {/* Fake bar chart bars */}
            {[40, 60, 45, 80, 50, 90, 75, 65, 85, 100, 55, 70].map((h, i) => (
              <div key={i} style={{ 
                flex: 1, 
                height: `${h}%`, 
                backgroundColor: 'var(--accent-cyan)', 
                opacity: 0.7, 
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease'
              }} />
            ))}
          </div>
        </div>
      </Card>

      <div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Recent Reports</h2>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map(report => (
              <Card key={report.id}>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleExpand(report.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <FileText size={24} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Monthly Mentoring Report</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Submitted by: {report.submittedById} • {new Date(report.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Badge variant="success">Reviewed</Badge>
                      <ChevronDown size={20} color="var(--text-muted)" style={{ transform: expandedReportId === report.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </div>
                  {expandedReportId === report.id && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                      <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Report Content</h4>
                      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                        {report.content}
                      </p>
                      <div style={{ marginTop: '1rem' }}>
                        <Button size="sm" variant="secondary">View Full Details</Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {reports.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No reports found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
