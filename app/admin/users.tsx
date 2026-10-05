import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserCheck, Plus, Mail, Phone, Shield, X, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Input from '../../components/Input';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { User } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../services/authContext';

export default function SalesTeamManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal for creating salesperson
  const [modalVisible, setModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setTeam(res.data || []);
    } catch (err: any) {
      console.error('Error fetching sales team:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Unauthorized', 'Admin access required for team management.');
      router.back();
      return;
    }
    fetchTeam();
  }, [user, fetchTeam]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeam();
  };

  const handleCreateUser = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Full name, email, and password are required.');
      return;
    }

    setCreating(true);
    try {
      await api.post('/users', {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password.trim(),
        role: 'salesperson',
      });

      Alert.alert('Success', 'Salesperson account created successfully!');
      setModalVisible(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      fetchTeam();
    } catch (err: any) {
      Alert.alert('Creation Failed', err.message || 'Could not create account');
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.full_name}</Text>
          <Text style={styles.userRole}>Role: {item.role.toUpperCase()}</Text>
        </View>
        <Badge
          label={item.status}
          variant={item.status === 'active' ? 'success' : 'neutral'}
        />
      </View>

      <View style={styles.infoRow}>
        <Mail size={14} color={THEME.colors.textMuted} />
        <Text style={styles.infoText}>{item.email}</Text>
      </View>

      {item.phone ? (
        <View style={styles.infoRow}>
          <Phone size={14} color={THEME.colors.textMuted} />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>
      ) : null}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Sales Team Accounts</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Rep</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={team}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={<UserCheck size={38} color={THEME.colors.textMuted} />}
              title="No Team Members Found"
              description="Add salesperson accounts to assign customer portfolios."
              actionTitle="Add Salesperson"
              onAction={() => setModalVisible(true)}
            />
          ) : null
        }
      />

      {/* Modal for adding Sales Rep */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Sales Representative</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Full Name *"
              placeholder="e.g. Amit Sharma"
              value={fullName}
              onChangeText={setFullName}
            />

            <Input
              label="Work Email *"
              placeholder="e.g. amit@keyprime.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Mobile Phone"
              placeholder="e.g. 9825000000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Input
              label="Account Password *"
              placeholder="Temporary login password"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <Button
              title="Create Account"
              onPress={handleCreateUser}
              loading={creating}
              variant="primary"
              size="lg"
              icon={<Check size={18} color="#FFFFFF" />}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: THEME.colors.surface,
  },
  title: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.md,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  userRole: {
    fontSize: 12,
    color: THEME.colors.royalBlue,
    fontWeight: '600',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  infoText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.xl,
    padding: 20,
    ...THEME.shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
});
