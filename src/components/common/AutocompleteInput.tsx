import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Platform, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

export type AutocompleteInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suggestions: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string | string[] | boolean;
  errorMessage?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  style?: any;
  marginBottom?: number | string;
};

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value = '',
  onChangeText,
  suggestions = [],
  placeholder,
  required = false,
  disabled = false,
  error,
  errorMessage = 'This field is required',
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  style,
  marginBottom,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [portalPosition, setPortalPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<any>(null);
  const containerRef = useRef<View | null>(null);
  const hasValue = typeof value === 'string' && value.trim().length > 0;
  const showFloatingLabel = isFocused || hasValue || !!error;

  // Filter suggestions based on input value
  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && isFocused);
    } else {
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0 && isFocused);
    }
  }, [value, suggestions, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  const handleBlur = useCallback(() => {
    // Delay to allow option selection
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }, 200);
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      onChangeText(text);
      setHighlightedIndex(-1);
    },
    [onChangeText]
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      onChangeText(suggestion);
      setShowSuggestions(false);
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [onChangeText]
  );

  const getErrorMessage = useCallback(() => {
    if (!error) return '';
    if (Array.isArray(error)) {
      const filtered = error.filter(Boolean);
      return filtered.length > 0 ? filtered.join(', ') : '';
    }
    if (typeof error === 'string') return error.trim();
    if (typeof error === 'boolean' && error) {
      return String(errorMessage || 'This field is required');
    }
    return String(errorMessage || '');
  }, [error, errorMessage]);

  const hasError = !!error;
  const borderColor = hasError ? '#dc2626' : isFocused ? '#e11111' : '#bcc0cf';
  const borderBottomWidth = hasError || isFocused ? 6 : 1;
  const borderBottomColor = hasError ? '#dc2626' : isFocused ? '#e11111' : '#bcc0cf';

  // Position calculation for web portal
  useEffect(() => {
    if (Platform.OS === 'web' && showSuggestions && filteredSuggestions.length > 0) {
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
  }, [showSuggestions, filteredSuggestions.length]);

  // Click outside to close (web)
  useEffect(() => {
    if (Platform.OS === 'web' && showSuggestions) {
      let clickTimeout: NodeJS.Timeout;
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        const dropdownElement = target.closest('[data-autocomplete-options]');
        if (dropdownElement) {
          return;
        }
        if (
          containerRef.current &&
          (containerRef.current as any).contains(target)
        ) {
          return;
        }
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          setShowSuggestions(false);
        }, 100);
      };
      if (typeof document !== 'undefined') {
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
  }, [showSuggestions]);

  return (
    <View style={[{ width: '100%', marginBottom }, style]}>
      <View ref={containerRef} style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          value={value || ''}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholder={!showFloatingLabel ? `${placeholder ?? label}${required ? ' *' : ''}` : ''}
          placeholderTextColor="#000000"
          style={[
            styles.input,
            {
              borderColor,
              borderBottomWidth,
              borderBottomColor,
              paddingRight: 40,
            },
          ]}
          editable={!disabled}
          maxLength={maxLength}
        />
        {hasValue && !disabled && (
          <Pressable
            style={styles.clearIcon}
            onPress={() => {
              onChangeText('');
              inputRef.current?.focus();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {showFloatingLabel && (
        <Text style={[
          styles.floatingLabel,
          {
            color: hasError ? '#dc2626' : '#000000',
            left: isFocused ? 12 : 10,
            top: isFocused ? -6 : -7,
          }
        ]}>
          {label}
          {required && <Text style={{ color: hasError ? '#dc2626' : isFocused ? '#e11111' : '#000000' }}> *</Text>}
        </Text>
      )}

      {hasError && (() => {
        const errorMsg = getErrorMessage();
        return errorMsg && errorMsg.trim() ? (
          <Text style={styles.errorText}>{String(errorMsg)}</Text>
        ) : null;
      })()}

      {/* Suggestions dropdown for web */}
      {showSuggestions && Platform.OS === 'web' && typeof document !== 'undefined' && portalPosition.width > 0 && filteredSuggestions.length > 0 && (() => {
        try {
          const ReactDOM = require('react-dom');
          const dropdownContent = (
            <View
              style={[
                styles.suggestionsContainer,
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
              data-autocomplete-options="true"
            >
              <ScrollView
                style={styles.suggestionsList}
                nestedScrollEnabled
              >
                {filteredSuggestions.map((suggestion, index) => {
                  const isHighlighted = highlightedIndex === index;
                  const optionBgColor = isHighlighted ? '#e11111' : index % 2 === 0 ? '#ffffff' : '#f0f2f5';
                  const optionTextColor = isHighlighted ? '#ffffff' : '#1f2937';
                  
                  return (
                    <TouchableOpacity
                      key={`${suggestion}-${index}`}
                      style={[
                        styles.suggestionItem,
                        {
                          backgroundColor: optionBgColor,
                          cursor: 'pointer',
                        } as any,
                      ]}
                      onPress={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <Ionicons name="card" size={16} color={optionTextColor} style={styles.suggestionIcon} />
                      <Text
                        style={[
                          styles.suggestionText,
                          {
                            color: optionTextColor,
                            fontWeight: isHighlighted ? '600' : '500',
                          } as any,
                        ]}
                      >
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          );
          return ReactDOM.createPortal(dropdownContent, document.body);
        } catch (e) {
          console.warn('Failed to render autocomplete portal:', e);
          return null;
        }
      })()}

      {/* Suggestions modal for mobile */}
      {showSuggestions && Platform.OS !== 'web' && filteredSuggestions.length > 0 && (
        <Modal
          visible={showSuggestions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuggestions(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowSuggestions(false)}
          >
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredSuggestions}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item, index }) => {
                  const isHighlighted = highlightedIndex === index;
                  const optionBgColor = isHighlighted ? '#e11111' : index % 2 === 0 ? '#ffffff' : '#f0f2f5';
                  const optionTextColor = isHighlighted ? '#ffffff' : '#1f2937';
                  
                  return (
                    <TouchableOpacity
                      style={[
                        styles.suggestionItem,
                        {
                          backgroundColor: optionBgColor,
                        },
                      ]}
                      onPress={() => handleSelectSuggestion(item)}
                      onPressIn={() => setHighlightedIndex(index)}
                    >
                      <Ionicons name="card" size={16} color={optionTextColor} style={styles.suggestionIcon} />
                      <Text
                        style={[
                          styles.suggestionText,
                          {
                            color: optionTextColor,
                            fontWeight: isHighlighted ? '600' : '500',
                          },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                style={styles.suggestionsList}
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
    paddingRight: 12,
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    color: '#000000',
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
  clearIcon: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 4,
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
  suggestionsContainer: {
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
  suggestionsList: {
    maxHeight: 400,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    minHeight: 48,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 20,
    flex: 1,
  },
});

export default AutocompleteInput;
