import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { CustomDropdown } from '../../../components/common/CustomDropdown';
import { colors } from '../../../styles/colors';
import api from '../../../services/api';
import Toast from 'react-native-toast-message';

interface Platform {
  id: number;
  name: string;
}

interface CreditCard {
  id: number;
  card_name: string;
  friend_name: string;
}

export function AddMobileBookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { creditCardId } = route.params || {};

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<number | null>(null);
  const [selectedCreditCardId, setSelectedCreditCardId] = useState<number | null>(creditCardId || null);
  const [phoneName, setPhoneName] = useState('');
  const [variant, setVariant] = useState('');
  const [color, setColor] = useState('');
  const [netAmount, setNetAmount] = useState('');
  const [supercoinAmount, setSupercoinAmount] = useState('0');
  const [giftCardAmount, setGiftCardAmount] = useState('0');
  const [cashbackPercentage, setCashbackPercentage] = useState('');
  const [emiCancellationCharge, setEmiCancellationCharge] = useState('0');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [platformsRes, cardsRes] = await Promise.all([
        api.get('/api/platforms'),
        api.get('/api/credit-cards'),
      ]);

      setPlatforms(platformsRes.data.platforms || []);
      setCreditCards(cardsRes.data.creditCards || []);

      if (creditCardId && !selectedCreditCardId) {
        setSelectedCreditCardId(creditCardId);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load data',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const [newPlatformName, setNewPlatformName] = useState('');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [addingPlatform, setAddingPlatform] = useState(false);

  const handleAddPlatform = async () => {
    if (!newPlatformName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Platform name is required',
      });
      return;
    }

    setAddingPlatform(true);

    try {
      const response = await api.post('/api/platforms', {
        name: newPlatformName.trim(),
      });

      setPlatforms([...platforms, response.data.platform]);
      setSelectedPlatformId(response.data.platform.id);
      setNewPlatformName('');
      setShowAddPlatform(false);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Platform added successfully',
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add platform';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
      });
    } finally {
      setAddingPlatform(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlatformId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a platform',
      });
      return;
    }

    if (!selectedCreditCardId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a credit card',
      });
      return;
    }

    if (!phoneName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Phone name is required',
      });
      return;
    }

    if (!netAmount || parseFloat(netAmount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Net amount must be greater than 0',
      });
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/mobile-bookings', {
        platform_id: selectedPlatformId,
        credit_card_id: selectedCreditCardId,
        phone_name: phoneName.trim(),
        variant: variant.trim() || null,
        color: color.trim() || null,
        net_amount: parseFloat(netAmount),
        supercoin_amount: parseFloat(supercoinAmount || 0),
        gift_card_amount: parseFloat(giftCardAmount || 0),
        cashback_percentage: cashbackPercentage ? parseFloat(cashbackPercentage) : null,
        emi_cancellation_charge: parseFloat(emiCancellationCharge || 0),
        booking_date: bookingDate,
        notes: notes.trim() || null,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Mobile booking added successfully',
      });

      navigation.goBack();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add mobile booking';
      Toast.show({
        type: 'error',
        text1: 'Error',
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
          <Text style={styles.title}>Add Mobile Booking</Text>
          <Text style={styles.subtitle}>Record a new mobile phone booking  ttm</Text>
        </View>

        <Card style={styles.card}>
          {!loadingData && (
            <>
              {/* Booking Information Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Booking Information</Text>
                  <View style={styles.sectionDivider} />
                </View>
                
                <View style={styles.fourColumnRow}>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <CustomDropdown
                      label="Platform *"
                      options={platforms.map((platform) => ({
                        label: platform.name,
                        value: platform.id,
                      }))}
                      value={selectedPlatformId}
                      onSelect={(option) => setSelectedPlatformId(option.value as number)}
                      placeholder="Select platform"
                      required
                    />
                    {!showAddPlatform ? (
                      <Button
                        title="+ Add Platform"
                        onPress={() => setShowAddPlatform(true)}
                        variant="outline"
                        style={styles.addPlatformButton}
                      />
                    ) : (
                      <View style={styles.addPlatformContainer}>
                        <Input
                          label="New Platform Name"
                          value={newPlatformName}
                          onChangeText={setNewPlatformName}
                          placeholder="e.g., Flipkart"
                          editable={!addingPlatform}
                          style={styles.addPlatformInput}
                        />
                        <View style={styles.addPlatformActions}>
                          <Button
                            title="Cancel"
                            onPress={() => {
                              setShowAddPlatform(false);
                              setNewPlatformName('');
                            }}
                            variant="outline"
                            style={styles.addPlatformButton}
                          />
                          <Button
                            title="Add"
                            onPress={handleAddPlatform}
                            loading={addingPlatform}
                            disabled={addingPlatform || !newPlatformName.trim()}
                            style={styles.addPlatformButton}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <CustomDropdown
                      label="Credit Card *"
                      options={creditCards.map((card) => ({
                        label: `${card.card_name} (${card.friend_name})`,
                        value: card.id,
                      }))}
                      value={selectedCreditCardId}
                      onSelect={(option) => setSelectedCreditCardId(option.value as number)}
                      placeholder="Select credit card"
                      required
                    />
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <Input
                      label="Phone Name *"
                      value={phoneName}
                      onChangeText={setPhoneName}
                      placeholder="e.g., iPhone 15 Pro"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]}>
                    <Input
                      label="Variant"
                      value={variant}
                      onChangeText={setVariant}
                      placeholder="e.g., 6/128, 12/256"
                      editable={!loading}
                    />
                  </View>
                </View>
              </View>

              {/* Phone Details Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Phone Details</Text>
                  <View style={styles.sectionDivider} />
                </View>

                <View style={styles.fourColumnRow}>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <Input
                      label="Color"
                      value={color}
                      onChangeText={setColor}
                      placeholder="e.g., Blue, Black"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <Input
                      label="Net Amount (Paid by CC) *"
                      value={netAmount}
                      onChangeText={(text) => setNetAmount(text.replace(/[^0-9.]/g, ''))}
                      placeholder="e.g., 50000"
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <Input
                      label="Supercoin Amount"
                      value={supercoinAmount}
                      onChangeText={(text) => setSupercoinAmount(text.replace(/[^0-9.]/g, ''))}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]}>
                    <Input
                      label="Gift Card Amount"
                      value={giftCardAmount}
                      onChangeText={(text) => setGiftCardAmount(text.replace(/[^0-9.]/g, ''))}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                  </View>
                </View>
              </View>

              {/* Financial Details Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Financial Details</Text>
                  <View style={styles.sectionDivider} />
                </View>

                <View style={styles.fourColumnRow}>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <Input
                      label="Cashback %"
                      value={cashbackPercentage}
                      onChangeText={(text) => setCashbackPercentage(text.replace(/[^0-9.]/g, ''))}
                      placeholder="e.g., 5"
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <Input
                      label="EMI Cancellation"
                      value={emiCancellationCharge}
                      onChangeText={(text) => setEmiCancellationCharge(text.replace(/[^0-9.]/g, ''))}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
                    <Input
                      label="Booking Date *"
                      value={bookingDate}
                      onChangeText={setBookingDate}
                      placeholder="YYYY-MM-DD"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]}>
                    {/* Empty space for alignment */}
                  </View>
                </View>
              </View>

              {/* Additional Information Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                  <View style={styles.sectionDivider} />
                </View>

                <View style={styles.fieldSpacing}>
                  <Input
                    label="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Any additional notes"
                    multiline
                    numberOfLines={3}
                    editable={!loading}
                  />
                </View>
              </View>

              <Button
                title="Add Booking"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !selectedPlatformId || !selectedCreditCardId || !phoneName.trim() || !netAmount}
                fullWidth
                style={styles.submitButton}
              />
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  card: {
    maxWidth: Platform.OS === 'web' ? 1400 : 600,
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.2,
    borderRadius: 1,
    marginTop: 4,
  },
  platformSection: {
    marginBottom: 0,
  },
  fieldSpacing: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  fourColumnRow: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: Platform.OS === 'web' ? 'nowrap' : 'wrap',
    width: '100%',
    ...(Platform.OS === 'web' ? {
      justifyContent: 'flex-start',
    } : {
      gap: 12,
    }),
  },
  quarterWidth: {
    ...(Platform.OS === 'web' ? {
      width: '24%',
      flexShrink: 0,
      flexGrow: 0,
    } : {
      flex: 1,
      minWidth: '48%',
      maxWidth: '48%',
    }),
  },
  quarterWidthWeb: {
    ...(Platform.OS === 'web' && {
      marginRight: 12,
    }),
  },
  quarterWidthWebLast: {
    ...(Platform.OS === 'web' && {
      marginRight: 0,
    }),
  },
  addPlatformButton: {
    marginTop: 12,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 16,
  },
  addPlatformContainer: {
    width: '100%',
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  addPlatformInput: {
    marginBottom: 12,
  },
  addPlatformActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

