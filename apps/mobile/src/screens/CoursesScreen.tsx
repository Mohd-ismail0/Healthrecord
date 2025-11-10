import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { CourseCard } from '@healthtrack/ui-kit';
import type { CourseData } from '@healthtrack/schemas';

const CoursesScreen: React.FC = () => {
  const [value, setValue] = useState('active');

  // Mock data
  const activeCourses: CourseData[] = [
    {
      courseId: '1',
      medicine: 'Amoxicillin 500 mg',
      dosage: '1 tablet',
      frequency: 'twice daily',
      startDate: '2025-11-05',
      endDate: '2025-11-12',
      doctor: 'Dr. A. Kumar',
      status: 'active',
      daysRemaining: 2,
    },
    {
      courseId: '2',
      medicine: 'Metformin 850 mg',
      dosage: '1 tablet',
      frequency: 'once daily',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      doctor: 'Dr. B. Sharma',
      status: 'active',
      daysRemaining: 51,
    },
  ];

  const pastCourses: CourseData[] = [
    {
      courseId: '3',
      medicine: 'Azithromycin 250 mg',
      dosage: '1 tablet',
      frequency: 'once daily',
      startDate: '2025-10-15',
      endDate: '2025-10-20',
      doctor: 'Dr. A. Kumar',
      status: 'completed',
    },
  ];

  const courses = value === 'active' ? activeCourses : pastCourses;

  const handleMarkCompleted = (courseId: string) => {
    console.log('Mark completed:', courseId);
  };

  const handleViewDetails = (courseId: string) => {
    console.log('View details:', courseId);
  };

  return (
    <ScrollView style={styles.container}>
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        buttons={[
          { value: 'active', label: `Active (${activeCourses.length})` },
          { value: 'past', label: `Past (${pastCourses.length})` },
        ]}
        style={styles.segmented}
      />

      {courses.map((course) => (
        <CourseCard
          key={course.courseId}
          course={course}
          onMarkCompleted={handleMarkCompleted}
          onViewDetails={handleViewDetails}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  segmented: {
    margin: 16,
  },
});

export default CoursesScreen;
