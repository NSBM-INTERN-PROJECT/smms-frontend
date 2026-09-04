import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

export default function MentorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate fetch from GET /api/v1/dashboard/mentor
    setTimeout(() => {
      setData({
        myStudents: 15,
        nextMeeting: 'Today, 2:00 PM',
        pendingRequests: 3
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">My Students</h3>
          <p className="text-3xl font-bold">{data.myStudents}</p>
        </Card>
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Next Meeting</h3>
          <p className="text-xl font-bold">{data.nextMeeting}</p>
        </Card>
        <Card className="glow-amber p-4">
          <h3 className="text-gray-500 text-sm">Pending Requests</h3>
          <p className="text-3xl font-bold text-amber-500">{data.pendingRequests}</p>
        </Card>
      </div>
    </div>
  );
}
