import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, TextInput, Modal, Platform as RNPlatform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { colors } from '../../../styles/colors';
import { platformService, Platform } from '../../../services/platformService';
import Toast from 'react-native-toast-message';

export function PlatformsManagementScreen() {
  const navigation = useNavigation<any>();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [editPlatformName, setEditPlatformName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    setLoading(true);
    try {
      const response = await platformService.getAll();
      setPlatforms(response.platforms || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load platforms',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlatform = async () => {
    if (!newPlatformName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Platform name is required',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await platformService.add({ name: newPlatformName.trim() });
      setPlatforms([...platforms, response.platform]);
      setNewPlatformName('');
      setShowAddModal(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Platform added successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to add platform',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditPlatform = async () => {
    if (!editingPlatform || !editPlatformName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Platform name is required',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await platformService.update(editingPlatform.id!, { name: editPlatformName.trim() });
      setPlatforms(platforms.map(p => p.id === editingPlatform.id ? response.platform : p));
      setEditingPlatform(null);
      setEditPlatformName('');
      setShowEditModal(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Platform updated successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update platform',
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (platform: Platform) => {
    setEditingPlatform(platform);
    setEditPlatformName(platform.name);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingPlatform(null);
    setEditPlatformName('');
    setShowEditModal(false);
  };

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Platforms Management</Text>
          <Text style={styles.subtitle}>Manage e-commerce platforms like Amazon, Flipkart, etc.</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="+ Add Platform"
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPlatforms} />}
        >
          {platforms.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="storefront-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No platforms found</Text>
              <Text style={styles.emptySubtext}>Add your first platform to get started</Text>
            </Card>
          ) : (
            platforms.map((platform) => (
              <Card key={platform.id} style={styles.platformCard}>
                <View style={styles.platformContent}>
                  <View style={styles.platformInfo}>
                    <Text style={styles.platformName}>{platform.name}</Text>
                    {platform.is_active === false && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveText}>Inactive</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(platform)}
                  >
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </View>

      {/* Add Platform Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Platform</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Platform Name *"
              value={newPlatformName}
              onChangeText={setNewPlatformName}
              placeholder="e.g., Amazon, Flipkart"
              editable={!saving}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowAddModal(false);
                  setNewPlatformName('');
                }}
                variant="outline"
                style={styles.modalButton}
                disabled={saving}
              />
              <Button
                title="Add Platform"
                onPress={handleAddPlatform}
                loading={saving}
                disabled={saving || !newPlatformName.trim()}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Edit Platform Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Platform</Text>
              <TouchableOpacity
                onPress={closeEditModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Platform Name *"
              value={editPlatformName}
              onChangeText={setEditPlatformName}
              placeholder="e.g., Amazon, Flipkart"
              editable={!saving}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={closeEditModal}
                variant="outline"
                style={styles.modalButton}
                disabled={saving}
              />
              <Button
                title="Update Platform"
                onPress={handleEditPlatform}
                loading={saving}
                disabled={saving || !editPlatformName.trim()}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>
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
  actions: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  addButton: {
    maxWidth: 200,
  },
  scrollView: {
    flex: 1,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  platformCard: {
    margin: 16,
    marginBottom: 12,
  },
  platformContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  inactiveBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inactiveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalInput: {
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
