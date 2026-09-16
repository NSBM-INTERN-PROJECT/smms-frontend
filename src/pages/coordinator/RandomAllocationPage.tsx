import React, { useState } from 'react';
import { allocationApi } from '../../api/allocation.api';
import type { RandomAllocationResult } from '../../types/allocation.types';

export const RandomAllocationPage: React.FC = () => {
  const [result, setResult] = useState<RandomAllocationResult | null>(null);

  const handleRun = async () => {
    try {
      const res = await allocationApi.randomAllocate({});
      setResult(res);
      alert('Random allocation completed');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Random allocation failed');
    }
  };

  return (
    <div className="p-4">
      <h2>Random Allocation Engine</h2>
      <button onClick={handleRun}>Run Engine</button>
      {result && (
        <div>
          <h3>Total Allocated: {result.totalAllocated}</h3>
          <pre>{JSON.stringify(result.allocations, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};