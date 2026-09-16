import React, { useState } from 'react';
import { allocationApi } from '../../api/allocation.api';
import type { AllocationResponse } from '../../types/allocation.types';

export const MentorStudentsPage: React.FC = () => {
  const [mentorId, setMentorId] = useState<number | ''>('');
  const [students, setStudents] = useState<AllocationResponse[]>([]);

  const handleFetch = async () => {
    if (!mentorId) return;
    try {
      const res = await allocationApi.getMentorStudents(Number(mentorId));
      setStudents(res);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch mentor students');
    }
  };

  return (
    <div className="p-4">
      <h2>Mentor's Students</h2>
      <input type="number" placeholder="Mentor User ID" value={mentorId} onChange={(e) => setMentorId(e.target.value ? Number(e.target.value) : '')} />
      <button onClick={handleFetch}>Search</button>

      <ul style={{ marginTop: 15 }}>
        {students.map((item) => (
          <li key={item.id}>Student ID: {item.studentUserId} | Status: {item.status}</li>
        ))}
      </ul>
    </div>
  );
};
