import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../../../components/common/Button';
import { FloatingInput } from '../../../components/common/FloatingInput';
import { Card } from '../../../components/common/Card';
import { colors } from '../../../styles/colors';
import api from '../../../services/api';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

interface CompanyData {
  companyName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

export function CompanyRegistrationForm() {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState<CompanyData>({
    companyName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CompanyData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CompanyData> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors below',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/company/register', {
        companyName: formData.companyName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });

      Toast.show({
        type: 'success',
        text1: 'Company Registered!',
        text2: 'Database created successfully',
      });

      // Navigate to partner setup
      navigation.navigate('PartnerSetup', {
        tenantId: response.data.tenantId,
        companyName: formData.companyName,
        adminEmail: formData.email,
        adminPassword: formData.password,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
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
          <Text style={styles.title}>Company Registration</Text>
          <Text style={styles.subtitle}>Create your business account</Text>
        </View>

        <Card style={styles.card}>
          <FloatingInput
            label="Company Name"
            value={formData.companyName}
            onChangeText={(text) => setFormData({ ...formData, companyName: text })}
            placeholder="Enter company name"
            error={errors.companyName}
            errorMessage={errors.companyName}
            disabled={loading}
            required
          />

          <FloatingInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            errorMessage={errors.email}
            disabled={loading}
            required
          />

          <FloatingInput
            label="Mobile Number"
            value={formData.mobile}
            onChangeText={(text) => setFormData({ ...formData, mobile: text.replace(/\D/g, '') })}
            placeholder="Enter 10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.mobile}
            errorMessage={errors.mobile}
            disabled={loading}
            required
          />

          <FloatingInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Enter password (min 6 characters)"
            secureTextEntry
            error={errors.password}
            errorMessage={errors.password}
            disabled={loading}
            required
          />

          <FloatingInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholder="Confirm password"
            secureTextEntry
            error={errors.confirmPassword}
            errorMessage={errors.confirmPassword}
            disabled={loading}
            required
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ⚠️ This will create a new database for your company.
            </Text>
            <Text style={styles.infoTextSmall}>
              After registration, you'll set up partners/shareholders.
            </Text>
          </View>

          <Button
            title="Register Company"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
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
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  submitButton: {
    marginTop: 10,
  },
  infoBox: {
    marginTop: 20,
    marginBottom: 10,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  infoTextSmall: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

