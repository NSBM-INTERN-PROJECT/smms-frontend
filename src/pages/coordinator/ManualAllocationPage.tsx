import React, { useState } from 'react';
import { allocationApi } from '../../api/allocation.api';

export const ManualAllocationPage: React.FC = () => {
  const [mentorUserId, setMentorUserId] = useState<number | ''>('');
  const [studentUserId, setStudentUserId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorUserId || !studentUserId) return;
    try {
      await allocationApi.manualAllocate({ mentorUserId: Number(mentorUserId), studentUserId: Number(studentUserId), notes });
      alert('Student allocated successfully');
      setMentorUserId('');
      setStudentUserId('');
      setNotes('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Manual allocation failed');
    }
  };

  return (
    <div className="p-4">
      <h2>Manual Allocation</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mentor User ID: </label>
          <input type="number" value={mentorUserId} onChange={(e) => setMentorUserId(e.target.value ? Number(e.target.value) : '')} required />
        </div>
        <div>
          <label>Student User ID: </label>
          <input type="number" value={studentUserId} onChange={(e) => setStudentUserId(e.target.value ? Number(e.target.value) : '')} required />
        </div>
        <div>
          <label>Notes: </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button type="submit">Allocate</button>
      </form>
    </div>
  );
};