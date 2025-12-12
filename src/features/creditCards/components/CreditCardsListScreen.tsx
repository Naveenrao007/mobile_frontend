import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { colors } from '../../../styles/colors';
import api from '../../../services/api';
import Toast from 'react-native-toast-message';

interface CreditCard {
  id: number;
  friend_id: number;
  friend_name: string;
  partner_name: string;
  card_name: string;
  card_number_last4: string;
  bank_name: string;
  limit_type: string;
  limit_amount: number;
  total_used: number;
  total_cashback: number;
}

export function CreditCardsListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { friendId } = route.params || {};

  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCreditCards();
  }, [friendId]);

  const loadCreditCards = async () => {
    try {
      const params = friendId ? { friend_id: friendId } : {};
      const response = await api.get('/api/credit-cards', { params });
      setCreditCards(response.data.creditCards || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load credit cards';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCreditCards();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Credit Cards</Text>
        <Button
          title="+ Add Card"
          onPress={() => navigation.navigate('AddCreditCard', { friendId })}
          variant="primary"
          style={styles.addButton}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : creditCards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No credit cards added yet</Text>
            <Button
              title="Add Your First Card"
              onPress={() => navigation.navigate('AddCreditCard', { friendId })}
              variant="primary"
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          creditCards.map((card) => (
            <Card key={card.id} style={styles.cardCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{card.card_name}</Text>
                {card.partner_name && (
                  <View style={styles.partnerBadge}>
                    <Text style={styles.partnerText}>{card.partner_name}</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Friend:</Text>
                <Text style={styles.value}>{card.friend_name}</Text>
              </View>

              {card.card_number_last4 && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Card Number:</Text>
                  <Text style={styles.value}>****{card.card_number_last4}</Text>
                </View>
              )}

              {card.bank_name && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Bank:</Text>
                  <Text style={styles.value}>{card.bank_name}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.label}>Limit Type:</Text>
                <Text style={styles.value}>{card.limit_type}</Text>
              </View>

              {card.limit_amount && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Limit Amount:</Text>
                  <Text style={styles.value}>₹{card.limit_amount.toLocaleString()}</Text>
                </View>
              )}

              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Total Used</Text>
                  <Text style={styles.statValue}>₹{parseFloat(card.total_used.toString()).toLocaleString()}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Cashback</Text>
                  <Text style={[styles.statValue, styles.cashbackValue]}>
                    ₹{parseFloat(card.total_cashback.toString()).toLocaleString()}
                  </Text>
                </View>
              </View>

              <Button
                title="Use for Booking"
                onPress={() => navigation.navigate('AddMobileBooking', { creditCardId: card.id })}
                variant="primary"
                style={styles.useButton}
              />
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 40,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
  cardCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  partnerBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  partnerText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 12,
    gap: 16,
  },
  stat: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  cashbackValue: {
    color: colors.success,
  },
  useButton: {
    marginTop: 8,
  },
});

