import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { store, persistor } from './redux/store/store';
import { RootState } from './redux/store/store';
import { LoginForm } from './features/auth/components/LoginForm';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { CompanyRegistrationForm } from './features/companyRegistration/components/CompanyRegistrationForm';
import { PartnerSetupForm } from './features/companyRegistration/components/PartnerSetupForm';
import { AddFriendScreen } from './features/friends/components/AddFriendScreen';
import { AddCardScreen } from './features/cards/components/AddCardScreen';
import { CardsListScreen } from './features/cards/components/CardsListScreen';
import { AddBookingScreen } from './features/bookings/components/AddBookingScreen';
import { PlatformsManagementScreen } from './features/platforms/components/PlatformsManagementScreen';
import { AddSellerPaymentScreen } from './features/sellerPayments/components/AddSellerPaymentScreen';
import { SellerPaymentsListScreen } from './features/sellerPayments/components/SellerPaymentsListScreen';
import Toast from 'react-native-toast-message';
import { colors } from './styles/colors';

const Stack = createNativeStackNavigator();

function LoginScreen() {
  return (
    <View style={styles.container}>
      <LoginForm />
    </View>
  );
}

function CompanyRegistrationScreen() {
  return (
    <View style={styles.container}>
      <CompanyRegistrationForm />
    </View>
  );
}

function PartnerSetupScreen() {
  return (
    <View style={styles.container}>
      <PartnerSetupForm />
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function AppNavigator() {
  const authState = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, token, user } = authState;
  
  // Check if we have valid auth data (token and user)
  // This ensures we don't show login screen if user is already authenticated
  // If token and user exist, consider user authenticated (handles rehydration)
  const hasValidAuth = !!(token && user);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {hasValidAuth ? (
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AddFriend" 
              component={AddFriendScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AddCard" 
              component={AddCardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CardsList" 
              component={CardsListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AddBooking" 
              component={AddBookingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="PlatformsManagement" 
              component={PlatformsManagementScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SellerPaymentsList" 
              component={SellerPaymentsListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AddSellerPayment" 
              component={AddSellerPaymentScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CompanyRegistration" 
              component={CompanyRegistrationScreen}
              options={{ title: 'Register Company' }}
            />
            <Stack.Screen 
              name="PartnerSetup" 
              component={PartnerSetupScreen}
              options={{ title: 'Setup Partners' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

function PersistGateLoading() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistGateLoading />} persistor={persistor}>
        <AppNavigator />
        <Toast />
      </PersistGate>
    </Provider>
  );
}
