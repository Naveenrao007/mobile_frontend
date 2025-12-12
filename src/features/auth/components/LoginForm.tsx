import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../../redux/store/store';
import { setEmail, setPassword, setUserAndToken } from '../../../redux/slices/authSlice';
import { loginUser, loginWithSelectedTenant, saveAuthData } from '../../../services/authService';
import Toast from 'react-native-toast-message';
import { Button } from '../../../components/common/Button';
import { FloatingInput } from '../../../components/common/FloatingInput';
import { Card } from '../../../components/common/Card';
import { CustomDropdown } from '../../../components/common/CustomDropdown';
import { colors } from '../../../styles/colors';

export function LoginForm() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { email, password } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTenantSelection, setShowTenantSelection] = useState(false);
  const [availableTenants, setAvailableTenants] = useState<Array<{ tenantid: number; compid: number; dbName?: string }>>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter email/username and password',
      });
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginUser(email, password);

      // Check if tenant selection is required
      if ('requiresTenantSelection' in result && result.requiresTenantSelection) {
        setAvailableTenants(result.tenants || []);
        setShowTenantSelection(true);
        setLoading(false);
        return;
      }

      // Normal login response
      if ('token' in result && result.token) {
        await saveAuthData(result.token, result.user);
        dispatch(setUserAndToken({ user: result.user, token: result.token }));

        Toast.show({
          type: 'success',
          text1: 'Login Successful!',
          text2: `Welcome back, ${result.user.UserName}!`,
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      setErrorMessage(errorMsg);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSelection = async () => {
    if (!selectedTenantId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a tenant',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithSelectedTenant(email, password, selectedTenantId);
      await saveAuthData(result.token, result.user);
      dispatch(setUserAndToken({ user: result.user, token: result.token }));
      setShowTenantSelection(false);

      Toast.show({
        type: 'success',
        text1: 'Login Successful!',
        text2: `Welcome back, ${result.user.UserName}!`,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mobile Booking</Text>
          <Text style={styles.subtitle}>Management System</Text>
        </View>

        <Card style={styles.card}>
          {!showTenantSelection ? (
            <>
              <FloatingInput
                label="Email / Username"
                value={email}
                onChangeText={(text) => dispatch(setEmail(text))}
                placeholder="Enter email or username"
                autoCapitalize="none"
                keyboardType="email-address"
                disabled={loading}
              />

              <FloatingInput
                label="Password"
                value={password}
                onChangeText={(text) => dispatch(setPassword(text))}
                placeholder="Enter password"
                secureTextEntry
                disabled={loading}
              />

              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

          <Button
            title="Login"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.loginButton}
          />

          <View style={styles.registerSection}>
            <Text style={styles.registerText}>New Company?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CompanyRegistration')}>
              <Text style={styles.registerLink}>Register Your Company</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Test Credentials:</Text>
            <Text style={styles.infoTextSmall}>Email: admin@example.com</Text>
            <Text style={styles.infoTextSmall}>Password: password123</Text>
          </View>
            </>
          ) : (
            <>
              <Text style={styles.tenantTitle}>Select Tenant</Text>
              <Text style={styles.tenantSubtitle}>Multiple tenants found. Please select one:</Text>

              <CustomDropdown
                label="Tenant"
                options={availableTenants.map((tenant) => ({
                  label: `Tenant ${tenant.tenantid} (Company ${tenant.compid})`,
                  value: tenant.tenantid,
                }))}
                value={selectedTenantId}
                onSelect={(option) => setSelectedTenantId(option.value as number)}
                placeholder="Select a tenant"
                required
              />

              <View style={styles.tenantActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowTenantSelection(false);
                    setSelectedTenantId(null);
                  }}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title="Continue"
                  onPress={handleTenantSelection}
                  loading={loading}
                  disabled={loading || !selectedTenantId}
                  style={styles.continueButton}
                />
              </View>
            </>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  card: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  loginButton: {
    marginTop: 10,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  infoBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  infoTextSmall: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tenantTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tenantSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  tenantButton: {
    marginBottom: 12,
  },
  tenantActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
  registerSection: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  registerButton: {
    padding: 8,
  },
  registerLink: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
