import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../../../components/common/Button';
import { FloatingInput } from '../../../components/common/FloatingInput';
import { Card } from '../../../components/common/Card';
import { colors } from '../../../styles/colors';
import api from '../../../services/api';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';

interface Partner {
  id?: number;
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  share_percentage: string;
}

export function PartnerSetupForm() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tenantId, companyName, adminEmail, adminPassword } = route.params || {};

  const [partnerCount, setPartnerCount] = useState<number>(1);
  const [partners, setPartners] = useState<Partner[]>([
    { name: '', email: '', mobile: '', password: '', confirmPassword: '', share_percentage: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [partnerCredentials, setPartnerCredentials] = useState<Array<{name: string; email: string; mobile: string; password: string}>>([]);

  const updatePartnerCount = (count: number) => {
    if (count < 1) return;
    
    setPartnerCount(count);
    
    // Adjust partners array
    const newPartners = [...partners];
    if (count > partners.length) {
      // Add new partners
      for (let i = partners.length; i < count; i++) {
        newPartners.push({ name: '', email: '', mobile: '', password: '', confirmPassword: '', share_percentage: '' });
      }
    } else {
      // Remove extra partners
      newPartners.splice(count);
    }
    setPartners(newPartners);
  };

  const updatePartner = (index: number, field: keyof Partner, value: string) => {
    const newPartners = [...partners];
    newPartners[index] = { ...newPartners[index], [field]: value };
    setPartners(newPartners);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (partners.length === 0) {
      newErrors.push('At least one partner is required');
    }

    const totalShare = partners.reduce((sum, p) => {
      return sum + parseFloat(p.share_percentage || '0');
    }, 0);

    if (Math.abs(totalShare - 100) > 0.01) {
      newErrors.push(`Total share percentage must be 100%. Current: ${totalShare.toFixed(2)}%`);
    }

    partners.forEach((partner, index) => {
      if (!partner.name.trim()) {
        newErrors.push(`Partner ${index + 1}: Name is required`);
      }
      if (!partner.share_percentage || parseFloat(partner.share_percentage) <= 0) {
        newErrors.push(`Partner ${index + 1}: Share percentage must be greater than 0`);
      }
      if (!partner.email || !partner.email.trim()) {
        newErrors.push(`Partner ${index + 1}: Email is required for login`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner.email)) {
        newErrors.push(`Partner ${index + 1}: Invalid email format`);
      }
      if (!partner.mobile || !partner.mobile.trim()) {
        newErrors.push(`Partner ${index + 1}: Mobile number is required for login`);
      } else if (!/^\d{10}$/.test(partner.mobile)) {
        newErrors.push(`Partner ${index + 1}: Mobile must be 10 digits`);
      }
      if (!partner.password || partner.password.length < 6) {
        newErrors.push(`Partner ${index + 1}: Password is required (min 6 characters)`);
      }
      if (partner.password !== partner.confirmPassword) {
        newErrors.push(`Partner ${index + 1}: Passwords do not match`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: errors[0] || 'Please fix the errors',
      });
      return;
    }

    setLoading(true);

    try {
      const partnersData = partners.map(p => ({
        name: p.name,
        email: p.email,
        mobile: p.mobile,
        password: p.password,
        share_percentage: parseFloat(p.share_percentage),
      }));

      const response = await api.post('/api/company/setup-partners', {
        tenantId,
        partners: partnersData,
      });

      Toast.show({
        type: 'success',
        text1: 'Partners Setup Complete!',
        text2: 'Your company is ready to use',
      });

      // Store partner credentials for display
      const credentials = partners.map(p => ({
        name: p.name,
        email: p.email,
        mobile: p.mobile,
        password: p.password,
      }));
      setPartnerCredentials(credentials);

      // Show success screen with login credentials
      setShowSuccess(true);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Setup failed';
      Toast.show({
        type: 'error',
        text1: 'Setup Failed',
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalShare = () => {
    return partners.reduce((sum, p) => sum + parseFloat(p.share_percentage || '0'), 0);
  };

  if (showSuccess) {
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
            <Text style={styles.successTitle}>✅ Setup Complete!</Text>
            <Text style={styles.subtitle}>{companyName}</Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.successContainer}>
              <Text style={styles.successMessage}>
                Your company has been registered successfully!
              </Text>
              
              <View style={styles.credentialsBox}>
                <Text style={styles.credentialsTitle}>Admin Login Credentials:</Text>
                <View style={styles.credentialRow}>
                  <Text style={styles.credentialLabel}>Email:</Text>
                  <Text style={styles.credentialValue}>{adminEmail}</Text>
                </View>
                <View style={styles.credentialRow}>
                  <Text style={styles.credentialLabel}>Password:</Text>
                  <Text style={styles.credentialValue}>{adminPassword}</Text>
                </View>
              </View>

              {partnerCredentials.length > 0 && (
                <View style={styles.credentialsBox}>
                  <Text style={styles.credentialsTitle}>Partner Login Credentials:</Text>
                  {partnerCredentials.map((partner, index) => (
                    <View key={index} style={styles.partnerCredentialSection}>
                      <Text style={styles.partnerName}>{partner.name}</Text>
                      <View style={styles.credentialRow}>
                        <Text style={styles.credentialLabel}>Email:</Text>
                        <Text style={styles.credentialValue}>{partner.email}</Text>
                      </View>
                      <View style={styles.credentialRow}>
                        <Text style={styles.credentialLabel}>Mobile:</Text>
                        <Text style={styles.credentialValue}>{partner.mobile}</Text>
                      </View>
                      <View style={styles.credentialRow}>
                        <Text style={styles.credentialLabel}>Password:</Text>
                        <Text style={styles.credentialValue}>{partner.password}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Please save these credentials securely. You'll need them to login.
                </Text>
              </View>

              <Button
                title="Go to Login"
                onPress={() => navigation.navigate('Login')}
                fullWidth
                style={styles.loginButton}
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
          <Text style={styles.title}>Setup Partners</Text>
          <Text style={styles.subtitle}>{companyName}</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.partnerCountSection}>
            <Text style={styles.label}>Number of Partners/Shareholders</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => updatePartnerCount(partnerCount - 1)}
                disabled={partnerCount <= 1}
              >
                <Text style={styles.counterButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{partnerCount}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => updatePartnerCount(partnerCount + 1)}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {partners.map((partner, index) => (
            <View key={index} style={styles.partnerSection}>
              <Text style={styles.partnerTitle}>Partner {index + 1}</Text>
              
              <FloatingInput
                label="Name"
                value={partner.name}
                onChangeText={(text) => updatePartner(index, 'name', text)}
                placeholder="Enter partner name"
                disabled={loading}
                required
              />

              <FloatingInput
                label="Share Percentage"
                value={partner.share_percentage}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9.]/g, '');
                  updatePartner(index, 'share_percentage', num);
                }}
                placeholder="e.g., 50.00"
                keyboardType="numeric"
                disabled={loading}
                required
              />

              <FloatingInput
                label="Email"
                value={partner.email}
                onChangeText={(text) => updatePartner(index, 'email', text)}
                placeholder="Enter email (for login)"
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={loading}
                required
              />

              <FloatingInput
                label="Mobile Number"
                value={partner.mobile}
                onChangeText={(text) => updatePartner(index, 'mobile', text.replace(/\D/g, ''))}
                placeholder="Enter mobile number (for login)"
                keyboardType="phone-pad"
                maxLength={10}
                disabled={loading}
                required
              />

              <FloatingInput
                label="Password"
                value={partner.password}
                onChangeText={(text) => updatePartner(index, 'password', text)}
                placeholder="Enter password (min 6 characters)"
                secureTextEntry
                disabled={loading}
                required
              />

              <FloatingInput
                label="Confirm Password"
                value={partner.confirmPassword}
                onChangeText={(text) => updatePartner(index, 'confirmPassword', text)}
                placeholder="Confirm password"
                secureTextEntry
                disabled={loading}
                required
              />
            </View>
          ))}

          <View style={styles.totalShareContainer}>
            <Text style={styles.totalShareLabel}>Total Share:</Text>
            <Text style={[
              styles.totalShareValue,
              Math.abs(calculateTotalShare() - 100) > 0.01 && styles.totalShareError
            ]}>
              {calculateTotalShare().toFixed(2)}%
            </Text>
          </View>

          {errors.length > 0 && (
            <View style={styles.errorContainer}>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ⚠️ Total share percentage must equal 100%
            </Text>
            <Text style={styles.infoTextSmall}>
              Each partner will be able to login using their email/mobile and password
            </Text>
          </View>

          <Button
            title="Complete Setup"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || Math.abs(calculateTotalShare() - 100) > 0.01}
            fullWidth
            style={styles.submitButton}
          />
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  card: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  partnerCountSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  partnerSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  partnerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  totalShareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    marginBottom: 16,
  },
  totalShareLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalShareValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
  },
  totalShareError: {
    color: colors.error,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 4,
  },
  infoBox: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  submitButton: {
    marginTop: 10,
  },
  successContainer: {
    padding: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  credentialsBox: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  credentialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  credentialValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 10,
  },
  partnerCredentialSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
});

