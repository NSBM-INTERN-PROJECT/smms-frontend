import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate fetch from GET /api/v1/dashboard
    setTimeout(() => {
      setData({
        totalStudents: 1520,
        activeMentors: 145,
        sessions: 320,
        openEscalations: 12
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Total Students</h3>
          <p className="text-3xl font-bold">{data.totalStudents}</p>
        </Card>
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Active Mentors</h3>
          <p className="text-3xl font-bold">{data.activeMentors}</p>
        </Card>
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Sessions</h3>
          <p className="text-3xl font-bold">{data.sessions}</p>
        </Card>
        <Card className="glow-amber p-4">
          <h3 className="text-gray-500 text-sm">Open Escalations</h3>
          <p className="text-3xl font-bold text-amber-500">{data.openEscalations}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-4 h-64 flex items-center justify-center border-dashed border-2">
          <span className="text-gray-400">Dummy Bar Chart Layout</span>
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Escalations</h2>
          <ul className="space-y-2">
            <li className="flex justify-between items-center p-2 border-b">
              <span>Issue with Mentor M-01</span>
              <Badge variant="warning">Pending</Badge>
            </li>
            <li className="flex justify-between items-center p-2 border-b">
              <span>Student S-102 inactive</span>
              <Badge variant="danger">Critical</Badge>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
