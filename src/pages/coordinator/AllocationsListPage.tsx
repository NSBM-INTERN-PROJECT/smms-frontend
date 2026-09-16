import React, { useEffect, useState } from 'react';
import { allocationApi } from '../../api/allocation.api';
import type { AllocationResponse, AllocationStatus } from '../../types/allocation.types';

export const AllocationsListPage: React.FC = () => {
  const [data, setData] = useState<AllocationResponse[]>([]);
  const [status, setStatus] = useState<AllocationStatus | ''>('');

  useEffect(() => {
    allocationApi.listAll(0, 20, status || undefined)
      .then((res) => setData(res.content || []))
      .catch((err) => alert(err.response?.data?.message || 'Error loading allocations'));
  }, [status]);

  return (
    <div className="p-4">
      <h2>All Allocations</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value as AllocationStatus)}>
        <option value="">All Statuses</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
        <option value="TRANSFERRED">TRANSFERRED</option>
      </select>
      <table border={1} cellPadding={8} style={{ marginTop: 10, width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Mentor ID</th>
            <th>Student ID</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.mentorUserId}</td>
              <td>{item.studentUserId}</td>
              <td>{item.allocationType}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};