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
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Building,
  User,
  Phone,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { Demo, DemoStatus } from '../../types';
import api from '../../services/api';

export default function DemosScreen() {
  const router = useRouter();

  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rangeFilter, setRangeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const fetchDemos = useCallback(async () => {
    try {
      const res = await api.get('/demos', {
        params: {
          status: statusFilter === 'all' ? undefined : statusFilter,
          range: rangeFilter === 'all' ? undefined : rangeFilter,
        },
      });
      setDemos(res.data || []);
    } catch (err) {
      console.error('Failed to fetch demos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, rangeFilter]);

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDemos();
  };

  const updateDemoStatus = async (id: number, status: DemoStatus) => {
    try {
      await api.patch(`/demos/${id}/status`, { status });
      fetchDemos();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update status');
    }
  };

  const renderItem = ({ item }: { item: Demo }) => (
    <Card variant="elevated" style={styles.demoCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.shopName}>{item.customer_shop_name}</Text>
          <Text style={styles.ownerName}>Contact: {item.customer_owner_name}</Text>
        </View>
        <Badge
          label={item.status}
          variant={
            item.status === 'completed'
              ? 'success'
              : item.status === 'cancelled'
              ? 'danger'
              : 'warning'
          }
        />
      </View>

      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Clock size={14} color={THEME.colors.primary} />
          <Text style={styles.detailText}>
            {item.demo_date} at {item.demo_time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={THEME.colors.primary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <User size={14} color={THEME.colors.royalBlue} />
          <Text style={styles.detailText}>Rep: {item.salesperson_name}</Text>
        </View>
        {item.notes ? (
          <View style={styles.notesRow}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}
      </View>

      {item.status === 'scheduled' && (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.statusBtn, styles.completeBtn]}
            onPress={() => updateDemoStatus(item.id, 'completed')}
          >
            <CheckCircle2 size={15} color="#FFFFFF" />
            <Text style={styles.btnText}>Mark Done</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtn, styles.cancelBtn]}
            onPress={() => updateDemoStatus(item.id, 'cancelled')}
          >
            <XCircle size={15} color={THEME.colors.accentRed} />
            <Text style={[styles.btnText, { color: THEME.colors.accentRed }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Demo Visits</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/demos/add')}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Date Range Selector */}
      <View style={styles.filterRow}>
        {(['all', 'today', 'week', 'month'] as const).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.rangePill, rangeFilter === r && styles.rangePillActive]}
            onPress={() => setRangeFilter(r)}
          >
            <Text
              style={[
                styles.rangePillText,
                rangeFilter === r && styles.rangePillTextActive,
              ]}
            >
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Filter */}
      <View style={styles.statusFilterRow}>
        {['all', 'scheduled', 'completed', 'cancelled'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[
              styles.statusPill,
              statusFilter === st && styles.statusPillActive,
            ]}
            onPress={() => setStatusFilter(st)}
          >
            <Text
              style={[
                styles.statusPillText,
                statusFilter === st && styles.statusPillTextActive,
              ]}
            >
              {st.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={demos}
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
              icon={<CalendarDays size={40} color={THEME.colors.textMuted} />}
              title="No Demos Scheduled"
              description="No demos match the current filter selection."
              actionTitle="Schedule New Demo"
              onAction={() => router.push('/demos/add')}
            />
          ) : null
        }
      />
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
    paddingHorizontal: 14,
    borderRadius: THEME.radii.md,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  rangePill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  rangePillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  rangePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  rangePillTextActive: {
    color: '#FFFFFF',
  },
  statusFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.radii.sm,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  statusPillActive: {
    backgroundColor: '#EEF2FF',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  statusPillTextActive: {
    color: THEME.colors.royalBlue,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  demoCard: {
    marginBottom: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  ownerName: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radii.md,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
  },
  notesRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 4,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: THEME.radii.md,
    gap: 6,
  },
  completeBtn: {
    backgroundColor: THEME.colors.success,
  },
  cancelBtn: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.accentRed,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
