import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '../../../components/common/Button';
import { FloatingInput } from '../../../components/common/FloatingInput';
import { AutocompleteInput } from '../../../components/common/AutocompleteInput';
import { CustomDropdown } from '../../../components/common/CustomDropdown';
import { Card } from '../../../components/common/Card';
import { PageHeader } from '../../../components/common/PageHeader';
import { MainLayout } from '../../../components/layout/MainLayout';
import { colors } from '../../../styles/colors';
import { cardService, CreditCard } from '../../../services/cardService';
import { friendService } from '../../../services/friendService';
import { partnerService } from '../../../services/partnerService';
import { detectCardType, getCardTypeDisplayName, validateCardLength } from '../../../utils/cardUtils';
import { getAllCardNames, addPersistentCardName, syncApiCardNames } from '../../../services/cardNamesService';
import Toast from 'react-native-toast-message';

export function AddCardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const friendId = route.params?.friendId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [friends, setFriends] = useState<Array<{ id: number; name: string; partner_id?: number }>>([]);
  const [partners, setPartners] = useState<Array<{ id: number; name: string }>>([]);
  const [existingCardNames, setExistingCardNames] = useState<string[]>([]);
  const [detectedCardType, setDetectedCardType] = useState<'visa' | 'mastercard' | 'rupay' | 'unknown'>('unknown');
  const [cardCategory, setCardCategory] = useState<'credit' | 'debit'>('credit');
  const [selectedHolderType, setSelectedHolderType] = useState<'friend' | 'partner' | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreditCard>({
    friend_id: friendId || 0,
    card_name: '',
    card_number: '',
    expiry_mm: '',
    expiry_yy: '',
    cvv: '',
    bank_name: '',
    limit_type: 'none',
    limit_amount: 0,
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([loadFriends(), loadPartners(), loadExistingCardNames()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadFriends = async () => {
    try {
      const response = await friendService.getAll();
      setFriends(response.friends || []);
      if (friendId && response.friends) {
        const friend = response.friends.find((f: any) => f.id === friendId);
        if (friend) {
          setFormData({ ...formData, friend_id: friendId });
          setSelectedHolderType('friend');
        }
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadPartners = async () => {
    try {
      const response = await partnerService.getAll();
      setPartners(response.partners || []);
    } catch (error) {
      console.error('Error loading partners:', error);
    }
  };

  const loadExistingCardNames = async () => {
    try {
      // Try to load from API
      let apiCardNames: string[] = [];
      try {
        const response = await cardService.getAll();
        const cards = response.cards || [];
        apiCardNames = cards.map((card: any) => card.card_name).filter(Boolean);
        // Sync API card names to persistent storage
        await syncApiCardNames(apiCardNames);
      } catch (error) {
        console.log('API not available, using offline card names');
      }
      
      // Get all card names (JSON + AsyncStorage/localStorage + API) - works offline
      const allCardNames = await getAllCardNames(apiCardNames);
      setExistingCardNames(allCardNames);
    } catch (error) {
      console.error('Error loading card names:', error);
      // Fallback to default card names from JSON (sync version)
      const defaultNames = getAllCardNamesSync([]);
      setExistingCardNames(defaultNames);
    }
  };

  const handleReset = () => {
    setFormData({
      friend_id: friendId || 0,
      card_name: '',
      card_number: '',
      expiry_mm: '',
      expiry_yy: '',
      cvv: '',
      bank_name: '',
      limit_type: 'none',
      limit_amount: 0,
      notes: '',
    });
    setDetectedCardType('unknown');
    setCardCategory('credit');
    setSelectedHolderType(null);
    setSelectedPartnerId(null);
    Toast.show({
      type: 'info',
      text1: 'Form Reset',
      text2: 'All fields have been cleared',
    });
  };

  const handleSubmit = async () => {
    if (!selectedHolderType) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select card holder type (Friend or Partner)',
      });
      return;
    }

    if (selectedHolderType === 'friend' && !formData.friend_id) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a friend',
      });
      return;
    }

    if (selectedHolderType === 'partner' && !selectedPartnerId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a partner',
      });
      return;
    }

    if (!formData.card_name || !formData.card_number || 
        !formData.expiry_mm || !formData.expiry_yy || !formData.cvv) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Card name, card number, expiry, and CVV are required',
      });
      return;
    }

    // Validate limit_type is set (required for both credit and debit cards)
    if (!formData.limit_type) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Cashback limit type is required',
      });
      return;
    }

    // Validate card number based on detected card type
    const cardNumberDigits = formData.card_number.replace(/\D/g, '');
    const cardType = detectCardType(formData.card_number);
    
    if (!validateCardLength(formData.card_number, cardType)) {
      let errorMessage = 'Invalid card number length';
      if (cardType === 'visa') {
        errorMessage = 'Visa card number must be 13-19 digits';
      } else if (cardType === 'mastercard') {
        errorMessage = 'Mastercard number must be 16 digits';
      } else if (cardType === 'rupay') {
        errorMessage = 'RuPay card number must be 16 digits';
      } else {
        errorMessage = 'Card number must be 16 digits';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: errorMessage,
      });
      return;
    }

    // Validate expiry month (01-12)
    const month = parseInt(formData.expiry_mm);
    if (isNaN(month) || month < 1 || month > 12) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Expiry month must be between 01 and 12',
      });
      return;
    }

    // Validate expiry year (2 digits, should be current year or future)
    const year = parseInt(formData.expiry_yy);
    const currentYear = new Date().getFullYear() % 100;
    if (isNaN(year) || year < currentYear) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Expiry year must be current year or future',
      });
      return;
    }

    // Validate CVV (3 or 4 digits)
    if (!/^\d{3,4}$/.test(formData.cvv)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'CVV must be 3 or 4 digits',
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare card data - if partner selected, include partner_id
      const cardData: any = {
        ...formData,
        card_category: cardCategory,
      };

      // If partner is selected, include partner_id for backend to handle
      // Always remove friend_id when partner_id is present - backend will find/create correct friend entry
      if (selectedHolderType === 'partner' && selectedPartnerId) {
        cardData.partner_id = selectedPartnerId;
        // Always delete friend_id when partner is selected - backend will handle friend creation
        delete cardData.friend_id;
      }

      await cardService.add(cardData);

      // Save card name to persistent storage (works offline, shared across partners)
      if (formData.card_name.trim()) {
        await addPersistentCardName(formData.card_name);
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `${cardCategory === 'credit' ? 'Credit' : 'Debit'} card added successfully`,
      });

      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add credit card';
      
      // Check if it's a duplicate error from backend
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        Toast.show({
          type: 'error',
          text1: 'Duplicate Card',
          text2: errorMessage,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
        });
      }
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            title="Add Card"
            resetButton={{
              label: 'Reset',
              onPress: handleReset,
              visible: true,
            }}
            style={styles.pageHeader}
          />

        <Card style={styles.card}>
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Card Information</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <CustomDropdown
                  label="Card Type *"
                  options={[
                    { label: '💳 Credit Card', value: 'credit' },
                    { label: '💳 Debit Card', value: 'debit' },
                  ]}
                  value={cardCategory}
                  onSelect={(option) => setCardCategory(option.value as 'credit' | 'debit')}
                  placeholder="Select card type"
                  required
                  disabled={loading || loadingData}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <CustomDropdown
                  label="Card Holder Type *"
                  options={[
                    { label: '👤 Friend', value: 'friend' },
                    { label: '🤝 Partner', value: 'partner' },
                  ]}
                  value={selectedHolderType}
                  onSelect={(option) => {
                    setSelectedHolderType(option.value as 'friend' | 'partner');
                    setFormData({ ...formData, friend_id: 0 });
                    setSelectedPartnerId(null);
                  }}
                  placeholder="Select holder type"
                  required
                  disabled={loading || loadingData}
                />
              </View>
            </View>

            {selectedHolderType === 'friend' && (
              <View style={styles.inputGroup}>
                <CustomDropdown
                  label="Select Friend *"
                  options={friends.map(f => ({ 
                    label: f.name, 
                    value: f.id
                  }))}
                  value={formData.friend_id}
                  onSelect={(option) => {
                    setFormData({ ...formData, friend_id: option.value as number });
                  }}
                  placeholder="Select friend"
                  required
                  disabled={loading || loadingData}
                />
              </View>
            )}

            {selectedHolderType === 'partner' && (
              <View style={styles.inputGroup}>
                <CustomDropdown
                  label="Select Partner *"
                  options={partners.map(p => ({ 
                    label: p.name, 
                    value: p.id
                  }))}
                  value={selectedPartnerId}
                  onSelect={(option) => {
                    setSelectedPartnerId(option.value as number);
                    // Always let backend handle friend creation for partners
                    // Set friend_id to 0 so backend knows to create/find the correct friend entry
                    setFormData({ ...formData, friend_id: 0 });
                  }}
                  placeholder="Select partner"
                  required
                  disabled={loading || loadingData}
                />
                <Text style={styles.hintText}>
                  💡 Partner's card will be linked automatically
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <AutocompleteInput
                label="Card Name *"
                value={formData.card_name}
                onChangeText={(text) => setFormData({ ...formData, card_name: text })}
                suggestions={existingCardNames}
                placeholder={cardCategory === 'credit' ? "e.g., Flipkart Axis Card" : "e.g., HDFC Debit Card"}
                disabled={loading || loadingData}
                required
              />
              {existingCardNames.length > 0 && (
                <Text style={styles.hintText}>
                  💡 Select from existing cards or type a new card name
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <FloatingInput
                label="Card Number"
                value={formData.card_number}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '');
                  // Allow up to 19 digits for Visa, 16 for others
                  const maxLength = cleaned.startsWith('4') ? 19 : 16;
                  const limited = cleaned.substring(0, maxLength);
                  const formatted = limited.replace(/(.{4})/g, '$1 ').trim();
                  
                  // Detect card type
                  const cardType = detectCardType(limited);
                  setDetectedCardType(cardType);
                  
                  setFormData({ 
                    ...formData, 
                    card_number: formatted,
                    card_number_last4: limited.length >= 4 ? limited.substring(limited.length - 4) : ''
                  });
                }}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={23} // 19 digits + 4 spaces for Visa
                disabled={loading || loadingData}
                required
              />
              {detectedCardType !== 'unknown' && formData.card_number.replace(/\D/g, '').length >= 4 && (
                <View style={styles.cardTypeBadge}>
                  <Text style={styles.cardTypeText}>
                    {getCardTypeDisplayName(detectedCardType)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <FloatingInput
                  label="Expiry MM"
                  value={formData.expiry_mm}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').substring(0, 2);
                    setFormData({ ...formData, expiry_mm: cleaned });
                  }}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                  disabled={loading || loadingData}
                  required
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <FloatingInput
                  label="Expiry YY"
                  value={formData.expiry_yy}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').substring(0, 2);
                    setFormData({ ...formData, expiry_yy: cleaned });
                  }}
                  placeholder="YY"
                  keyboardType="numeric"
                  maxLength={2}
                  disabled={loading || loadingData}
                  required
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <FloatingInput
                label="CVV"
                value={formData.cvv}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '').substring(0, 4);
                  setFormData({ ...formData, cvv: cleaned });
                }}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                disabled={loading || loadingData}
                required
              />
            </View>

            <View style={styles.inputGroup}>
              <FloatingInput
                label="Bank Name"
                value={formData.bank_name}
                onChangeText={(text) => setFormData({ ...formData, bank_name: text })}
                placeholder="e.g., Axis Bank"
                disabled={loading || loadingData}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Cashback Settings</Text>
            <Text style={styles.hintText}>
              💡 {cardCategory === 'credit' 
                ? 'Credit cards typically offer cashback rewards' 
                : 'Some debit cards also offer cashback rewards'}
            </Text>
            
            <View style={styles.inputGroup}>
              <CustomDropdown
                label="Cashback Limit Type *"
                options={['none', 'monthly', 'quarterly', 'yearly'].map(type => ({
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  value: type,
                }))}
                value={formData.limit_type}
                onSelect={(option) => setFormData({ ...formData, limit_type: option.value as any })}
                placeholder="Select limit type"
                required
                disabled={loading || loadingData}
              />
            </View>

            {formData.limit_type !== 'none' && (
              <>
                <View style={styles.inputGroup}>
                  <FloatingInput
                    label="Limit Amount"
                    value={formData.limit_amount?.toString() || ''}
                    onChangeText={(text) => setFormData({ ...formData, limit_amount: parseFloat(text) || 0 })}
                    placeholder="Enter limit amount"
                    keyboardType="numeric"
                    disabled={loading || loadingData}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <FloatingInput
                    label="Period Start Date"
                    value={formData.current_period_start}
                    onChangeText={(text) => setFormData({ ...formData, current_period_start: text })}
                    placeholder="YYYY-MM-DD"
                    disabled={loading || loadingData}
                  />
                </View>
              </>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Additional Information</Text>
            
            <View style={styles.inputGroup}>
              <FloatingInput
                label="Notes"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Additional notes (optional)"
                disabled={loading || loadingData}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={cardCategory === 'credit' ? 'Add Credit Card' : 'Add Debit Card'}
              onPress={handleSubmit}
              loading={loading || loadingData}
              disabled={loading || loadingData}
              fullWidth
              style={styles.submitButton}
            />
          </View>
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
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 24,
  },
  card: {
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderLight,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  cardTypeBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cardTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  submitButton: {
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

