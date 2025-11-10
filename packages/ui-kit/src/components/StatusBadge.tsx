/**
 * Status Badge Component
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

interface StatusBadgeProps {
  status: 'active' | 'paused' | 'completed' | 'pending' | 'verified';
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return '#28A745';
      case 'paused':
        return '#FFA500';
      case 'completed':
        return '#6C757D';
      case 'pending':
        return '#FFC107';
      case 'verified':
        return '#28A745';
      default:
        return '#6C757D';
    }
  };

  const getStatusLabel = () => {
    if (label) return label;
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Chip
      mode="outlined"
      style={[styles.chip, { borderColor: getStatusColor() }]}
      textStyle={{ color: getStatusColor() }}
    >
      {getStatusLabel()}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
  },
});

export default StatusBadge;
