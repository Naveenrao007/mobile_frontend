import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: number | string;
}

export interface TableAction<T> {
  label: string;
  icon?: string;
  onPress: (row: T) => void;
  variant?: 'primary' | 'danger' | 'default';
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  onRowPress?: (row: T) => void;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  actions,
  onRowPress,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          {columns.map((column, index) => (
            <View
              key={String(column.key)}
              style={[
                styles.headerCell,
                { width: column.width || 'auto' },
                index === 0 && styles.firstCell,
                index === columns.length - 1 && styles.lastCell,
              ]}
            >
              <Text style={styles.headerText}>{column.label}</Text>
            </View>
          ))}
          {actions && actions.length > 0 && (
            <View style={[styles.headerCell, styles.actionCell]}>
              <Text style={styles.headerText}>Action</Text>
            </View>
          )}
        </View>

        {/* Table Body */}
        {data.map((row, rowIndex) => (
          <TouchableOpacity
            key={rowIndex}
            style={[
              styles.tableRow,
              rowIndex % 2 === 0 && styles.evenRow,
            ]}
            onPress={() => onRowPress?.(row)}
            disabled={!onRowPress}
          >
            {columns.map((column, colIndex) => (
              <View
                key={String(column.key)}
                style={[
                  styles.cell,
                  { width: column.width || 'auto' },
                  colIndex === 0 && styles.firstCell,
                  colIndex === columns.length - 1 && styles.lastCell,
                ]}
              >
                {column.render ? (
                  column.render(row[column.key], row)
                ) : (
                  <Text style={styles.cellText}>
                    {row[column.key] ?? '-'}
                  </Text>
                )}
              </View>
            ))}
            {actions && actions.length > 0 && (
              <View style={[styles.cell, styles.actionCell]}>
                <View style={styles.actionButtons}>
                  {actions.map((action, actionIndex) => {
                    // Map emoji icons to Ionicons
                    const getIconName = () => {
                      if (action.icon === '✏️' || action.icon === 'Edit') return 'create-outline';
                      if (action.icon === '🗑️' || action.icon === 'Delete') return 'trash-outline';
                      return null;
                    };
                    const iconName = getIconName();
                    
                    return (
                      <TouchableOpacity
                        key={actionIndex}
                        style={[
                          styles.actionButton,
                          action.variant === 'danger' && styles.dangerButton,
                          action.variant === 'primary' && styles.primaryButton,
                        ]}
                        onPress={() => action.onPress(row)}
                      >
                        {iconName ? (
                          <Ionicons 
                            name={iconName} 
                            size={16} 
                            color={
                              action.variant === 'danger' 
                                ? colors.error 
                                : action.variant === 'primary'
                                ? colors.primary
                                : colors.text
                            } 
                            style={styles.actionIconComponent}
                          />
                        ) : action.icon ? (
                          <Text style={styles.actionIcon}>{action.icon}</Text>
                        ) : null}
                        <Text
                          style={[
                            styles.actionText,
                            action.variant === 'danger' && styles.dangerText,
                            action.variant === 'primary' && styles.primaryText,
                          ]}
                        >
                          {action.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1c294a',
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  headerCell: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    minWidth: 120,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    minHeight: 52,
  },
  evenRow: {
    backgroundColor: '#fafbfc',
  },
  cell: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    minWidth: 120,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    color: colors.text,
    lineHeight: 20,
  },
  firstCell: {
    paddingLeft: 16,
  },
  lastCell: {
    paddingRight: 16,
  },
  actionCell: {
    minWidth: 160,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
    marginRight: 6,
    minHeight: 36,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  primaryButton: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: '#fee',
    borderColor: colors.error,
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  actionIconComponent: {
    marginRight: 6,
  },
  actionText: {
    fontSize: Platform.OS === 'web' ? 13 : 12,
    color: colors.text,
    fontWeight: '500',
  },
  primaryText: {
    color: colors.primary,
    fontWeight: '600',
  },
  dangerText: {
    color: colors.error,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

