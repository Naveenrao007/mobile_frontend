import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { colors } from '../../../styles/colors';
import api from '../../../services/api';
import Toast from 'react-native-toast-message';

interface Friend {
  id: number;
  name: string;
  email: string;
  mobile: string;
  notes: string;
  partner_name: string;
  card_count: number;
}

export function FriendsListScreen() {
  const navigation = useNavigation<any>();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await api.get('/api/friends');
      setFriends(response.data.friends || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load friends';
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
    loadFriends();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Button
          title="+ Add Friend"
          onPress={() => navigation.navigate('AddFriend')}
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
        ) : friends.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No friends added yet</Text>
            <Button
              title="Add Your First Friend"
              onPress={() => navigation.navigate('AddFriend')}
              variant="primary"
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          friends.map((friend) => (
            <Card key={friend.id} style={styles.friendCard}>
              <View style={styles.friendHeader}>
                <Text style={styles.friendName}>{friend.name}</Text>
                {friend.partner_name && (
                  <View style={styles.partnerBadge}>
                    <Text style={styles.partnerText}>{friend.partner_name}</Text>
                  </View>
                )}
              </View>

              {friend.email && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{friend.email}</Text>
                </View>
              )}

              {friend.mobile && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Mobile:</Text>
                  <Text style={styles.value}>{friend.mobile}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.label}>Credit Cards:</Text>
                <Text style={styles.value}>{friend.card_count || 0}</Text>
              </View>

              {friend.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{friend.notes}</Text>
                </View>
              )}

              <View style={styles.actions}>
                <Button
                  title="Add Card"
                  onPress={() => navigation.navigate('AddCreditCard', { friendId: friend.id })}
                  variant="outline"
                  style={styles.actionButton}
                />
                <Button
                  title="View Cards"
                  onPress={() => navigation.navigate('CreditCardsList', { friendId: friend.id })}
                  variant="primary"
                  style={styles.actionButton}
                />
              </View>
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
  friendCard: {
    marginBottom: 16,
  },
  friendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendName: {
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
    width: 100,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  notesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  notesText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

