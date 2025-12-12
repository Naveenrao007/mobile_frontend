import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/common/Button';
import { FloatingInput } from '../../../components/common/FloatingInput';
import { CustomDropdown } from '../../../components/common/CustomDropdown';
import { Card } from '../../../components/common/Card';
import { MainLayout } from '../../../components/layout/MainLayout';
import { colors } from '../../../styles/colors';
import { bookingService, MobileBooking } from '../../../services/bookingService';
import { platformService } from '../../../services/platformService';
import { cardService } from '../../../services/cardService';
import Toast from 'react-native-toast-message';

export function AddBookingScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState<Array<{ id: number; name: string }>>([]);
  const [cards, setCards] = useState<Array<{ id: number; card_name: string; friend_name: string }>>([]);
  const [quantity, setQuantity] = useState('1');
  const [cardHolderName, setCardHolderName] = useState('');
  const [formData, setFormData] = useState<MobileBooking>({
    platform_id: 0,
    credit_card_id: 0,
    phone_name: '',
    variant: '',
    color: '',
    net_amount: 0,
    supercoin_amount: 0,
    gift_card_amount: 0,
    cashback_amount: 0,
    cashback_percentage: 0,
    is_emi: false,
    emi_cancellation_charge: 0,
    booking_date: new Date().toISOString().split('T')[0],
    notes: '',
    selling_date: '',
    buyer_name: '',
    selling_price: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [platformsRes, cardsRes] = await Promise.all([
        platformService.getAll(),
        cardService.getAll(),
      ]);
      setPlatforms(platformsRes.platforms || []);
      setCards(cardsRes.cards || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Update card holder name when credit card changes
  useEffect(() => {
    if (formData.credit_card_id) {
      const selectedCard = cards.find(c => c.id === formData.credit_card_id);
      if (selectedCard) {
        setCardHolderName(selectedCard.friend_name);
      }
    }
  }, [formData.credit_card_id, cards]);

  const handleSubmit = async () => {
    if (!formData.platform_id || !formData.credit_card_id || !formData.phone_name || !formData.net_amount) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Platform, credit card, phone name, and net amount are required',
      });
      return;
    }

    setLoading(true);
    try {
      await bookingService.add(formData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Mobile booking added successfully',
      });

      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to add booking',
      });
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <MainLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Mobile Booking</Text>
            <Text style={styles.subtitle}>Record a new mobile phone booking ttt</Text>
          </View>

        <Card style={styles.card}>
          {/* Row 1: Product Name, Variant, Quantity, Price */}
          <View style={styles.fourColumnRow}>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Product Name *"
                value={formData.phone_name}
                onChangeText={(text) => setFormData({ ...formData, phone_name: text })}
                placeholder="e.g., iPhone 15 Pro"
                disabled={loading}
                required
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Variant"
                value={formData.variant ?? ''}
                onChangeText={(text) => setFormData({ ...formData, variant: text })}
                placeholder="e.g., 6/128, 12/256"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Quantity"
                value={quantity}
                onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
                placeholder="1"
                keyboardType="numeric"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]}>
              <FloatingInput
                label="Price *"
                value={formData.net_amount?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, net_amount: parseFloat(text) || 0 })}
                placeholder="Enter amount"
                keyboardType="numeric"
                disabled={loading}
                required
                marginBottom={0}
              />
            </View>
          </View>

          {/* Row 2: Supercoin/Gift Card, Date of Purchase, Card Holder Name, Platform */}
          <View style={styles.fourColumnRow}>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Supercoin/Gift Card"
                value={((formData.supercoin_amount || 0) + (formData.gift_card_amount || 0)).toString()}
                onChangeText={(text) => {
                  const value = parseFloat(text) || 0;
                  setFormData({ 
                    ...formData, 
                    supercoin_amount: value,
                    gift_card_amount: 0
                  });
                }}
                placeholder="Enter amount"
                keyboardType="numeric"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Date of Purchase *"
                value={formData.booking_date ?? ''}
                onChangeText={(text) => setFormData({ ...formData, booking_date: text })}
                placeholder="YYYY-MM-DD"
                disabled={loading}
                required
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Card Holder Name"
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder="Card holder name"
                disabled={true}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]}>
              <CustomDropdown
                label="Platform"
                options={platforms.map(p => ({ label: p.name, value: p.id }))}
                value={formData.platform_id}
                onSelect={(option) => setFormData({ ...formData, platform_id: typeof option.value === 'number' ? option.value : parseInt(String(option.value), 10) })}
                placeholder="Select platform"
                required
              />
            </View>
          </View>

          {/* Row 3: Selling Date, Sell to Whom, Selling Price, Credit Card */}
          <View style={styles.fourColumnRow}>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Selling Date"
                value={formData.selling_date ?? ''}
                onChangeText={(text) => setFormData({ ...formData, selling_date: text })}
                placeholder="YYYY-MM-DD"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Sell to Whom"
                value={formData.buyer_name ?? ''}
                onChangeText={(text) => setFormData({ ...formData, buyer_name: text })}
                placeholder="Buyer name"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Selling Price"
                value={formData.selling_price?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, selling_price: parseFloat(text) || 0 })}
                placeholder="Enter selling price"
                keyboardType="numeric"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]}>
              <CustomDropdown
                label="Credit Card *"
                options={cards.map(c => ({ label: `${c.card_name} (${c.friend_name})`, value: c.id }))}
                value={formData.credit_card_id}
                onSelect={(option) => setFormData({ ...formData, credit_card_id: typeof option.value === 'number' ? option.value : parseInt(String(option.value), 10) })}
                placeholder="Select credit card"
                required
              />
            </View>
          </View>

          {/* Additional Fields Row */}
          <View style={styles.fourColumnRow}>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Color"
                value={formData.color ?? ''}
                onChangeText={(text) => setFormData({ ...formData, color: text })}
                placeholder="e.g., Blue, Black"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Cashback Amount"
                value={formData.cashback_amount?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, cashback_amount: parseFloat(text) || 0 })}
                placeholder="Enter cashback amount"
                keyboardType="numeric"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]}>
              <FloatingInput
                label="Cashback Percentage"
                value={formData.cashback_percentage?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, cashback_percentage: parseFloat(text) || 0 })}
                placeholder="Enter percentage"
                keyboardType="numeric"
                disabled={loading}
                marginBottom={0}
              />
            </View>
            <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>EMI Cancelled?</Text>
                <Switch
                  value={formData.is_emi || false}
                  onValueChange={(value) => setFormData({ ...formData, is_emi: value })}
                />
              </View>
            </View>
          </View>

          {/* EMI Cancellation Charge (conditional) */}
          {formData.is_emi && (
            <View style={styles.fourColumnRow}>
              <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]}>
                <FloatingInput
                  label="EMI Cancellation Charge"
                  value={formData.emi_cancellation_charge?.toString() || ''}
                  onChangeText={(text) => setFormData({ ...formData, emi_cancellation_charge: parseFloat(text) || 0 })}
                  placeholder="Enter charge amount"
                  keyboardType="numeric"
                  disabled={loading}
                  marginBottom={0}
                />
              </View>
              <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]} />
              <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWeb]} />
              <View style={[styles.quarterWidth, Platform.OS === 'web' && styles.quarterWidthWebLast]} />
            </View>
          )}

          {/* Notes - Full Width */}
          <View style={styles.fieldSpacing}>
            <FloatingInput
              label="Notes"
              value={formData.notes ?? ''}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Additional notes"
              disabled={loading}
            />
          </View>

          <Button
            title="Add Booking"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.submitButton}
          />
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
  section: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  selectButton: {
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Platform.OS === 'web' ? 0 : 16,
    paddingTop: Platform.OS === 'web' ? 8 : 0,
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
  submitButton: {
    marginTop: 10,
  },
});

