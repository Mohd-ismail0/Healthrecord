/**
 * Generic Record Card Component
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import type { Record } from '@healthtrack/schemas';

interface RecordCardProps {
  record: Record;
  onPress?: (recordId: string) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onPress }) => {
  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'manual':
        return 'Manual Entry';
      case 'ocr':
        return 'Scanned';
      case 'api':
        return 'Lab/Partner';
      default:
        return source;
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'labReport':
        return 'Lab Report';
      case 'course':
        return 'Medication';
      default:
        return type;
    }
  };

  return (
    <Card
      style={styles.card}
      onPress={onPress ? () => onPress(record.recordId) : undefined}
    >
      <Card.Title
        title={getRecordTypeLabel(record.recordType)}
        subtitle={new Date(record.createdAt).toLocaleDateString()}
        right={(props) => (
          <>
            <Chip {...props} mode="outlined" style={styles.chip}>
              {getSourceLabel(record.source)}
            </Chip>
            {record.verified && (
              <Chip
                {...props}
                mode="outlined"
                style={[styles.chip, styles.verifiedChip]}
                textStyle={styles.verifiedText}
              >
                ✓ Verified
              </Chip>
            )}
          </>
        )}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  chip: {
    marginRight: 8,
  },
  verifiedChip: {
    borderColor: '#28A745',
  },
  verifiedText: {
    color: '#28A745',
  },
});

export default RecordCard;
