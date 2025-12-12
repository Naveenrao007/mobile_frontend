import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/common/Card';
import { MainLayout } from '../../../components/layout/MainLayout';
import { colors } from '../../../styles/colors';
import { cardService } from '../../../services/cardService';
import { CardDetailsModal } from './CardDetailsModal';
import { getCardTypeDisplayName } from '../../../utils/cardUtils';
import { getCardTheme, getCardBadgeColors } from '../../../utils/cardThemes';
import { FloatingInput } from '../../../components/common/FloatingInput';
import { CustomDropdown } from '../../../components/common/CustomDropdown';
import Toast from 'react-native-toast-message';

type SortOption = 'name' | 'bank' | 'created' | 'limit' | 'used';
type SortOrder = 'asc' | 'desc';

export function CardsListScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [visibleCardDetails, setVisibleCardDetails] = useState<{ [key: number]: boolean }>({});
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedCardType, setSelectedCardType] = useState<string | null>(null);
  const [selectedCardCategory, setSelectedCardCategory] = useState<string | null>(null);
  const [selectedCardHolder, setSelectedCardHolder] = useState<string | null>(null);
  const [selectedLimitType, setSelectedLimitType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const response = await cardService.getAll();
      setCards(response.cards || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load cards',
      });
    } finally {
      setLoading(false);
    }
  };

  const [cardFullDetails, setCardFullDetails] = useState<{ [key: number]: any }>({});

  // Extract unique values for filters dynamically
  const uniqueBanks = useMemo(() => {
    const banks = new Set<string>();
    cards.forEach(card => {
      if (card.bank_name) {
        banks.add(card.bank_name);
      }
    });
    return Array.from(banks).sort();
  }, [cards]);

  const uniqueCardTypes = useMemo(() => {
    const types = new Set<string>();
    cards.forEach(card => {
      if (card.card_type && card.card_type !== 'unknown') {
        types.add(card.card_type);
      }
    });
    return Array.from(types).sort();
  }, [cards]);

  const uniqueCardHolders = useMemo(() => {
    const holders = new Set<string>();
    cards.forEach(card => {
      if (card.friend_name) {
        holders.add(card.friend_name);
      }
    });
    return Array.from(holders).sort();
  }, [cards]);

  const uniqueLimitTypes = useMemo(() => {
    const types = new Set<string>();
    cards.forEach(card => {
      if (card.limit_type) {
        types.add(card.limit_type);
      }
    });
    return Array.from(types).sort();
  }, [cards]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBank) count++;
    if (selectedCardType) count++;
    if (selectedCardCategory) count++;
    if (selectedCardHolder) count++;
    if (selectedLimitType) count++;
    return count;
  }, [selectedBank, selectedCardType, selectedCardCategory, selectedCardHolder, selectedLimitType]);

  // Enhanced search function with fuzzy matching
  const matchesSearch = useCallback((card: any, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const searchTerms = searchLower.split(/\s+/); // Split by spaces for multi-word search
    
    // Fields to search in
    const searchableFields = [
      card.card_name?.toLowerCase() || '',
      card.bank_name?.toLowerCase() || '',
      card.friend_name?.toLowerCase() || '',
      card.partner_name?.toLowerCase() || '',
      card.card_number_last4 || '',
      card.card_number_masked?.toLowerCase() || '',
      card.notes?.toLowerCase() || '',
    ].filter(field => field.length > 0);
    
    // Check if all search terms match any field
    return searchTerms.every(term => 
      searchableFields.some(field => field.includes(term))
    );
  }, []);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = cards.filter(card => {
      // Enhanced search filter
      if (!matchesSearch(card, debouncedSearchText)) {
        return false;
      }

      // Bank filter
      if (selectedBank && card.bank_name !== selectedBank) {
        return false;
      }

      // Card type filter (Visa/Mastercard/RuPay)
      if (selectedCardType && card.card_type !== selectedCardType) {
        return false;
      }

      // Card category filter (Credit/Debit)
      if (selectedCardCategory) {
        const cardCategory = card.card_category || 'credit';
        if (cardCategory !== selectedCardCategory) {
          return false;
        }
      }

      // Card holder filter
      if (selectedCardHolder && card.friend_name !== selectedCardHolder) {
        return false;
      }

      // Limit type filter
      if (selectedLimitType && card.limit_type !== selectedLimitType) {
        return false;
      }

      return true;
    });

    // Sort cards
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.card_name?.toLowerCase() || '';
          bValue = b.card_name?.toLowerCase() || '';
          break;
        case 'bank':
          aValue = a.bank_name?.toLowerCase() || '';
          bValue = b.bank_name?.toLowerCase() || '';
          break;
        case 'created':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'limit':
          aValue = parseFloat(a.limit_amount || 0);
          bValue = parseFloat(b.limit_amount || 0);
          break;
        case 'used':
          aValue = parseFloat(a.total_used || 0);
          bValue = parseFloat(b.total_used || 0);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [cards, debouncedSearchText, selectedBank, selectedCardType, selectedCardCategory, selectedCardHolder, selectedLimitType, sortBy, sortOrder, matchesSearch]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchText('');
    setSelectedBank(null);
    setSelectedCardType(null);
    setSelectedCardCategory(null);
    setSelectedCardHolder(null);
    setSelectedLimitType(null);
    setSortBy('created');
    setSortOrder('desc');
  }, []);

  const getLimitStatusColor = (remaining: number, total: number) => {
    if (total === 0) return colors.textSecondary;
    const percentage = (remaining / total) * 100;
    if (percentage < 20) return colors.error;
    if (percentage < 50) return '#ff9800';
    return colors.success;
  };

  const toggleCardDetails = async (cardId: number) => {
    if (visibleCardDetails[cardId]) {
      // Hide details
      setVisibleCardDetails({ ...visibleCardDetails, [cardId]: false });
    } else {
      // Show details - fetch full card info
      if (!cardFullDetails[cardId]) {
        try {
          const response = await cardService.getById(cardId);
          setCardFullDetails({ ...cardFullDetails, [cardId]: response.card });
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load card details',
          });
          return;
        }
      }
      setVisibleCardDetails({ ...visibleCardDetails, [cardId]: true });
    }
  };

  const formatCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\D/g, '');
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleDeleteCard = async (cardId: number, cardName: string) => {
    // Show confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${cardName}"?`);
      if (!confirmed) return;
    }

    try {
      await cardService.delete(cardId);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Card deleted successfully',
      });
      // Reload cards
      loadCards();
      // Clear any cached details
      setCardFullDetails((prev) => {
        const updated = { ...prev };
        delete updated[cardId];
        return updated;
      });
      setVisibleCardDetails((prev) => {
        const updated = { ...prev };
        delete updated[cardId];
        return updated;
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete card',
      });
    }
  };

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Credit Cards</Text>
          <Text style={styles.subtitle}>All cards visible to partners</Text>
        </View>

        {/* Search and Filter Section */}
        <View style={styles.searchFilterContainer}>
          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <FloatingInput
                label="Search Cards"
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by name, bank, card holder, partner, or card number..."
                style={styles.searchInput}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchText('')}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              <Ionicons 
                name="search" 
                size={20} 
                color={colors.textSecondary} 
                style={styles.searchIcon}
              />
            </View>
          </View>

          {/* Quick Filters Row */}
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <CustomDropdown
                label="Bank"
                options={[
                  { label: 'All Banks', value: '' },
                  ...uniqueBanks.map(bank => ({ label: bank, value: bank }))
                ]}
                value={selectedBank || ''}
                onSelect={(option) => setSelectedBank(option.value === '' ? null : option.value)}
                placeholder="Select Bank"
                width="100%"
              />
            </View>

            <View style={styles.filterItem}>
              <CustomDropdown
                label="Card Type"
                options={[
                  { label: 'All Types', value: '' },
                  ...uniqueCardTypes.map(type => ({ 
                    label: getCardTypeDisplayName(type), 
                    value: type 
                  }))
                ]}
                value={selectedCardType || ''}
                onSelect={(option) => setSelectedCardType(option.value === '' ? null : option.value)}
                placeholder="Select Card Type"
                width="100%"
              />
            </View>

            <View style={styles.filterItem}>
              <CustomDropdown
                label="Category"
                options={[
                  { label: 'All Categories', value: '' },
                  { label: 'Credit Card', value: 'credit' },
                  { label: 'Debit Card', value: 'debit' }
                ]}
                value={selectedCardCategory || ''}
                onSelect={(option) => setSelectedCardCategory(option.value === '' ? null : option.value)}
                placeholder="Select Category"
                width="100%"
              />
            </View>

            <View style={styles.filterItem}>
              <CustomDropdown
                label="Sort By"
                options={[
                  { label: 'Date Created', value: 'created' },
                  { label: 'Card Name', value: 'name' },
                  { label: 'Bank Name', value: 'bank' },
                  { label: 'Limit Amount', value: 'limit' },
                  { label: 'Total Used', value: 'used' }
                ]}
                value={sortBy}
                onSelect={(option) => setSortBy(option.value as SortOption)}
                placeholder="Sort By"
                width="100%"
              />
            </View>

            <View style={styles.sortOrderButton}>
              <TouchableOpacity
                style={styles.sortOrderButtonInner}
                onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <Ionicons 
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                  size={18} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Advanced Filters Toggle */}
          <TouchableOpacity
            style={styles.advancedFiltersToggle}
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Ionicons 
              name={showAdvancedFilters ? 'chevron-up' : 'chevron-down'} 
              size={18} 
              color={colors.primary} 
            />
            <Text style={styles.advancedFiltersToggleText}>
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              {activeFiltersCount > 0 && ` (${activeFiltersCount} active)`}
            </Text>
          </TouchableOpacity>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <View style={styles.advancedFiltersRow}>
              <View style={styles.filterItem}>
                <CustomDropdown
                  label="Card Holder"
                  options={[
                    { label: 'All Holders', value: '' },
                    ...uniqueCardHolders.map(holder => ({ label: holder, value: holder }))
                  ]}
                  value={selectedCardHolder || ''}
                  onSelect={(option) => setSelectedCardHolder(option.value === '' ? null : option.value)}
                  placeholder="Select Card Holder"
                  width="100%"
                />
              </View>

              <View style={styles.filterItem}>
                <CustomDropdown
                  label="Limit Type"
                  options={[
                    { label: 'All Limit Types', value: '' },
                    ...uniqueLimitTypes.map(type => ({ 
                      label: type.charAt(0).toUpperCase() + type.slice(1), 
                      value: type 
                    }))
                  ]}
                  value={selectedLimitType || ''}
                  onSelect={(option) => setSelectedLimitType(option.value === '' ? null : option.value)}
                  placeholder="Select Limit Type"
                  width="100%"
                />
              </View>
            </View>
          )}

          {/* Active Filter Chips */}
          {(selectedBank || selectedCardType || selectedCardCategory || selectedCardHolder || selectedLimitType || searchText) && (
            <View style={styles.filterChipsContainer}>
              <Text style={styles.filterChipsLabel}>Active Filters:</Text>
              <View style={styles.filterChips}>
                {searchText && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>Search: "{searchText}"</Text>
                    <TouchableOpacity onPress={() => setSearchText('')}>
                      <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedBank && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>Bank: {selectedBank}</Text>
                    <TouchableOpacity onPress={() => setSelectedBank(null)}>
                      <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedCardType && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>Type: {getCardTypeDisplayName(selectedCardType)}</Text>
                    <TouchableOpacity onPress={() => setSelectedCardType(null)}>
                      <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedCardCategory && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>Category: {selectedCardCategory === 'credit' ? 'Credit' : 'Debit'}</Text>
                    <TouchableOpacity onPress={() => setSelectedCardCategory(null)}>
                      <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedCardHolder && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>Holder: {selectedCardHolder}</Text>
                    <TouchableOpacity onPress={() => setSelectedCardHolder(null)}>
                      <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedLimitType && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>Limit: {selectedLimitType.charAt(0).toUpperCase() + selectedLimitType.slice(1)}</Text>
                    <TouchableOpacity onPress={() => setSelectedLimitType(null)}>
                      <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity style={styles.clearAllChip} onPress={clearAllFilters}>
                  <Text style={styles.clearAllChipText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Results count and stats */}
          <View style={styles.resultsStats}>
            <Text style={styles.resultsCountText}>
              {filteredCards.length === cards.length ? (
                `Showing all ${cards.length} cards`
              ) : (
                `Showing ${filteredCards.length} of ${cards.length} cards`
              )}
            </Text>
            {filteredCards.length > 0 && (
              <Text style={styles.sortInfoText}>
                Sorted by {sortBy === 'created' ? 'Date Created' : sortBy === 'name' ? 'Card Name' : sortBy === 'bank' ? 'Bank Name' : sortBy === 'limit' ? 'Limit Amount' : 'Total Used'} ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
              </Text>
            )}
          </View>
        </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCards} />}
      >
        {cards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No credit cards found</Text>
            <Text style={styles.emptySubtext}>Add a credit card to get started</Text>
          </Card>
        ) : filteredCards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No cards match your filters</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filter criteria</Text>
          </Card>
        ) : (
          <View style={styles.cardsContainer}>
          {filteredCards.map((card) => {
            const cardTheme = getCardTheme(card.card_name);
            const badgeColors = getCardBadgeColors(card.card_name);
            
            return (
            <View key={card.id} style={styles.cardWrapper}>
              {/* Bank Card Visual Design */}
              <View style={[styles.bankCard, { backgroundColor: cardTheme.backgroundColor }]}>
                {/* Decorative Circles Background */}
                {Platform.OS === 'web' && (
                  <View style={[styles.decorativeCircle1, { backgroundColor: cardTheme.gradientColors?.[0] || 'rgba(255, 255, 255, 0.1)' }]} />
                )}
                {Platform.OS === 'web' && (
                  <View style={[styles.decorativeCircle2, { backgroundColor: cardTheme.gradientColors?.[1] || 'rgba(255, 255, 255, 0.08)' }]} />
                )}

                {/* First Row: Card Name and Bank Name */}
                <View style={styles.firstRow}>
                  <View style={styles.cardNameContainer}>
                    <Text 
                      style={[styles.cardNameTextFirstRow, { color: cardTheme.textColor }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {card.card_name}
                    </Text>
                  </View>
                  {card.bank_name && (
                    <View style={styles.bankNameContainerFirstRow}>
                      <Text style={[styles.bankNameTextFirstRow, { color: badgeColors.bankLogo }]}>
                        {card.bank_name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Card Top Section - Standard Layout */}
                <View style={styles.cardTopSection}>
                  {/* Left: Chip - Removed for testing */}
                  {/* <View style={styles.chipContainer}>
                    <View style={[styles.chip, { backgroundColor: cardTheme.chipColor || '#d4af37' }]}>
                      <View style={styles.chipLines} />
                    </View>
                  </View> */}
                  
                  {/* Right: Card Network Logo (Visa/Mastercard) */}
                  <View style={styles.cardTopRight}>
                    {card.card_type && card.card_type !== 'unknown' && (
                      <View style={styles.cardNetworkLogo}>
                        <Text style={[styles.cardNetworkText, { color: cardTheme.textColor }]}>
                          {getCardTypeDisplayName(card.card_type)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Card Number Section with Eye Icon */}
                <View style={styles.cardNumberSection}>
                  <View style={styles.cardNumberContainer}>
                    <Text 
                      style={[styles.cardNumberText, { color: cardTheme.textColor }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {visibleCardDetails[card.id] && cardFullDetails[card.id]?.card_number
                        ? formatCardNumber(cardFullDetails[card.id].card_number)
                        : card.card_number_masked || (card.card_number_last4 ? `**** **** **** ${card.card_number_last4}` : '**** **** **** ****')}
                    </Text>
                  </View>
                  {/* Eye Button to Show/Hide Details */}
                  <TouchableOpacity
                    style={styles.eyeButtonInline}
                    onPress={() => toggleCardDetails(card.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={visibleCardDetails[card.id] ? 'eye-off' : 'eye'}
                      size={22}
                      color={cardTheme.textColor}
                    />
                  </TouchableOpacity>
                </View>

                {/* Card Bottom Section - Standard Layout */}
                <View style={styles.cardBottomSection}>
                  <View style={styles.cardBottomLeft}>
                    <Text style={[styles.cardLabel, { color: `rgba(${cardTheme.textColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0'}, 0.8)` }]}>CARD HOLDER</Text>
                    <Text style={[styles.cardHolderName, { color: cardTheme.textColor }]}>{card.friend_name.toUpperCase()}</Text>
                  </View>
                  <View style={styles.cardBottomRight}>
                    <Text style={[styles.cardLabel, { color: `rgba(${cardTheme.textColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0'}, 0.8)` }]}>EXPIRES</Text>
                    <Text style={[styles.cardExpiry, { color: cardTheme.textColor }]}>
                      {visibleCardDetails[card.id] && cardFullDetails[card.id]?.expiry_mm && cardFullDetails[card.id]?.expiry_yy
                        ? `${cardFullDetails[card.id].expiry_mm}/${cardFullDetails[card.id].expiry_yy}`
                        : card.expiry_mm && card.expiry_yy
                        ? `${card.expiry_mm}/${card.expiry_yy}`
                        : 'MM/YY'}
                    </Text>
                  </View>
                </View>

                {/* CVV and Cashback Details Section - Show when visible */}
                {visibleCardDetails[card.id] && cardFullDetails[card.id]?.cvv && (
                  <View style={[styles.cvvSection, { borderTopColor: `rgba(${cardTheme.textColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0'}, 0.2)` }]}>
                    {/* CVV and Cashback Details in a Row */}
                    <View style={styles.cashbackDetailsRow}>
                      {/* CVV - Narrow */}
                      <View style={styles.cvvItemNarrow}>
                        <Text style={[styles.cashbackLabel, { color: `rgba(${cardTheme.textColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0'}, 0.7)` }]}>CVV</Text>
                        <Text style={[styles.cashbackValue, { color: cardTheme.textColor }]}>
                          {cardFullDetails[card.id].cvv}
                        </Text>
                      </View>
                      {/* TOTAL USED - Narrow */}
                      <View style={styles.totalUsedItemNarrow}>
                        <Text style={[styles.cashbackLabel, { color: `rgba(${cardTheme.textColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0'}, 0.7)` }]}>TOTAL USED</Text>
                        <Text style={[styles.cashbackValue, { color: cardTheme.textColor }]}>
                          ₹{parseFloat(card.total_used || 0).toLocaleString()}
                        </Text>
                      </View>
                      {/* AVAILABLE CB LIMIT - Wider */}
                      <View style={styles.availableCbLimitItem}>
                        <Text style={[styles.cashbackLabel, { color: `rgba(${cardTheme.textColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0'}, 0.7)` }]} numberOfLines={1}>AVAILABLE CB LIMIT</Text>
                        <Text style={[styles.cashbackValue, { color: getLimitStatusColor(card.limit_remaining || 0, card.limit_amount || 0) }]}>
                          ₹{parseFloat(card.limit_remaining || 0).toLocaleString()}
                        </Text>
                      </View>
                      {/* CASHBACK */}
                      <View style={styles.cashbackItem}>
                        <Text style={[styles.cashbackLabel, { color: `rgba(${cardTheme.textColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0'}, 0.7)` }]}>CASHBACK</Text>
                        <Text style={[styles.cashbackValue, { color: colors.success }]}>
                          ₹{parseFloat(card.total_cashback || 0).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.viewButton, styles.viewButtonFlex]}
                  onPress={() => {
                    setSelectedCardId(card.id);
                    setDetailsModalVisible(true);
                  }}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, styles.deleteButtonFlex]}
                  onPress={() => handleDeleteCard(card.id, card.card_name)}
                >
                  <Ionicons name="trash" size={18} color="#ffffff" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            );
          })}
          </View>
        )}
      </ScrollView>
      </View>

      <CardDetailsModal
        visible={detailsModalVisible}
        cardId={selectedCardId}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedCardId(null);
        }}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  searchFilterContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchRow: {
    marginBottom: 16,
  },
  searchInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingRight: 40,
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  clearButton: {
    position: 'absolute',
    right: 40,
    top: 8,
    zIndex: 2,
    padding: 4,
  },
  filterRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    marginBottom: 8,
    alignItems: Platform.OS === 'web' ? 'flex-end' : 'stretch',
  },
  filterItem: {
    flex: Platform.OS === 'web' ? 1 : 1,
    minWidth: Platform.OS === 'web' ? 160 : '100%',
  },
  sortOrderButton: {
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'web' ? 0 : 0,
    minWidth: Platform.OS === 'web' ? 50 : '100%',
  },
  sortOrderButtonInner: {
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    height: Platform.OS === 'web' ? 50 : 50,
  },
  advancedFiltersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  advancedFiltersToggleText: {
    marginLeft: 6,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  advancedFiltersRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  filterChipsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  filterChipsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  clearAllChip: {
    backgroundColor: colors.error + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearAllChipText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
  resultsStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    gap: 8,
  },
  resultsCountText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sortInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: Platform.OS === 'web' ? 16 : 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'center',
    alignItems: 'flex-start',
    paddingHorizontal: Platform.OS === 'web' ? 8 : 4,
  },
  cardWrapper: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 20 : 16,
    ...(Platform.OS === 'web' ? {
      width: 420,
      marginRight: 20,
      flexBasis: 420,
      flexGrow: 0,
      flexShrink: 0,
    } : {
      width: '100%',
      maxWidth: 420,
      marginHorizontal: 16,
    }),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 420 : '100%',
  },
  bankCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 28,
    paddingTop: 24,
    paddingBottom: 24,
    minHeight: 240,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 420 : '100%',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingRight: 4,
  },
  cardNameContainer: {
    flex: 1,
    marginRight: 16,
    minWidth: 0,
  },
  cardNameTextFirstRow: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.95,
  },
  bankNameContainerFirstRow: {
    flexShrink: 0,
  },
  bankNameTextFirstRow: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eyeButtonInline: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexShrink: 0,
  },
  cardTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chipContainer: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  cardTopRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexShrink: 0,
  },
  chip: {
    width: 45,
    height: 32,
    backgroundColor: '#d4af37',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  chipLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    left: '20%',
    right: '20%',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -30,
    left: -30,
  },
  bankNameSection: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  cardNumberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
    width: '100%',
    marginTop: 4,
  },
  cardNumberContainer: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    marginRight: 12,
  },
  cardNumberText: {
    fontSize: 21,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false,
  },
  cardBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: 8,
  },
  cardNameSection: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  cardBottomLeft: {
    flex: 1,
  },
  cardBottomRight: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 6,
    letterSpacing: 1.2,
    fontWeight: '500',
  },
  cardHolderName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardExpiry: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
  cvvSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  cashbackDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
    paddingHorizontal: 2,
  },
  cvvItemNarrow: {
    width: 45,
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  totalUsedItemNarrow: {
    width: 65,
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  availableCbLimitItem: {
    flex: 1.8,
    alignItems: 'flex-start',
    minWidth: 0,
    paddingHorizontal: 2,
  },
  cashbackItem: {
    flex: 1,
    alignItems: 'flex-start',
    minWidth: 0,
  },
  cashbackLabel: {
    fontSize: 7,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
    letterSpacing: 0.8,
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: 10,
  },
  cashbackValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
    textAlign: 'left',
    lineHeight: 18,
  },
  cardNameBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  cardNameText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bankNameText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardNameTextStandard: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  cardNetworkLogo: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  cardNetworkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  viewButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  viewButtonFlex: {
    flex: 1,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  deleteButtonFlex: {
    flex: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  emptyCard: {
    margin: 16,
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
});

