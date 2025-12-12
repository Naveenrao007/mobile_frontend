/**
 * Service to manage persistent card names
 * Works offline and persists across sessions
 * Supports both web (localStorage) and React Native (AsyncStorage)
 */

import cardNamesData from '../data/cardNames.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'persistent_card_names';

// Helper to get storage based on platform
const getStorage = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
    };
  }
  return AsyncStorage;
};

export interface CardNameOption {
  name: string;
  source: 'default' | 'user' | 'api';
}

/**
 * Get all card names from JSON file
 */
export function getDefaultCardNames(): string[] {
  return cardNamesData.cardNames || [];
}

/**
 * Get persistent card names from storage (AsyncStorage for RN, localStorage for web)
 */
export async function getPersistentCardNames(): Promise<string[]> {
  try {
    const storage = getStorage();
    const stored = await storage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Error reading persistent card names:', error);
  }
  
  return [];
}

/**
 * Synchronous version for immediate use (returns empty array if not available)
 */
export function getPersistentCardNamesSync(): string[] {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Error reading persistent card names:', error);
    }
  }
  return [];
}

/**
 * Save card name to persistent storage
 */
export async function addPersistentCardName(cardName: string): Promise<void> {
  try {
    const existing = await getPersistentCardNames();
    const trimmedName = cardName.trim();
    
    // Don't add if already exists
    if (!trimmedName || existing.includes(trimmedName)) {
      return;
    }
    
    // Add to persistent storage
    const updated = [...existing, trimmedName].sort();
    const storage = getStorage();
    await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving persistent card name:', error);
  }
}

/**
 * Get all card names (default + persistent + API, no duplicates)
 * Async version - use this when you can await
 */
export async function getAllCardNames(apiCardNames: string[] = []): Promise<string[]> {
  const defaultNames = getDefaultCardNames();
  const persistentNames = await getPersistentCardNames();
  
  // Combine all sources
  const allNames = [
    ...defaultNames,
    ...persistentNames,
    ...apiCardNames,
  ];
  
  // Remove duplicates and empty strings, then sort
  const uniqueNames = Array.from(new Set(
    allNames
      .map(name => name.trim())
      .filter(name => name.length > 0)
  )).sort();
  
  return uniqueNames;
}

/**
 * Synchronous version - uses sync storage (works for web, may return empty for RN initially)
 */
export function getAllCardNamesSync(apiCardNames: string[] = []): string[] {
  const defaultNames = getDefaultCardNames();
  const persistentNames = getPersistentCardNamesSync();
  
  // Combine all sources
  const allNames = [
    ...defaultNames,
    ...persistentNames,
    ...apiCardNames,
  ];
  
  // Remove duplicates and empty strings, then sort
  const uniqueNames = Array.from(new Set(
    allNames
      .map(name => name.trim())
      .filter(name => name.length > 0)
  )).sort();
  
  return uniqueNames;
}

/**
 * Sync API card names to persistent storage
 */
export function syncApiCardNames(apiCardNames: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const persistent = getPersistentCardNames();
    const apiNames = apiCardNames
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    // Merge and remove duplicates
    const merged = Array.from(new Set([...persistent, ...apiNames])).sort();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Error syncing API card names:', error);
  }
}

/**
 * Clear all persistent card names (keep defaults)
 */
export async function clearPersistentCardNames(): Promise<void> {
  try {
    const storage = getStorage();
    await storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing persistent card names:', error);
  }
}
