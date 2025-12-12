import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/common/Button';
import { FloatingInput } from '../../../components/common/FloatingInput';
import { CustomDropdown } from '../../../components/common/CustomDropdown';
import { Card } from '../../../components/common/Card';
import { MainLayout } from '../../../components/layout/MainLayout';
import { colors } from '../../../styles/colors';
import { sellerPaymentService, SellerPayment } from '../../../services/sellerPaymentService';
import api from '../../../services/api';
import Toast from 'react-native-toast-message';

interface MobileBooking {
  id: number;
  phone_name: string;
  variant?: string;
  color?: string;
  booking_date: string;
  net_amount: number;
  card_name?: string;
  friend_name?: string;
  platform_name?: string;
}

interface CreditCard {
  id: number;
  card_name: string;
  friend_name: string;
}

interface Friend {
  id: number;
  name: string;
}

export function AddSellerPaymentScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [bookings, setBookings] = useState<MobileBooking[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [formData, setFormData] = useState<SellerPayment>({
    mobile_booking_id: 0,
    seller_name: '',
    payment_amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    received_by_account_type: undefined,
    received_by_credit_card_id: undefined,
    received_by_friend_id: undefined,
    received_by_account_name: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, cardsRes, friendsRes] = await Promise.all([
        api.get('/api/mobile-bookings'),
        api.get('/api/credit-cards'),
        api.get('/api/friends'),
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setCreditCards(cardsRes.data.cards || []);
      setFriends(friendsRes.data.friends || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load data',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleAccountTypeChange = (accountType: 'credit_card' | 'friend' | 'bank_account') => {
    setFormData({
      ...formData,
      received_by_account_type: accountType,
      received_by_credit_card_id: undefined,
      received_by_friend_id: undefined,
      received_by_account_name: '',
    });
  };

  const handleCreditCardChange = (cardId: number) => {
    const selectedCard = creditCards.find(c => c.id === cardId);
    setFormData({
      ...formData,
      received_by_credit_card_id: cardId,
      received_by_account_name: selectedCard ? `${selectedCard.card_name} (${selectedCard.friend_name})` : '',
    });
  };

  const handleFriendChange = (friendId: number) => {
    const selectedFriend = friends.find(f => f.id === friendId);
    setFormData({
      ...formData,
      received_by_friend_id: friendId,
      received_by_account_name: selectedFriend ? selectedFriend.name : '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.mobile_booking_id || !formData.seller_name || !formData.payment_amount) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Booking, seller name, and payment amount are required',
      });
      return;
    }

    if (formData.payment_amount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Payment amount must be greater than 0',
      });
      return;
    }

    setLoading(true);
    try {
      await sellerPaymentService.add(formData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Seller payment added successfully',
      });

      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to add seller payment',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedBooking = bookings.find(b => b.id === formData.mobile_booking_id);

  return (
    <MainLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Seller Payment</Text>
            <Text style={styles.subtitle}>Record payment received from seller</Text>
          </View>

          <Card style={styles.card}>
            {!loadingData && (
              <>
                {/* Order Selection */}
                <View style={styles.fieldSpacing}>
                  <CustomDropdown
                    label="Select Order *"
                    options={bookings.map(b => ({
                      label: `${b.phone_name}${b.variant ? ` (${b.variant})` : ''}${b.color ? ` - ${b.color}` : ''} - ₹${b.net_amount}${b.card_name ? ` [${b.card_name}]` : ''}`,
                      value: b.id,
                    }))}
                    value={formData.mobile_booking_id}
                    onSelect={(option) => setFormData({ ...formData, mobile_booking_id: option.value as number })}
                    placeholder="Select order/booking"
                    required
                  />
                </View>

                {selectedBooking && (
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingInfoTitle}>Order Details:</Text>
                    <Text style={styles.bookingInfoText}>Phone: {selectedBooking.phone_name}</Text>
                    {selectedBooking.variant && (
                      <Text style={styles.bookingInfoText}>Variant: {selectedBooking.variant}</Text>
                    )}
                    {selectedBooking.color && (
                      <Text style={styles.bookingInfoText}>Color: {selectedBooking.color}</Text>
                    )}
                    <Text style={styles.bookingInfoText}>Amount: ₹{selectedBooking.net_amount}</Text>
                    {selectedBooking.card_name && (
                      <Text style={styles.bookingInfoText}>Card: {selectedBooking.card_name} ({selectedBooking.friend_name})</Text>
                    )}
                  </View>
                )}

                {/* Seller Information */}
                <View style={styles.fourColumnRow}>
                  <View style={[styles.halfWidth, Platform.OS === 'web' && styles.halfWidthWeb]}>
                    <FloatingInput
                      label="Seller Name *"
                      value={formData.seller_name}
                      onChangeText={(text) => setFormData({ ...formData, seller_name: text })}
                      placeholder="e.g., Sam"
                      disabled={loading}
                      required
                    />
                  </View>
                  <View style={[styles.halfWidth, Platform.OS === 'web' && styles.halfWidthWebLast]}>
                    <FloatingInput
                      label="Payment Amount *"
                      value={formData.payment_amount?.toString() || ''}
                      onChangeText={(text) => setFormData({ ...formData, payment_amount: parseFloat(text) || 0 })}
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      disabled={loading}
                      required
                    />
                  </View>
                </View>

                <View style={styles.fourColumnRow}>
                  <View style={[styles.halfWidth, Platform.OS === 'web' && styles.halfWidthWeb]}>
                    <FloatingInput
                      label="Payment Date *"
                      value={formData.payment_date || ''}
                      onChangeText={(text) => setFormData({ ...formData, payment_date: text })}
                      placeholder="YYYY-MM-DD"
                      disabled={loading}
                      required
                    />
                  </View>
                  <View style={[styles.halfWidth, Platform.OS === 'web' && styles.halfWidthWebLast]} />
                </View>

                {/* Account Selection */}
                <View style={styles.fieldSpacing}>
                  <CustomDropdown
                    label="Received By Account Type"
                    options={[
                      { label: 'Credit Card', value: 'credit_card' },
                      { label: 'Friend', value: 'friend' },
                      { label: 'Bank Account', value: 'bank_account' },
                    ]}
                    value={formData.received_by_account_type}
                    onSelect={(option) => handleAccountTypeChange(option.value as 'credit_card' | 'friend' | 'bank_account')}
                    placeholder="Select account type"
                  />
                </View>

                {formData.received_by_account_type === 'credit_card' && (
                  <View style={styles.fieldSpacing}>
                    <CustomDropdown
                      label="Credit Card"
                      options={creditCards.map(c => ({
                        label: `${c.card_name} (${c.friend_name})`,
                        value: c.id,
                      }))}
                      value={formData.received_by_credit_card_id}
                      onSelect={(option) => handleCreditCardChange(option.value as number)}
                      placeholder="Select credit card"
                    />
                  </View>
                )}

                {formData.received_by_account_type === 'friend' && (
                  <View style={styles.fieldSpacing}>
                    <CustomDropdown
                      label="Friend"
                      options={friends.map(f => ({
                        label: f.name,
                        value: f.id,
                      }))}
                      value={formData.received_by_friend_id}
                      onSelect={(option) => handleFriendChange(option.value as number)}
                      placeholder="Select friend"
                    />
                  </View>
                )}

                {formData.received_by_account_type === 'bank_account' && (
                  <View style={styles.fieldSpacing}>
                    <FloatingInput
                      label="Bank Account Name"
                      value={formData.received_by_account_name || ''}
                      onChangeText={(text) => setFormData({ ...formData, received_by_account_name: text })}
                      placeholder="e.g., HDFC Savings Account"
                      disabled={loading}
                    />
                  </View>
                )}

                {/* Notes */}
                <View style={styles.fieldSpacing}>
                  <FloatingInput
                    label="Notes"
                    value={formData.notes || ''}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    placeholder="Additional notes"
                    disabled={loading}
                  />
                </View>

                <Button
                  title="Add Payment"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  style={styles.submitButton}
                />
              </>
            )}
          </Card>
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  card: {
    maxWidth: Platform.OS === 'web' ? 1400 : 600,
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  fieldSpacing: {
    marginBottom: 16,
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
  halfWidth: {
    ...(Platform.OS === 'web' ? {
      width: '48%',
      flexShrink: 0,
      flexGrow: 0,
    } : {
      flex: 1,
      minWidth: '48%',
      maxWidth: '48%',
    }),
  },
  halfWidthWeb: {
    ...(Platform.OS === 'web' && {
      marginRight: 12,
    }),
  },
  halfWidthWebLast: {
    ...(Platform.OS === 'web' && {
      marginRight: 0,
    }),
  },
  submitButton: {
    marginTop: 10,
  },
  bookingInfo: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bookingInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  bookingInfoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
});
