import React, { useState, useEffect } from 'react';
import { Users, Search, Calendar, FileText, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { getAllocations } from '../../api/allocation.api';
import { getUsers } from '../../api/user.api';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allocationsData = await getAllocations();
        const myAllocations = allocationsData.filter(a => a.mentorId === user?.id);
        
        const usersData = await getUsers('student');
        
        const myStudents = myAllocations.map(alloc => {
          const studentInfo = usersData.find(u => u.id === alloc.menteeId);
          return {
            ...studentInfo,
            allocationId: alloc.id,
            // Mock data for UI richness
            riskLevel: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
            progress: Math.floor(Math.random() * 60) + 40,
            meetingsCount: Math.floor(Math.random() * 10),
            reportsCount: Math.floor(Math.random() * 5),
            lastMeeting: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString()
          };
        }).filter(s => s.id); // ensure valid students
        
        setStudents(myStudents);
      } catch (error) {
        console.error('Failed to fetch students', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', margin: 0 }}>
          <Users size={24} color="var(--accent-cyan)" /> My Students
        </h1>
        <div style={{ width: '300px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input-field"
              placeholder="Search students..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size="lg" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredStudents.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              No students found.
            </div>
          ) : (
            filteredStudents.map(student => (
              <Card key={student.id} style={{ transition: 'transform 0.2s', cursor: 'pointer' }} className="student-card hover-scale">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-amber))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '1.2rem', color: '#fff'
                    }}>
                      {(student.name || student.email || 'S')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{student.name || 'Unnamed Student'}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{student.email}</div>
                    </div>
                  </div>
                  <Badge variant={student.riskLevel === 'Low' ? 'success' : student.riskLevel === 'Medium' ? 'warning' : 'error'}>
                    {student.riskLevel} Risk
                  </Badge>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>Mentorship Progress</span>
                    <span>{student.progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${student.progress}%`, background: 'var(--accent-cyan)', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1rem 0', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12}/> Meetings</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{student.meetingsCount}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={12}/> Reports</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{student.reportsCount}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12}/> Last Meet</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginTop: '2px' }}>{student.lastMeeting}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="secondary" size="sm" style={{ flex: 1 }}>View Profile</Button>
                  <Button variant="primary" size="sm" style={{ flex: 1 }}>Schedule</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
      <style>{`
        .hover-scale:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border-color: var(--accent-cyan);
        }
      `}</style>
    </div>
  );
}
