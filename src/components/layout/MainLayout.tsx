import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { logout } from '../../redux/slices/authSlice';
import { logout as logoutService } from '../../services/authService';
import Toast from 'react-native-toast-message';
import { Sidebar } from './Sidebar';
import { colors } from '../../styles/colors';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isWeb = Platform.OS === 'web';
  const [sidebarOpen, setSidebarOpen] = useState(true); // Always open by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Collapsed state

  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout());
      Toast.show({
        type: 'success',
        text1: 'Logged out',
        text2: 'You have been logged out successfully',
      });
    } catch (error) {
      dispatch(logout());
    }
  };

  const toggleSidebar = () => {
    if (isWeb) {
      // On web, toggle between collapsed and expanded
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      // On mobile, toggle visibility
      setSidebarOpen(!sidebarOpen);
    }
  };

  // On web, sidebar is always visible (can be collapsed/expanded)
  if (isWeb) {
    return (
      <View style={styles.container}>
        <View style={sidebarCollapsed ? styles.collapsedSidebarContainer : styles.sidebarContainer}>
          <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={sidebarCollapsed} />
        </View>
        
        <View style={styles.mainContent}>
          <View style={styles.topBar}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.UserName}</Text>
              <Text style={styles.userEmail}>{user?.EmailId}</Text>
            </View>
            
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentArea}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  // Mobile: Use modal for sidebar
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleSidebar}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.UserName}</Text>
            <Text style={styles.userEmail}>{user?.EmailId}</Text>
          </View>
          
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentArea}>
          {children}
        </View>
      </View>

      <Modal
        visible={sidebarOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleSidebar}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSidebar}>
            <Sidebar onToggleSidebar={toggleSidebar} />
          </View>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={toggleSidebar}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  sidebarContainer: {
    backgroundColor: '#1c294a',
  },
  collapsedSidebarContainer: {
    backgroundColor: '#1c294a',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.text,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Modal styles for mobile
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalSidebar: {
    width: 280,
    backgroundColor: '#1c294a',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
