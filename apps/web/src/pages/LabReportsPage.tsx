import React from 'react';
import type { LabTestData } from '@healthtrack/schemas';

const LabReportsPage: React.FC = () => {
  // Mock data - replace with actual API call
  const tests: LabTestData[] = [
    {
      testId: '1',
      testName: 'Hemoglobin',
      value: 13.5,
      unit: 'g/dL',
      referenceRange: '12.0-16.0',
      testDate: '2025-11-10',
      interpretation: 'normal',
      previousValue: 12.9,
      changePercent: 4.65,
    },
    {
      testId: '2',
      testName: 'Blood Glucose',
      value: 95,
      unit: 'mg/dL',
      referenceRange: '70-100',
      testDate: '2025-11-10',
      interpretation: 'normal',
      previousValue: 102,
      changePercent: -6.86,
    },
    {
      testId: '3',
      testName: 'Total Cholesterol',
      value: 210,
      unit: 'mg/dL',
      referenceRange: '< 200',
      testDate: '2025-11-10',
      interpretation: 'high',
      previousValue: 195,
      changePercent: 7.69,
    },
  ];

  const getInterpretationColor = (interpretation: string) => {
    switch (interpretation) {
      case 'low':
        return 'text-warning';
      case 'normal':
        return 'text-success';
      case 'high':
        return 'text-warning';
      case 'critical':
        return 'text-error';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (changePercent: number) => {
    if (changePercent > 0) return '↑';
    if (changePercent < 0) return '↓';
    return '→';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lab Reports</h1>
        <button className="btn-primary">+ Add Lab Report</button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Test Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference Range</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Change</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.testId} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium">{test.testName}</td>
                  <td className="py-4 px-4">
                    <span className="font-bold">
                      {test.value} {test.unit}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{test.referenceRange}</td>
                  <td className="py-4 px-4">
                    {test.changePercent !== undefined && (
                      <span
                        className={`font-semibold ${
                          Math.abs(test.changePercent) > 5
                            ? test.changePercent > 0
                              ? 'text-error'
                              : 'text-success'
                            : 'text-gray-600'
                        }`}
                      >
                        {getTrendIcon(test.changePercent)}{' '}
                        {Math.abs(test.changePercent).toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{test.testDate}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${getInterpretationColor(
                        test.interpretation || ''
                      )}`}
                    >
                      {test.interpretation?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No lab reports found</p>
        </div>
      )}
    </div>
  );
};

export default LabReportsPage;
