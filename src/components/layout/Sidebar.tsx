import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../styles/colors';

interface SidebarItem {
  name: string;
  label: string;
  icon: string;
  hasChildren?: boolean;
}

const menuItems: SidebarItem[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: '📊' },
  { name: 'AddBooking', label: 'Add Booking', icon: '📱' },
  { name: 'AddFriend', label: 'Add Friend', icon: '👥' },
  { name: 'AddCard', label: 'Add Card', icon: '💳' },
  { name: 'CardsList', label: 'All Cards', icon: '📋' },
  { name: 'PlatformsManagement', label: 'Platforms', icon: '🏪' },
  { name: 'SellerPaymentsList', label: 'Seller Payments', icon: '💰' },
];

interface SidebarProps {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}

export function Sidebar({ onToggleSidebar, isCollapsed = false }: SidebarProps) {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const handleNavigate = (screenName: string) => {
    navigation.navigate(screenName);
    // Close sidebar on mobile after navigation
    if (onToggleSidebar && !isCollapsed) {
      onToggleSidebar();
    }
  };

  // Collapsed view - show only icons
  if (isCollapsed) {
    return (
      <View style={styles.collapsedSidebar}>
        <View style={styles.collapsedHeader}>
          <TouchableOpacity 
            onPress={onToggleSidebar}
            style={styles.collapsedToggleButton}
          >
            <Text style={styles.collapsedToggleIcon}>☰</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          style={styles.collapsedMenuContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.collapsedMenuContent}
        >
          {menuItems.map((item) => {
            const isActive = route.name === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.collapsedMenuItem, isActive && styles.collapsedMenuItemActive]}
                onPress={() => handleNavigate(item.name)}
              >
                <Text style={styles.collapsedMenuIcon}>{item.icon}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Expanded view - show full sidebar
  return (
    <View style={styles.sidebar}>
      {/* Sidebar Header */}
      <View style={styles.sidebarHeader}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>📱</Text>
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.sidebarTitle}>MOBILE BOOKING</Text>
            <Text style={styles.sidebarSubtitle}>Management System</Text>
          </View>
        </View>
        {onToggleSidebar && (
          <TouchableOpacity onPress={onToggleSidebar} style={styles.toggleButton}>
            <Text style={styles.toggleIcon}>☰</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation Menu */}
      <ScrollView 
        style={styles.menuContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        {menuItems.map((item) => {
          const isActive = route.name === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => handleNavigate(item.name)}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                  {item.label}
                </Text>
                {item.hasChildren && (
                  <Text style={styles.chevronIcon}>›</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: '#1c294a',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  collapsedSidebar: {
    width: 64,
    backgroundColor: '#1c294a',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsedHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 24,
  },
  logoTextContainer: {
    flex: 1,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
    marginBottom: 2,
  },
  sidebarSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 4,
  },
  toggleIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  collapsedToggleButton: {
    padding: 8,
    borderRadius: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedToggleIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  collapsedMenuContainer: {
    flex: 1,
  },
  collapsedMenuContent: {
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 6,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  collapsedMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 6,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedMenuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  collapsedMenuIcon: {
    fontSize: 20,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    flex: 1,
  },
  menuLabelActive: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  chevronIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
});

