import React, { useEffect, useState } from 'react';
import { Card } from '../../components/atoms/Card';
import { Badge } from '../../components/atoms/Badge';
import { Spinner } from '../../components/atoms/Spinner';

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate fetch from GET /api/v1/dashboard/student
    setTimeout(() => {
      setData({
        overallProgress: '75%',
        riskStatus: 'Low',
        upcomingSessions: 2
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Overall Progress</h3>
          <p className="text-3xl font-bold">{data.overallProgress}</p>
        </Card>
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Risk Status</h3>
          <div className="mt-2">
            <Badge variant="success">{data.riskStatus}</Badge>
          </div>
        </Card>
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Upcoming Sessions</h3>
          <p className="text-3xl font-bold">{data.upcomingSessions}</p>
        </Card>
      </div>
    </div>
  );
}
