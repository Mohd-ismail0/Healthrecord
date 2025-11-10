import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

const DashboardScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>3</Title>
              <Paragraph>Active Courses</Paragraph>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>12</Title>
              <Paragraph>Lab Reports</Paragraph>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>27</Title>
              <Paragraph>Total Records</Paragraph>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>2</Title>
              <Paragraph>Days to Next Dose</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <Card.Title title="Recent Activity" />
          <Card.Content>
            <View style={styles.activityItem}>
              <Paragraph style={styles.activityTitle}>Lab Report Added</Paragraph>
              <Paragraph style={styles.activityTime}>2 hours ago</Paragraph>
            </View>
            <View style={styles.activityItem}>
              <Paragraph style={styles.activityTitle}>Course Updated</Paragraph>
              <Paragraph style={styles.activityTime}>1 day ago</Paragraph>
            </View>
            <View style={styles.activityItem}>
              <Paragraph style={styles.activityTitle}>Document Uploaded</Paragraph>
              <Paragraph style={styles.activityTime}>3 days ago</Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actions}>
          <Button mode="contained" style={styles.button}>
            Upload Document
          </Button>
          <Button mode="outlined" style={styles.button}>
            Add Medication
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  card: {
    marginBottom: 16,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activityTitle: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    marginTop: 16,
  },
  button: {
    marginBottom: 12,
  },
});

export default DashboardScreen;
