import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../styles/colors';
import { cardService } from '../../../services/cardService';
import { getCardTypeDisplayName } from '../../../utils/cardUtils';
import Toast from 'react-native-toast-message';

interface CardDetailsModalProps {
  visible: boolean;
  cardId: number | null;
  onClose: () => void;
}

export function CardDetailsModal({ visible, cardId, onClose }: CardDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [showFullCardNumber, setShowFullCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  useEffect(() => {
    if (visible && cardId) {
      loadCardDetails();
    }
  }, [visible, cardId]);

  const loadCardDetails = async () => {
    if (!cardId) return;
    setLoading(true);
    try {
      const response = await cardService.getById(cardId);
      setCard(response.card);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load card details',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\D/g, '');
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return cleaned;
    const last4 = cleaned.substring(cleaned.length - 4);
    return `**** **** **** ${last4}`;
  };

  if (!card) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Card Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Credit Card Visual */}
            <View style={styles.cardVisual}>
              <View style={styles.cardVisualHeader}>
                <View>
                  <Text style={styles.cardVisualLabel}>Card Name</Text>
                  <Text style={styles.cardVisualName}>{card.card_name}</Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  {card.card_type && card.card_type !== 'unknown' && (
                    <View style={styles.cardTypeBadge}>
                      <Text style={styles.cardTypeBadgeText}>{getCardTypeDisplayName(card.card_type)}</Text>
                    </View>
                  )}
                  {card.bank_name && (
                    <View style={styles.bankBadge}>
                      <Text style={styles.bankBadgeText}>{card.bank_name}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumberLabel}>Card Number</Text>
                <View style={styles.cardNumberRow}>
                  <Text style={styles.cardNumberText}>
                    {showFullCardNumber && card.card_number
                      ? formatCardNumber(card.card_number)
                      : maskCardNumber(card.card_number || card.card_number_last4 || '')}
                  </Text>
                  {card.card_number && (
                    <TouchableOpacity
                      onPress={() => setShowFullCardNumber(!showFullCardNumber)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showFullCardNumber ? 'eye-off' : 'eye'}
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.cardBottomRow}>
                <View style={styles.cardInfoItem}>
                  <Text style={styles.cardInfoLabel}>Expiry</Text>
                  <Text style={styles.cardInfoValue}>
                    {card.expiry_mm && card.expiry_yy
                      ? `${card.expiry_mm}/${card.expiry_yy}`
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.cardInfoItem}>
                  <Text style={styles.cardInfoLabel}>CVV</Text>
                  <View style={styles.cvvRow}>
                    <Text style={styles.cardInfoValue}>
                      {showCVV && card.cvv ? card.cvv : '***'}
                    </Text>
                    {card.cvv && (
                      <TouchableOpacity
                        onPress={() => setShowCVV(!showCVV)}
                        style={styles.eyeButton}
                      >
                        <Ionicons
                          name={showCVV ? 'eye-off' : 'eye'}
                          size={18}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.cardHolderRow}>
                <Text style={styles.cardHolderLabel}>Card Holder</Text>
                <Text style={styles.cardHolderName}>{card.friend_name}</Text>
              </View>
            </View>

            {/* Card Information Section */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Card Information</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Friend Name</Text>
                <Text style={styles.detailValue}>{card.friend_name}</Text>
              </View>

              {card.partner_name && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Partner</Text>
                  <Text style={styles.detailValue}>{card.partner_name}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card Name</Text>
                <Text style={styles.detailValue}>{card.card_name}</Text>
              </View>

              {card.bank_name && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank</Text>
                  <Text style={styles.detailValue}>{card.bank_name}</Text>
                </View>
              )}

              {card.card_type && card.card_type !== 'unknown' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Card Type</Text>
                  <View style={styles.cardTypeRow}>
                    <Text style={styles.detailValue}>{getCardTypeDisplayName(card.card_type)}</Text>
                    <View style={styles.cardTypeIndicator}>
                      <Text style={styles.cardTypeIndicatorText}>
                        {card.card_type === 'visa' ? '💳' : card.card_type === 'mastercard' ? '💳' : '💳'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card Number</Text>
                <View style={styles.detailValueRow}>
                  <Text style={styles.detailValue}>
                    {showFullCardNumber && card.card_number
                      ? formatCardNumber(card.card_number)
                      : maskCardNumber(card.card_number || card.card_number_last4 || '')}
                  </Text>
                  {card.card_number && (
                    <TouchableOpacity
                      onPress={() => setShowFullCardNumber(!showFullCardNumber)}
                      style={styles.smallEyeButton}
                    >
                      <Ionicons
                        name={showFullCardNumber ? 'eye-off' : 'eye'}
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiry Date</Text>
                <Text style={styles.detailValue}>
                  {card.expiry_mm && card.expiry_yy
                    ? `${card.expiry_mm}/${card.expiry_yy}`
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CVV</Text>
                <View style={styles.detailValueRow}>
                  <Text style={styles.detailValue}>
                    {showCVV && card.cvv ? card.cvv : '***'}
                  </Text>
                  {card.cvv && (
                    <TouchableOpacity
                      onPress={() => setShowCVV(!showCVV)}
                      style={styles.smallEyeButton}
                    >
                      <Ionicons
                        name={showCVV ? 'eye-off' : 'eye'}
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Limit Information */}
            {card.limit_type !== 'none' && (
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Limit Information</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Limit Type</Text>
                  <Text style={styles.detailValue}>
                    {card.limit_type.charAt(0).toUpperCase() + card.limit_type.slice(1)}
                  </Text>
                </View>

                {card.limit_amount > 0 && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Limit</Text>
                      <Text style={styles.detailValue}>
                        ₹{parseFloat(card.limit_amount).toLocaleString()}
                      </Text>
                    </View>

                    {card.limit_remaining !== undefined && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Remaining</Text>
                        <Text
                          style={[
                            styles.detailValue,
                            {
                              color:
                                card.limit_remaining < card.limit_amount * 0.2
                                  ? colors.error
                                  : card.limit_remaining < card.limit_amount * 0.5
                                  ? '#ff9800'
                                  : colors.success,
                            },
                          ]}
                        >
                          ₹{parseFloat(card.limit_remaining).toLocaleString()}
                        </Text>
                      </View>
                    )}

                    {card.limit_used !== undefined && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Used</Text>
                        <Text style={styles.detailValue}>
                          ₹{parseFloat(card.limit_used).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </>
                )}

                {card.current_period_start && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Period Start</Text>
                    <Text style={styles.detailValue}>{card.current_period_start}</Text>
                  </View>
                )}

                {card.current_period_end && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Period End</Text>
                    <Text style={styles.detailValue}>{card.current_period_end}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Usage Statistics */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Usage Statistics</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Used</Text>
                <Text style={styles.detailValue}>
                  ₹{parseFloat(card.total_used || 0).toLocaleString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cashback Earned</Text>
                <Text style={[styles.detailValue, { color: colors.success }]}>
                  ₹{parseFloat(card.total_cashback || 0).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Additional Notes */}
            {card.notes && (
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{card.notes}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  cardVisual: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    minHeight: 220,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardVisualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  cardVisualLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardVisualName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  cardTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardTypeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bankBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bankBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardNumberContainer: {
    marginBottom: 24,
  },
  cardNumberLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    letterSpacing: 1,
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNumberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardInfoItem: {
    flex: 1,
  },
  cardInfoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cvvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHolderRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  cardHolderLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardHolderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flex: 1,
  },
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flex: 1,
  },
  cardTypeIndicator: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardTypeIndicatorText: {
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  smallEyeButton: {
    padding: 2,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
