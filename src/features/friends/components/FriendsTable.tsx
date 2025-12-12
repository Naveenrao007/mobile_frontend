import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Table, TableColumn, TableAction } from '../../../components/common/Table';
import { friendService, Friend } from '../../../services/friendService';
import { colors } from '../../../styles/colors';
import Toast from 'react-native-toast-message';
import { Card } from '../../../components/common/Card';

interface FriendsTableProps {
  partnerId?: number | null;
  onRefresh?: () => void;
  refreshKey?: number;
}

export function FriendsTable({ partnerId, onRefresh, refreshKey }: FriendsTableProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [partnerId, refreshKey]);

  const loadFriends = async () => {
    if (!partnerId) {
      setFriends([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Pass partner_id to backend for filtering
      const response = await friendService.getAll(partnerId);
      const allFriends = response.friends || [];
      
      setFriends(allFriends);
    } catch (error: any) {
      console.error('Error loading friends:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load friends',
      });
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (friend: Friend) => {
    if (!friend.id) return;
    
    try {
      await friendService.delete(friend.id);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Friend deleted successfully',
      });
      loadFriends();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete friend',
      });
    }
  };

  const handleEdit = (friend: Friend) => {
    // TODO: Open edit modal/form
    Toast.show({
      type: 'info',
      text1: 'Edit Friend',
      text2: 'Edit functionality coming soon',
    });
  };

  const columns: TableColumn<Friend>[] = [
    {
      key: 'id',
      label: 'S.No',
      width: 80,
      render: (value, row) => {
        const index = friends.findIndex(f => f.id === row.id);
        return <Text style={styles.cellText}>{index + 1}</Text>;
      },
    },
    {
      key: 'name',
      label: 'Name',
      width: 200,
    },
    {
      key: 'email',
      label: 'Email',
      width: 200,
      render: (value) => (
        <Text style={styles.cellText}>{value || '-'}</Text>
      ),
    },
    {
      key: 'mobile',
      label: 'Mobile',
      width: 150,
      render: (value) => (
        <Text style={styles.cellText}>{value || '-'}</Text>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      width: 250,
      render: (value) => (
        <Text style={styles.cellText} numberOfLines={2}>
          {value || '-'}
        </Text>
      ),
    },
  ];

  const actions: TableAction<Friend>[] = [
    {
      label: 'Edit',
      icon: '✏️',
      onPress: handleEdit,
      variant: 'primary',
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onPress: handleDelete,
      variant: 'danger',
    },
  ];


  return (
    <Card style={styles.tableCard}>
      <View style={styles.tableHeader}>
        <View style={styles.tableTitleContainer}>
          <Text style={styles.tableTitle}>
            Friends {partnerId ? `(${friends.length})` : `(${friends.length})`}
          </Text>
          {partnerId && (
            <Text style={styles.tableSubtitle}>
              Showing friends for selected partner
            </Text>
          )}
        </View>
        <TouchableOpacity 
          onPress={loadFriends} 
          style={styles.refreshButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading friends...</Text>
        </View>
      ) : (
        <Table
          data={friends}
          columns={columns}
          actions={actions}
          emptyMessage={`No friends found${partnerId ? ' for selected partner' : ''}`}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  tableCard: {
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderLight,
  },
  tableTitleContainer: {
    flex: 1,
  },
  tableTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  tableSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  refreshButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
});

