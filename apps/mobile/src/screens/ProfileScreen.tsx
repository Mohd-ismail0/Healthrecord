import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, List, Switch, Button, Divider } from 'react-native-paper';

const ProfileScreen: React.FC = () => {
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="John Doe"
            description="john.doe@example.com"
            left={(props) => <List.Icon {...props} icon="account-circle" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Settings" />
        <Card.Content>
          <List.Item
            title="Biometric Authentication"
            description="Use Face ID or fingerprint"
            right={() => (
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Notifications"
            description="Medication reminders"
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Account" />
        <Card.Content>
          <List.Item
            title="Export Data"
            description="Download your health records"
            left={(props) => <List.Icon {...props} icon="download" />}
            onPress={() => console.log('Export data')}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            onPress={() => console.log('Privacy policy')}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={() => console.log('Terms of service')}
          />
        </Card.Content>
      </Card>

      <View style={styles.signOutContainer}>
        <Button mode="outlined" textColor="#DC3545">
          Sign Out
        </Button>
      </View>
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
    marginBottom: 0,
    marginTop: 16,
  },
  signOutContainer: {
    padding: 16,
    marginTop: 16,
  },
});

export default ProfileScreen;
