/**
 * Course Card Component
 * Displays medication course information
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import type { CourseData } from '@healthtrack/schemas';
import { COURSE_STATUS_LABELS } from '@healthtrack/schemas';

interface CourseCardProps {
  course: CourseData;
  onMarkCompleted?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onMarkCompleted,
  onViewDetails,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#28A745';
      case 'paused':
        return '#FFA500';
      case 'completed':
        return '#6C757D';
      default:
        return '#6C757D';
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Title
        title={course.medicine}
        subtitle={`${course.dosage}${course.frequency ? ` • ${course.frequency}` : ''}`}
        right={(props) => (
          <Chip
            {...props}
            mode="outlined"
            style={[
              styles.statusChip,
              { borderColor: getStatusColor(course.status) },
            ]}
            textStyle={{ color: getStatusColor(course.status) }}
          >
            {COURSE_STATUS_LABELS[course.status]}
          </Chip>
        )}
      />
      
      <Card.Content>
        <View style={styles.row}>
          <Text style={styles.label}>Doctor:</Text>
          <Text style={styles.value}>{course.doctor}</Text>
        </View>
        
        {course.doctorSpecialty && (
          <View style={styles.row}>
            <Text style={styles.label}>Specialty:</Text>
            <Text style={styles.value}>{course.doctorSpecialty}</Text>
          </View>
        )}
        
        <View style={styles.row}>
          <Text style={styles.label}>Period:</Text>
          <Text style={styles.value}>
            {course.startDate} to {course.endDate}
          </Text>
        </View>
        
        {course.daysRemaining !== undefined && course.status === 'active' && (
          <View style={styles.row}>
            <Text style={styles.label}>Days Remaining:</Text>
            <Text style={[styles.value, styles.daysRemaining]}>
              {course.daysRemaining} days
            </Text>
          </View>
        )}
        
        {course.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.notes}>{course.notes}</Text>
          </View>
        )}
      </Card.Content>
      
      {(onMarkCompleted || onViewDetails) && (
        <Card.Actions>
          {onViewDetails && (
            <Button onPress={() => onViewDetails(course.courseId)}>
              View Details
            </Button>
          )}
          {onMarkCompleted && course.status === 'active' && (
            <Button onPress={() => onMarkCompleted(course.courseId)}>
              Mark Completed
            </Button>
          )}
        </Card.Actions>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  statusChip: {
    marginRight: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  daysRemaining: {
    fontWeight: 'bold',
    color: '#28A745',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notes: {
    marginTop: 4,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CourseCard;
