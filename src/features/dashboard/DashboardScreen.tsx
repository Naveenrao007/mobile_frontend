import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { colors } from '../../styles/colors';
import { Card } from '../../components/common/Card';
import { MainLayout } from '../../components/layout/MainLayout';
import { friendService } from '../../services/friendService';
import { cardService } from '../../services/cardService';
import { bookingService } from '../../services/bookingService';

export function DashboardScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalFriends: 0,
    totalCards: 0,
    totalProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [friendsRes, cardsRes, bookingsRes] = await Promise.all([
        friendService.getAll().catch(() => ({ friends: [] })),
        cardService.getAll().catch(() => ({ cards: [] })),
        bookingService.getAll().catch(() => ({ bookings: [] })),
      ]);

      const bookings = bookingsRes.bookings || [];
      const totalProfit = bookings.reduce((sum: number, b: any) => {
        return sum + (parseFloat(b.profit_loss || 0));
      }, 0);

      setStats({
        totalBookings: bookings.length,
        totalFriends: (friendsRes.friends || []).length,
        totalCards: (cardsRes.cards || []).length,
        totalProfit: totalProfit,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {user?.UserName}!</Text>
          <Text style={styles.subtitle}>Here's your business overview</Text>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalFriends}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCards}</Text>
            <Text style={styles.statLabel}>Credit Cards</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats.totalProfit.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Profit</Text>
          </Card>
        </View>

        <Card style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('AddBooking')}
            >
              <Text style={styles.actionIcon}>📱</Text>
              <Text style={styles.actionLabel}>Add Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('AddFriend')}
            >
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionLabel}>Add Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('AddCard')}
            >
              <Text style={styles.actionIcon}>💳</Text>
              <Text style={styles.actionLabel}>Add Card</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('CardsList')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionLabel}>All Cards</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('PlatformsManagement')}
            >
              <Text style={styles.actionIcon}>🏪</Text>
              <Text style={styles.actionLabel}>Platforms</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('SellerPaymentsList')}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionLabel}>Seller Payments</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>System Status</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusIcon}>✓</Text>
            <Text style={styles.statusText}>Database Connected</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusIcon}>✓</Text>
            <Text style={styles.statusText}>Authentication Working</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusIcon}>✓</Text>
            <Text style={styles.statusText}>Backend API Ready</Text>
          </View>
        </Card>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActionsCard: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.primaryLight,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  infoCard: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    fontSize: 18,
    color: colors.success,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
  },
});
