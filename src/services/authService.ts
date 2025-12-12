import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

export interface LoginCredentials {
  mobileno?: string;
  emailid?: string;
  username?: string;
  password: string;
  tenantid?: number;
}

export interface LoginResponse {
  message: string;
  status: number;
  token: string;
  user: {
    Id: number;
    UserName: string;
    EmailId?: string;
    MobileNo?: string;
    tenantid: number;
  };
}

export interface TenantOption {
  tenantid: number;
  compid: number;
}

export interface TenantSelectionResponse {
  requiresTenantSelection: boolean;
  tenants: TenantOption[];
  message: string;
}

/**
 * Login user
 */
export async function loginUser(
  identifier: string,
  password: string,
  tenantId?: number
): Promise<LoginResponse | TenantSelectionResponse> {
  const credentials: LoginCredentials = {
    password,
    tenantid: tenantId,
  };

  // Determine identifier type
  if (identifier.includes('@')) {
    credentials.emailid = identifier;
  } else if (/^\d{10}$/.test(identifier)) {
    credentials.mobileno = identifier;
  } else {
    credentials.username = identifier;
  }

  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
}

/**
 * Login with selected tenant
 */
export async function loginWithSelectedTenant(
  identifier: string,
  password: string,
  tenantId: number
): Promise<LoginResponse> {
  const credentials: LoginCredentials = {
    password,
    tenantid: tenantId,
  };

  if (identifier.includes('@')) {
    credentials.emailid = identifier;
  } else if (/^\d{10}$/.test(identifier)) {
    credentials.mobileno = identifier;
  } else {
    credentials.username = identifier;
  }

  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN_WITH_TENANT, credentials);
  return response.data;
}

/**
 * Save token and user data
 */
export async function saveAuthData(token: string, user: any): Promise<void> {
  try {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving auth data:', error);
    throw error;
  }
}

/**
 * Get stored token
 */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Get stored user
 */
export async function getUser(): Promise<any | null> {
  try {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Clear storage regardless of API call result
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }
}

/**
 * Refresh token
 */
export async function refreshToken(): Promise<string> {
  const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
  const { token } = response.data;
  await AsyncStorage.setItem('token', token);
  return token;
}

