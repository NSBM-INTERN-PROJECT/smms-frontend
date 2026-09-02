import React, { useEffect, useState } from 'react';
import { Card } from '../../components/atoms/Card';
import { Spinner } from '../../components/atoms/Spinner';

export default function CoordinatorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate fetch from GET /api/v1/dashboard
    setTimeout(() => {
      setData({
        pendingAllocations: 45,
        activeMentors: 50,
        openEscalations: 5
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Pending Allocations</h3>
          <p className="text-3xl font-bold">{data.pendingAllocations}</p>
        </Card>
        <Card className="glow-cyan p-4">
          <h3 className="text-gray-500 text-sm">Active Mentors</h3>
          <p className="text-3xl font-bold">{data.activeMentors}</p>
        </Card>
        <Card className="glow-amber p-4">
          <h3 className="text-gray-500 text-sm">Open Escalations</h3>
          <p className="text-3xl font-bold text-amber-500">{data.openEscalations}</p>
        </Card>
      </div>
    </div>
  );
}
