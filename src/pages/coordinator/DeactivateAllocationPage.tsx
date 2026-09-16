import React, { useState } from 'react';
import { allocationApi } from '../../api/allocation.api';

export const DeactivateAllocationPage: React.FC = () => {
  const [allocationId, setAllocationId] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocationId) return;
    try {
      await allocationApi.deactivateAllocation(Number(allocationId), { reason });
      alert('Allocation deactivated successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deactivation failed');
    }
  };

  return (
    <div className="p-4">
      <h2>Deactivate Allocation</h2>
      <form onSubmit={handleDeactivate}>
        <div>
          <label>Allocation ID: </label>
          <input type="number" value={allocationId} onChange={(e) => setAllocationId(e.target.value ? Number(e.target.value) : '')} required />
        </div>
        <div>
          <label>Reason: </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <button type="submit">Deactivate</button>
      </form>
    </div>
  );
};