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

interface Friend {
  id: number;
  name: string;
}

export function AddCreditCardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { friendId } = route.params || {};

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(friendId || null);
  const [cardName, setCardName] = useState('');
  const [cardNumberLast4, setCardNumberLast4] = useState('');
  const [bankName, setBankName] = useState('');
  const [limitType, setLimitType] = useState<'monthly' | 'quarterly' | 'yearly' | 'none'>('none');
  const [limitAmount, setLimitAmount] = useState('');
  const [limitPeriodStart, setLimitPeriodStart] = useState('');
  const [currentPeriodStart, setCurrentPeriodStart] = useState('');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await api.get('/api/friends');
      setFriends(response.data.friends || []);
      if (friendId && !selectedFriendId) {
        setSelectedFriendId(friendId);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load friends',
      });
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFriendId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a friend',
      });
      return;
    }

    if (!cardName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Card name is required',
      });
      return;
    }

    if (limitType !== 'none' && !limitAmount) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Limit amount is required when limit type is set',
      });
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/credit-cards', {
        friend_id: selectedFriendId,
        card_name: cardName.trim(),
        card_number_last4: cardNumberLast4.trim() || null,
        bank_name: bankName.trim() || null,
        limit_type: limitType,
        limit_amount: limitAmount ? parseFloat(limitAmount) : null,
        limit_period_start: limitPeriodStart || null,
        current_period_start: currentPeriodStart || null,
        current_period_end: currentPeriodEnd || null,
        notes: notes.trim() || null,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Credit card added successfully',
      });

      navigation.goBack();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add credit card';
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
          <Text style={styles.title}>Add Credit Card</Text>
          <Text style={styles.subtitle}>Add a credit card for a friend</Text>
        </View>

        <Card style={styles.card}>
          {!loadingFriends && (
            <CustomDropdown
              label="Friend"
              options={friends.map((friend) => ({
                label: friend.name,
                value: friend.id,
              }))}
              value={selectedFriendId}
              onSelect={(option) => setSelectedFriendId(option.value as number)}
              placeholder="Select a friend"
              required
            />
          )}

          <Input
            label="Card Name *"
            value={cardName}
            onChangeText={setCardName}
            placeholder="e.g., Flipkart Axis Card"
            editable={!loading}
          />

          <Input
            label="Last 4 Digits (Optional)"
            value={cardNumberLast4}
            onChangeText={(text) => setCardNumberLast4(text.replace(/\D/g, '').substring(0, 4))}
            placeholder="1234"
            keyboardType="number-pad"
            maxLength={4}
            editable={!loading}
          />

          <Input
            label="Bank Name (Optional)"
            value={bankName}
            onChangeText={setBankName}
            placeholder="e.g., Axis Bank"
            editable={!loading}
          />

          <CustomDropdown
            label="Limit Type"
            options={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Quarterly', value: 'quarterly' },
              { label: 'Yearly', value: 'yearly' },
              { label: 'None', value: 'none' },
            ]}
            value={limitType}
            onSelect={(option) => setLimitType(option.value as 'monthly' | 'quarterly' | 'yearly' | 'none')}
            placeholder="Select limit type"
            required
          />

          {limitType !== 'none' && (
            <>
              <Input
                label="Limit Amount *"
                value={limitAmount}
                onChangeText={(text) => setLimitAmount(text.replace(/[^0-9.]/g, ''))}
                placeholder="e.g., 4000"
                keyboardType="decimal-pad"
                editable={!loading}
              />

              <Input
                label="Limit Period Start (Optional)"
                value={limitPeriodStart}
                onChangeText={setLimitPeriodStart}
                placeholder="YYYY-MM-DD"
                editable={!loading}
              />

              <Input
                label="Current Period Start (Optional)"
                value={currentPeriodStart}
                onChangeText={setCurrentPeriodStart}
                placeholder="YYYY-MM-DD"
                editable={!loading}
              />

              <Input
                label="Current Period End (Optional)"
                value={currentPeriodEnd}
                onChangeText={setCurrentPeriodEnd}
                placeholder="YYYY-MM-DD"
                editable={!loading}
              />
            </>
          )}

          <Input
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes"
            multiline
            numberOfLines={3}
            editable={!loading}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 This card will be visible to all partners. All partners can see and use this card for bookings.
            </Text>
          </View>

          <Button
            title="Add Credit Card"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !selectedFriendId || !cardName.trim()}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
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
    color: colors.textSecondary,
  },
});

