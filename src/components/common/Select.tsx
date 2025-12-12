import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { colors } from '../../styles/colors';

interface SelectOption {
  label: string;
  value: number | string;
}

interface SelectProps {
  label?: string;
  value?: number | string | null;
  options: SelectOption[];
  onSelect: (value: number | string) => void;
  placeholder?: string;
  required?: boolean;
}

export function Select({ label, value, options, onSelect, placeholder = 'Select...', required }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={styles.select}
        onPress={() => {
          if (options.length === 0) {
            console.warn('No options available in Select component');
            return;
          }
          setIsOpen(true);
        }}
        disabled={options.length === 0}
      >
        <Text style={[styles.selectText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : (options.length === 0 ? 'No partners available' : placeholder)}
        </Text>
        <Text style={[styles.arrow, options.length === 0 && styles.disabledArrow]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            {options.length === 0 ? (
              <View style={styles.emptyOptions}>
                <Text style={styles.emptyText}>No options available</Text>
                <Text style={styles.emptySubtext}>Please setup partners first</Text>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      value === item.value && styles.optionSelected
                    ]}
                    onPress={() => {
                      onSelect(item.value);
                      setIsOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      value === item.value && styles.optionTextSelected
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  selectText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  arrow: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  disabledArrow: {
    opacity: 0.3,
  },
  emptyOptions: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});

