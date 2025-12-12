import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Modal, FlatList, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

type Option = string | {
  label?: string;
  value?: string | number;
};

interface CustomDropdownProps {
  options: Option[];
  value?: Option | string | number;
  onSelect?: (option: { label: string; value: string }) => void;
  label?: string;
  placeholder?: string;
  width?: number | string;
  error?: boolean | string | string[];
  required?: boolean;
  disabled?: boolean;
  flex?: number;
  searchable?: boolean;
  onFocus?: () => void;
  onOpen?: () => void;
}

const getLabel = (option: Option): string => {
  if (typeof option === 'string') return option;
  if (option?.label) return String(option.label);
  return '';
};

const getValue = (option: Option): string => {
  if (typeof option === 'string') return option;
  if (option?.value !== undefined) return String(option.value);
  return '';
};

const findOptionByValue = (options: Option[], value: string | number | Option | undefined): Option | undefined => {
  if (!options || options.length === 0) return undefined;
  if (value === undefined || value === null) return undefined;
  const searchValue = typeof value === 'string' || typeof value === 'number' ? String(value) : getValue(value);
  if (!searchValue || searchValue === '') return undefined;
  return options.find((opt) => getValue(opt) === searchValue);
};

// Option item component for better event handling
const DropdownOption: React.FC<{
  item: Option;
  index: number;
  isSelected: boolean;
  isHighlighted: boolean;
  optionBgColor: string;
  optionTextColor: string;
  onSelect: (item: Option) => void;
  onMouseEnter: () => void;
}> = ({ item, index, isSelected, isHighlighted, optionBgColor, optionTextColor, onSelect, onMouseEnter }) => {
  const optionRef = React.useRef<any>(null);

  // Attach native click handler for web
  React.useEffect(() => {
    if (Platform.OS === 'web' && optionRef.current) {
      const element = optionRef.current;
      const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect(item);
      };
      element.addEventListener('click', handleClick, true);
      return () => {
        element.removeEventListener('click', handleClick, true);
      };
    }
  }, [item, onSelect]);

  return (
    <TouchableOpacity
      ref={optionRef}
      activeOpacity={0.7}
      style={[
        styles.option,
        {
          backgroundColor: optionBgColor,
          height: 44,
          minHeight: 44,
          cursor: 'pointer',
          userSelect: 'none',
        } as any,
      ]}
      onPress={() => {
        onSelect(item);
      }}
      onMouseEnter={onMouseEnter}
    >
      <Text
        style={[
          styles.optionText,
          {
            color: optionTextColor,
            fontWeight: isSelected ? '600' : '500',
            pointerEvents: 'none',
          } as any,
        ]}
      >
        {getLabel(item) || ' '}
      </Text>
    </TouchableOpacity>
  );
};

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  value,
  onSelect,
  label = 'Select',
  placeholder = 'Select an option',
  width = '100%',
  error = false,
  required = false,
  disabled = false,
  flex,
  searchable = true,
  onFocus,
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Option | undefined>(findOptionByValue(options, value));
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [portalPosition, setPortalPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<any>(null);
  const containerRef = useRef<View | null>(null);

  const hasError = !!error;
  const hasValue = selected && getLabel(selected).length > 0;
  const showFloatingLabel = isOpen || hasValue;

  useEffect(() => {
    const newSelected = findOptionByValue(options, value);
    setSelected(newSelected);
  }, [value, options]);

  const filteredOptions = React.useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.filter((opt) => {
      const label = getLabel(opt).toLowerCase().trim();
      const searchStr = (search || '').toLowerCase().trim();
      return label.includes(searchStr);
    });
  }, [options, search]);

  const handleSelect = useCallback(
    (option: Option) => {
      const selectedOption = {
        label: getLabel(option),
        value: getValue(option),
      };
      setSelected(option);
      setIsOpen(false);
      setSearch('');
      setHighlightedIndex(-1);
      if (onSelect) {
        onSelect(selectedOption);
      }
    },
    [onSelect]
  );

  const handleInputChange = (text: string) => {
    setSearch(text);
    setHighlightedIndex(-1);
  };

  const handleFocus = useCallback(() => {
    if (onFocus) onFocus();
    if (!disabled && searchable) {
      setIsOpen(true);
      if (onOpen) onOpen();
    }
  }, [onFocus, disabled, searchable, onOpen]);

  const getErrorMessage = () => {
    if (!error) return '';
    if (Array.isArray(error)) return error.filter(Boolean).join(', ');
    if (typeof error === 'string') return error;
    return 'This field is required';
  };

  const borderColor = hasError ? colors.error : '#bcc0cf';
  const borderBottomColor = hasError ? colors.error : '#bcc0cf';

  // Position calculation for web portal
  useEffect(() => {
    if (Platform.OS === 'web' && isOpen) {
      const updatePosition = () => {
        if (containerRef.current) {
          const element = containerRef.current as any;
          if (element.getBoundingClientRect) {
            const rect = element.getBoundingClientRect();
            setPortalPosition({
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
            });
          }
        }
      };
      updatePosition();
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
      }
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', updatePosition);
          window.removeEventListener('scroll', updatePosition, true);
        }
      };
    }
  }, [isOpen]);


  // Click outside to close (web) - use a delay to allow option clicks to process first
  useEffect(() => {
    if (Platform.OS === 'web' && isOpen) {
      let clickTimeout: NodeJS.Timeout;
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        // Check if click is inside the dropdown options
        const dropdownElement = target.closest('[data-dropdown-options]');
        if (dropdownElement) {
          return; // Don't close if clicking inside dropdown
        }
        // Check if click is on the container or input
        if (
          containerRef.current &&
          (containerRef.current as any).contains(target)
        ) {
          return; // Don't close if clicking on input/container
        }
        // Delay closing to allow option selection to process first
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          setIsOpen(false);
        }, 100);
      };
      if (typeof document !== 'undefined') {
        // Use a slight delay to ensure option clicks are processed first
        const timeoutId = setTimeout(() => {
          document.addEventListener('click', handleClickOutside, true);
        }, 0);
        return () => {
          clearTimeout(timeoutId);
          clearTimeout(clickTimeout);
          document.removeEventListener('click', handleClickOutside, true);
        };
      }
    }
  }, [isOpen]);

  return (
    <View style={[{ flex, width }]}>
      {showFloatingLabel && (
        <Text style={[styles.floatingLabel, { color: hasError ? colors.error : colors.text }]}>
          {label}
          {required && <Text style={{ color: hasError ? colors.error : colors.primary }}> *</Text>}
        </Text>
      )}

      <View ref={containerRef} style={styles.inputContainer}>
        {isOpen && searchable ? (
          <TextInput
            ref={inputRef}
            value={search}
            onChangeText={handleInputChange}
            placeholder={!showFloatingLabel ? `${label}${required ? ' *' : ''}` : placeholder}
            placeholderTextColor="#000000"
              style={[
                styles.input,
                {
                  borderColor,
                  borderBottomWidth: isOpen || hasError ? 6 : 1,
                  borderBottomColor: isOpen || hasError ? '#dc2626' : borderBottomColor,
                  borderRadius: isOpen ? 0 : 6,
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                  borderBottomLeftRadius: isOpen ? 0 : 6,
                  borderBottomRightRadius: isOpen ? 0 : 6,
                },
              ]}
            onFocus={handleFocus}
            editable={!disabled && searchable}
          />
        ) : (
          <Pressable
            onPress={() => {
              if (!disabled) {
                setIsOpen(true);
                if (onOpen) onOpen();
              }
            }}
            style={styles.inputPressable}
          >
            <TextInput
              ref={inputRef}
              value={selected ? getLabel(selected) : ''}
              placeholder={!showFloatingLabel ? `${label}${required ? ' *' : ''}` : placeholder}
              placeholderTextColor="#000000"
              style={[
                styles.input,
                {
                  borderColor,
                  borderBottomWidth: hasError ? 6 : 1,
                  borderBottomColor,
                  borderRadius: 6,
                },
              ]}
              editable={false}
              onFocus={handleFocus}
            />
          </Pressable>
        )}

        <Pressable
          style={styles.chevron}
          onPress={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              if (!isOpen && onOpen) onOpen();
            }
          }}
        >
          {isOpen ? (
            <Ionicons name="chevron-up" size={24} color="#888" />
          ) : (
            <Ionicons name="chevron-down" size={24} color="#888" />
          )}
        </Pressable>
      </View>

      {hasError && (
        <Text style={styles.errorText}>{getErrorMessage()}</Text>
      )}

      {isOpen && Platform.OS === 'web' && typeof document !== 'undefined' && portalPosition.width > 0 && (() => {
        try {
          const ReactDOM = require('react-dom');
          const dropdownContent = (
          <View
            style={[
              styles.dropdownContainer,
              {
                position: 'fixed',
                top: portalPosition.top,
                left: portalPosition.left,
                width: portalPosition.width || 'auto',
                zIndex: 10050,
                marginTop: 4,
                pointerEvents: 'auto',
              } as any,
            ]}
            data-dropdown-options="true"
          >
            <ScrollView
              style={styles.optionsList}
              nestedScrollEnabled
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((item, index) => {
                  const isSelected = value !== undefined && value !== null && getValue(item) === String(value);
                  const isHighlighted = highlightedIndex === index;
                  const optionBgColor = isHighlighted
                    ? '#D92D20'
                    : isSelected
                      ? '#ffebee'
                      : index % 2 === 0
                        ? '#ffffff'
                        : '#f0f2f5';
                  const optionTextColor = isHighlighted ? '#ffffff' : isSelected ? '#dc2626' : '#1f2937';
                  
                  return (
                    <DropdownOption
                      key={`${getValue(item)}-${index}`}
                      item={item}
                      index={index}
                      isSelected={isSelected}
                      isHighlighted={isHighlighted}
                      optionBgColor={optionBgColor}
                      optionTextColor={optionTextColor}
                      onSelect={handleSelect}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {options.length === 0 ? 'No options available' : 'No options found'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
          );
          return ReactDOM.createPortal(dropdownContent, document.body);
        } catch (e) {
          console.warn('Failed to render dropdown portal:', e);
          return null;
        }
      })()}

      {isOpen && Platform.OS !== 'web' && (
        <Modal
          visible={isOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsOpen(false)}
          >
            <View style={styles.dropdownContainer}>
              <FlatList
                data={filteredOptions}
                keyExtractor={(item, index) => `${getValue(item)}-${index}`}
                renderItem={({ item, index }) => {
                  const isSelected = value !== undefined && value !== null && getValue(item) === String(value);
                  const isHighlighted = highlightedIndex === index;
                  const optionBgColor = isHighlighted
                    ? '#D92D20'
                    : isSelected
                      ? '#ffebee'
                      : index % 2 === 0
                        ? '#ffffff'
                        : '#f0f2f5';
                  const optionTextColor = isHighlighted ? '#ffffff' : isSelected ? '#dc2626' : '#1f2937';
                  
                  return (
                    <Pressable
                      style={[
                        styles.option,
                        {
                          backgroundColor: optionBgColor,
                        },
                      ]}
                      onPress={() => handleSelect(item)}
                      onPressIn={() => setHighlightedIndex(index)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: optionTextColor,
                            fontWeight: isSelected ? '600' : '500',
                          },
                        ]}
                      >
                        {getLabel(item) || ' '}
                      </Text>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {options.length === 0 ? 'No options available' : 'No options found'}
                    </Text>
                  </View>
                }
                style={styles.optionsList}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    height: Platform.OS === 'web' ? 40 : 48,
    paddingVertical: Platform.OS === 'web' ? 9 : 12,
    paddingLeft: 12,
    paddingRight: 48,
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    color: '#000000',
  },
  inputPressable: {
    width: '100%',
  },
  floatingLabel: {
    position: 'absolute',
    left: 10,
    top: -7,
    zIndex: 2,
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontWeight: '600',
    fontSize: 14,
    height: 14,
    lineHeight: 12,
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -16 }],
    zIndex: 3,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    maxHeight: 320,
    minHeight: 120,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    minHeight: 48,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: '#ffebee',
  },
  optionHighlighted: {
    backgroundColor: '#D92D20',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#dc2626',
    fontWeight: '600',
  },
  optionTextHighlighted: {
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default CustomDropdown;

