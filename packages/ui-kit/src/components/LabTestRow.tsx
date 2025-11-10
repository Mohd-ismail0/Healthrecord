/**
 * Lab Test Row Component
 * Displays a single lab test result with trend indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LabTestData } from '@healthtrack/schemas';
import { INTERPRETATION_COLORS } from '@healthtrack/schemas';

interface LabTestRowProps {
  test: LabTestData;
  showTrend?: boolean;
}

const LabTestRow: React.FC<LabTestRowProps> = ({ test, showTrend = true }) => {
  const getInterpretationColor = (interpretation?: string) => {
    if (!interpretation) return '#6C757D';
    return INTERPRETATION_COLORS[interpretation as keyof typeof INTERPRETATION_COLORS] || '#6C757D';
  };

  const getTrendIcon = (changePercent?: number) => {
    if (!changePercent) return '';
    if (changePercent > 0) return '↑';
    if (changePercent < 0) return '↓';
    return '→';
  };

  const getTrendColor = (changePercent?: number) => {
    if (!changePercent) return '#6C757D';
    if (Math.abs(changePercent) < 5) return '#6C757D'; // Minimal change
    if (changePercent > 0) return '#DC3545'; // Increase
    return '#28A745'; // Decrease
  };

  return (
    <View style={styles.container}>
      <View style={styles.testInfo}>
        <Text style={styles.testName}>{test.testName}</Text>
        <Text style={styles.testDate}>{test.testDate}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <View
          style={[
            styles.valueBox,
            { borderColor: getInterpretationColor(test.interpretation) },
          ]}
        >
          <Text style={styles.value}>
            {test.value} {test.unit}
          </Text>
          {test.interpretation && (
            <Text
              style={[
                styles.interpretation,
                { color: getInterpretationColor(test.interpretation) },
              ]}
            >
              {test.interpretation.toUpperCase()}
            </Text>
          )}
        </View>
        
        {showTrend && test.changePercent !== undefined && (
          <View style={styles.trendContainer}>
            <Text
              style={[
                styles.trendIcon,
                { color: getTrendColor(test.changePercent) },
              ]}
            >
              {getTrendIcon(test.changePercent)}
            </Text>
            <Text
              style={[
                styles.trendValue,
                { color: getTrendColor(test.changePercent) },
              ]}
            >
              {Math.abs(test.changePercent).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      
      {test.referenceRange && (
        <Text style={styles.referenceRange}>
          Reference: {test.referenceRange}
        </Text>
      )}
      
      {test.labName && (
        <Text style={styles.labName}>{test.labName}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  testInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  testDate: {
    fontSize: 12,
    color: '#666',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  interpretation: {
    fontSize: 10,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  referenceRange: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  labName: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default LabTestRow;
