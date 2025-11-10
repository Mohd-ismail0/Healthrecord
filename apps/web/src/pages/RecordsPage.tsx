import React from 'react';
import type { Record } from '@healthtrack/schemas';

const RecordsPage: React.FC = () => {
  // Mock data
  const records: Record[] = [
    {
      recordId: '1',
      userId: 'U123',
      recordType: 'course' as const,
      source: 'manual' as const,
      verified: true,
      version: 1,
      data: {},
      createdAt: '2025-11-10T08:00:00Z',
      updatedAt: '2025-11-10T08:00:00Z',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Records</h1>
        <div className="flex gap-2">
          <button className="btn-secondary">Filter</button>
          <button className="btn-primary">Export</button>
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.recordId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold">
                  {record.recordType === 'course' ? 'Medication Course' : 'Lab Report'}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(record.createdAt).toLocaleDateString()} • {record.source}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {record.verified && (
                  <span className="text-success text-sm">✓ Verified</span>
                )}
                <button className="text-primary hover:underline">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecordsPage;
