import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Platform } from 'react-native';
import ReactDOM from 'react-dom';
import { colors } from '../../styles/colors';
import { Button } from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  data?: {
    label: string;
    value: string | number;
  }[];
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'error' | 'info' | 'success';
  confirmDisabled?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  data = [],
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'success',
  confirmDisabled = false,
}) => {
  if (!isOpen) return null;

  // Color scheme matching cosmosMobileApp design
  let accentColor = '#059669'; // green
  let headerBg = '#2C396D'; // Dark blue matching cosmosMobileApp
  let messageBg = '#dcfce7';
  let messageText = '#059669';

  if (type === 'error') {
    accentColor = '#D92D20';
    messageBg = '#fee2e2';
    messageText = '#B91C1C';
  } else if (type === 'info') {
    accentColor = '#F59E42';
    messageBg = '#fef9c3';
    messageText = '#92400e';
  } else if (type === 'success') {
    accentColor = '#059669';
    messageBg = '#dcfce7';
    messageText = '#059669';
  }

  const modalContent = (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={[styles.header, { backgroundColor: headerBg }]}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Pressable 
            onPress={onClose} 
            style={styles.closeButton}
            {...(Platform.OS === 'web' ? {
              onMouseEnter: (e: any) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              },
              onMouseLeave: (e: any) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
              },
            } : {})}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.messageContainer, { backgroundColor: messageBg }]}>
            <Text style={[styles.messageText, { color: messageText }]}>{message}</Text>
          </View>

          {data.length > 0 && (
            <View style={styles.dataContainer}>
              {data.map((item, index) => {
                const isSectionHeader = !item.value && item.label === item.label.toUpperCase();

                if (isSectionHeader) {
                  return (
                    <View key={index} style={styles.sectionHeader}>
                      <Text style={[styles.sectionHeaderText, { color: headerBg }]}>
                        {item.label}
                      </Text>
                    </View>
                  );
                }

                return (
                  <View key={index} style={styles.dataRow}>
                    <Text style={styles.dataLabel}>{item.label}:</Text>
                    <Text
                      style={[
                        styles.dataValue,
                        {
                          color:
                            item.label === 'Entered Value' && type === 'error'
                              ? '#B91C1C'
                              : headerBg,
                        },
                      ]}
                    >
                      {item.value}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.buttonContainer}>
            {onCancel && (
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onConfirm || onClose}
              disabled={confirmDisabled}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                { backgroundColor: headerBg },
                confirmDisabled && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  // Use portal on web, Modal on mobile (matching cosmosMobileApp pattern)
  if (Platform.OS === 'web' && typeof document !== 'undefined' && document.body) {
    return isOpen ? ReactDOM.createPortal(modalContent, document.body) : null;
  }

  // Mobile: Use React Native Modal for proper overlay
  return (
    <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
      {modalContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }),
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: '90%',
    maxWidth: 450,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  messageText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  dataContainer: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 2,
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dataLabel: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  dataValue: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  button: {
    minWidth: Platform.OS === 'web' ? 120 : 100,
    paddingVertical: 12,
    paddingHorizontal: Platform.OS === 'web' ? 28 : 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    // backgroundColor will be set inline from headerBg
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

export default SuccessModal;

