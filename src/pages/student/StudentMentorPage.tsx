import React, { useState } from 'react';
import { allocationApi } from '../../api/allocation.api';
import type { AllocationResponse } from '../../types/allocation.types';

export const StudentMentorPage: React.FC = () => {
  const [studentId, setStudentId] = useState<number | ''>('');
  const [allocation, setAllocation] = useState<AllocationResponse | null>(null);

  const handleFetch = async () => {
    if (!studentId) return;
    try {
      const res = await allocationApi.getStudentMentor(Number(studentId));
      setAllocation(res);
    } catch (err: any) {
      alert(err.response?.data?.message || 'No active mentor found');
    }
  };

  return (
    <div className="p-4">
      <h2>Student's Assigned Mentor</h2>
      <input type="number" placeholder="Student User ID" value={studentId} onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : '')} />
      <button onClick={handleFetch}>Search</button>

      {allocation && (
        <div style={{ marginTop: 15 }}>
          <p><strong>Mentor User ID:</strong> {allocation.mentorUserId}</p>
          <p><strong>Assigned Date:</strong> {allocation.allocatedDate}</p>
          <p><strong>Status:</strong> {allocation.status}</p>
        </div>
      )}
    </div>
  );
};