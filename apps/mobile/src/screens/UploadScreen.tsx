import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';

const UploadScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleCamera = async () => {
    if (hasPermission === null) {
      await requestCameraPermission();
    }
    
    if (hasPermission === false) {
      Alert.alert('Permission Denied', 'Camera permission is required to scan documents');
      return;
    }
    
    // Navigate to camera screen
    Alert.alert('Camera', 'Camera functionality will be implemented');
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') {
        return;
      }

      Alert.alert('Success', `Selected: ${result.name}`);
      // TODO: Upload the document
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Upload Medical Document" />
        <Card.Content>
          <Text style={styles.description}>
            Upload prescription or lab report for automatic parsing
          </Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            icon="camera"
            onPress={handleCamera}
            style={styles.button}
          >
            Scan with Camera
          </Button>
          <Button
            mode="outlined"
            icon="file-upload"
            onPress={handleDocumentPicker}
            style={styles.button}
          >
            Choose File
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Manual Entry" />
        <Card.Content>
          <Text style={styles.description}>
            Prefer to type? Enter your health record data manually.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined">Manual Entry Form</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  button: {
    marginBottom: 8,
    marginHorizontal: 8,
  },
});

export default UploadScreen;
