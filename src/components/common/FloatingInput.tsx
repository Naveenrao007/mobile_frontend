import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

export type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  onFocusChange?: (focused: boolean) => void;
  onBlur?: () => void;
  error?: string | string[] | boolean;
  errorMessage?: string;
  required?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  width?: number | string;
  flex?: number;
  style?: any;
  marginBottom?: number | string;
};

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value = '',
  onChangeText,
  secureTextEntry,
  onFocusChange,
  onBlur,
  error,
  errorMessage = 'This field is required',
  required = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  placeholder,
  disabled = false,
  width = '100%',
  flex,
  style,
  marginBottom,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = typeof value === 'string' && value.trim().length > 0;
  const showFloatingLabel = isFocused || hasValue || !!error;
  const inputRef = useRef<any>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocusChange?.(true);
  }, [onFocusChange]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setHasBlurred(true);
    onFocusChange?.(false);
    if (onBlur) {
      onBlur();
    }
  }, [onFocusChange, onBlur]);

  const handleTextChange = useCallback(
    (text: string) => {
      onChangeText(text);
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
  const hasPasswordToggle = secureTextEntry;
  const inputPaddingRight = hasPasswordToggle ? 40 : 12;

  return (
    <View style={[{ flex, width, marginBottom }, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          value={value || ''}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
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
              paddingRight: inputPaddingRight,
            },
          ]}
          editable={!disabled}
          maxLength={maxLength}
        />
        {hasPasswordToggle && (
          <Pressable
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
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
  eyeIcon: {
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
});

export default FloatingInput;

