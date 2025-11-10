import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { LabTestRow } from '@healthtrack/ui-kit';
import type { LabTestData } from '@healthtrack/schemas';

const LabReportsScreen: React.FC = () => {
  // Mock data
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

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {tests.map((test) => (
          <LabTestRow key={test.testId} test={test} showTrend={true} />
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
});

export default LabReportsScreen;
