/**
 * Upload Button Component
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface UploadButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  label = 'Upload Document',
}) => {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon="upload"
      style={styles.button}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
});

export default UploadButton;
