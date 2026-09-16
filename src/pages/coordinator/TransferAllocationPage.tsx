import React, { useState } from 'react';
import { allocationApi } from '../../api/allocation.api';

export const TransferAllocationPage: React.FC = () => {
  const [allocationId, setAllocationId] = useState<number | ''>('');
  const [newMentorUserId, setNewMentorUserId] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocationId || !newMentorUserId) return;
    try {
      await allocationApi.transferStudent(Number(allocationId), {
        newMentorUserId: Number(newMentorUserId),
        reason,
      });
      alert('Student transferred successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <div className="p-4">
      <h2>Transfer Allocation</h2>
      <form onSubmit={handleTransfer}>
        <div>
          <label>Allocation ID: </label>
          <input type="number" value={allocationId} onChange={(e) => setAllocationId(e.target.value ? Number(e.target.value) : '')} required />
        </div>
        <div>
          <label>New Mentor User ID: </label>
          <input type="number" value={newMentorUserId} onChange={(e) => setNewMentorUserId(e.target.value ? Number(e.target.value) : '')} required />
        </div>
        <div>
          <label>Reason: </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
        </div>
        <button type="submit">Confirm Transfer</button>
      </form>
    </div>
  );
};