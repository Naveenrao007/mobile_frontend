import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PageHeaderProps {
  title: string;
  resetButton?: {
    label?: string;
    onPress: () => void;
    visible?: boolean;
  };
  style?: any;
}

export function PageHeader({ title, resetButton, style }: PageHeaderProps) {
  const showResetButton = resetButton?.visible !== false && resetButton?.onPress;

  return (
    <View style={[styles.header, style]}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      {showResetButton && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetButton.onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>{resetButton.label || 'Reset'}</Text>
          <Ionicons name="refresh" size={18} color="#ffffff" style={styles.resetIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#283777',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'web' ? 16 : 14,
    borderRadius: 12,
    minHeight: Platform.OS === 'web' ? 56 : 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 40,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: Platform.OS === 'web' ? 14 : 13,
    fontWeight: '600',
    marginRight: 6,
  },
  resetIcon: {
    marginLeft: 2,
  },
});

export default PageHeader;
