import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/common/Card';
import { MainLayout } from '../../../components/layout/MainLayout';
import { colors } from '../../../styles/colors';
import { sellerPaymentService, SellerPayment } from '../../../services/sellerPaymentService';
import Toast from 'react-native-toast-message';

export function SellerPaymentsListScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<SellerPayment[]>([]);
  const [filters, setFilters] = useState({
    seller_name: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await sellerPaymentService.getAll(filters);
      setPayments(response.payments || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load seller payments',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this payment?');
      if (!confirmed) return;
    }

    try {
      await sellerPaymentService.delete(id);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Payment deleted successfully',
      });
      loadPayments();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete payment',
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Seller Payments</Text>
          <Text style={styles.subtitle}>Payments received from sellers</Text>
        </View>

        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddSellerPayment')}
          >
            <Text style={styles.addButtonText}>+ Add Payment</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPayments} />}
        >
          {payments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No seller payments found</Text>
              <Text style={styles.emptySubtext}>Add a payment to get started</Text>
            </Card>
          ) : (
            <View style={styles.paymentsContainer}>
              {payments.map((payment) => (
                <Card key={payment.id} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentHeaderLeft}>
                      <Text style={styles.sellerName}>{payment.seller_name}</Text>
                      <Text style={styles.paymentAmount}>{formatCurrency(payment.payment_amount || 0)}</Text>
                    </View>
                    <View style={styles.paymentHeaderRight}>
                      <Text style={styles.paymentDate}>{formatDate(payment.payment_date)}</Text>
                    </View>
                  </View>

                  <View style={styles.paymentDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Order:</Text>
                      <Text style={styles.detailValue}>
                        {payment.phone_name}
                        {payment.variant && ` (${payment.variant})`}
                        {payment.color && ` - ${payment.color}`}
                      </Text>
                    </View>

                    {payment.booking_date && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Booking Date:</Text>
                        <Text style={styles.detailValue}>{formatDate(payment.booking_date)}</Text>
                      </View>
                    )}

                    {payment.card_name && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Card:</Text>
                        <Text style={styles.detailValue}>
                          {payment.card_name}
                          {payment.friend_name && ` (${payment.friend_name})`}
                        </Text>
                      </View>
                    )}

                    {payment.received_by_account_name && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Received By:</Text>
                        <Text style={styles.detailValue}>{payment.received_by_account_name}</Text>
                      </View>
                    )}

                    {payment.notes && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Notes:</Text>
                        <Text style={styles.detailValue}>{payment.notes}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.paymentActions}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => payment.id && handleDelete(payment.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  actionsBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 0,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentsContainer: {
    gap: 16,
  },
  paymentCard: {
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  paymentHeaderLeft: {
    flex: 1,
  },
  paymentHeaderRight: {
    alignItems: 'flex-end',
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paymentDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: Platform.OS === 'web' ? 120 : '35%',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.error,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
