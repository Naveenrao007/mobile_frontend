import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/common/Button';
import { FloatingInput } from '../../../components/common/FloatingInput';
import { Card } from '../../../components/common/Card';
import { CustomDropdown } from '../../../components/common/CustomDropdown';
import { MainLayout } from '../../../components/layout/MainLayout';
import { colors } from '../../../styles/colors';
import { friendService, Friend } from '../../../services/friendService';
import { partnerService } from '../../../services/partnerService';
import { FriendsTable } from './FriendsTable';
import Toast from 'react-native-toast-message';

export function AddFriendScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<Array<{ id: number; name: string }>>([]);
  const [formData, setFormData] = useState<Friend>({
    name: '',
    email: '',
    mobile: '',
    notes: '',
  });
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const response = await partnerService.getAll();
      console.log('Partners response:', response);
      const partnersList = response.partners || response || [];
      setPartners(Array.isArray(partnersList) ? partnersList : []);
      
      if (partnersList.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Partners',
          text2: 'Please setup partners first in company settings',
        });
      }
    } catch (error: any) {
      console.error('Error loading partners:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load partners',
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Friend name is required',
      });
      return;
    }

    if (!selectedPartnerId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a partner',
      });
      return;
    }

    setLoading(true);
    try {
      await friendService.add({
        ...formData,
        partner_id: selectedPartnerId,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Friend added successfully',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        notes: '',
      });
      
      // Refresh table
      setTableRefreshKey(prev => prev + 1);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to add friend',
      });
    } finally {
      setLoading(false);
    }
  };

  const partnerOptions = partners.map(p => ({
    label: p.name || `Partner ${p.id}`,
    value: p.id,
  }));

  // Debug: Log partner options
  useEffect(() => {
    console.log('Partner options:', partnerOptions);
    console.log('Partners count:', partners.length);
  }, [partners]);

  return (
    <MainLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Friend</Text>
            <Text style={styles.subtitle}>Add a new friend who lends credit cards</Text>
          </View>

          {/* Partner Selection */}
          <Card style={styles.card} padding={24}>
            <Text style={styles.sectionTitle}>Select Partner</Text>
            {partners.length === 0 ? (
              <View style={styles.noPartnersContainer}>
                <Ionicons name="information-circle-outline" size={48} color={colors.textSecondary} style={styles.infoIcon} />
                <Text style={styles.noPartnersText}>
                  No partners found. Please setup partners first.
                </Text>
                <Text style={styles.noPartnersSubtext}>
                  Partners need to be configured during company registration.
                </Text>
              </View>
            ) : (
              <>
                <CustomDropdown
                  label="Partner"
                  value={selectedPartnerId}
                  options={partnerOptions}
                  onSelect={(option) => setSelectedPartnerId(option.value as number)}
                  placeholder="Select a partner"
                  required
                />
                {selectedPartnerId && (
                  <View style={styles.infoContainer}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.infoIconSmall} />
                    <Text style={styles.infoText}>
                      Friends will be assigned to: <Text style={styles.infoTextBold}>{partners.find(p => p.id === selectedPartnerId)?.name}</Text>
                    </Text>
                  </View>
                )}
              </>
            )}
          </Card>

          {/* Add Friend Form */}
          {selectedPartnerId && (
            <Card style={styles.card} padding={24}>
              <Text style={styles.sectionTitle}>Add New Friend</Text>
              <View style={styles.formFields}>
                <FloatingInput
                  label="Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter friend name"
                  disabled={loading}
                  required
                  marginBottom={16}
                />

                <FloatingInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  disabled={loading}
                  marginBottom={16}
                />

                <FloatingInput
                  label="Mobile"
                  value={formData.mobile}
                  onChangeText={(text) => setFormData({ ...formData, mobile: text.replace(/\D/g, '') })}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  disabled={loading}
                  marginBottom={16}
                />

                <FloatingInput
                  label="Notes"
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Additional notes"
                  disabled={loading}
                  marginBottom={8}
                />
              </View>

              <Button
                title="Add Friend"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                fullWidth
                style={styles.submitButton}
              />
            </Card>
          )}

          {/* Friends Table */}
          {selectedPartnerId && (
            <FriendsTable 
              partnerId={selectedPartnerId}
              refreshKey={tableRefreshKey}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: Platform.OS === 'web' ? 24 : 20,
    paddingBottom: Platform.OS === 'web' ? 40 : 20,
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
    width: '100%',
  },
  header: {
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: Platform.OS === 'web' ? -0.5 : 0,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  card: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryLight,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 14,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoIconSmall: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: '600',
    color: colors.primary,
  },
  infoIcon: {
    marginBottom: 12,
  },
  formFields: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
  },
  noPartnersContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  noPartnersText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  noPartnersSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
