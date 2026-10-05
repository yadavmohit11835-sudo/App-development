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
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { Subscription, SubscriptionStatus } from '../../types';
import api from '../../services/api';

export default function SubscriptionsScreen() {
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await api.get('/subscriptions', {
        params: {
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      });
      setSubscriptions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const sendRenewalReminder = async (id: number) => {
    try {
      await api.post(`/subscriptions/${id}/remind`);
      Alert.alert(
        'Reminder Sent',
        'Customer has been flagged for renewal outreach and notification has been logged.'
      );
      fetchSubscriptions();
    } catch (err: any) {
      Alert.alert('Reminder Failed', err.message || 'Could not send reminder');
    }
  };

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN');

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge label="Active" variant="success" />;
      case 'expiring_soon':
        return <Badge label="Expiring Soon" variant="warning" />;
      case 'expired':
        return <Badge label="Expired" variant="danger" />;
      case 'cancelled':
      default:
        return <Badge label="Cancelled" variant="neutral" />;
    }
  };

  const renderItem = ({ item }: { item: Subscription }) => (
    <Card variant="elevated" style={styles.subCard}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.shopName}>{item.customer_shop_name}</Text>
          <Text style={styles.planName}>Plan: {item.plan_name}</Text>
        </View>
        {getStatusBadge(item.status)}
      </View>

      <View style={styles.datesContainer}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Start Date</Text>
          <Text style={styles.dateValue}>{item.start_date}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Expiry Date</Text>
          <Text
            style={[
              styles.dateValue,
              item.status === 'expiring_soon' && { color: THEME.colors.warning },
              item.status === 'expired' && { color: THEME.colors.danger },
            ]}
          >
            {item.expiry_date}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Duration</Text>
          <Text style={styles.dateValue}>{item.duration_months} Mos</Text>
        </View>
      </View>

      <View style={styles.financialRow}>
        <View>
          <Text style={styles.finLabel}>Total Cost</Text>
          <Text style={styles.finValue}>{formatCurrency(item.total_amount)}</Text>
        </View>
        <View>
          <Text style={styles.finLabel}>Paid</Text>
          <Text style={[styles.finValue, { color: THEME.colors.success }]}>
            {formatCurrency(item.amount_paid)}
          </Text>
        </View>
        <View>
          <Text style={styles.finLabel}>Balance Due</Text>
          <Text
            style={[
              styles.finValue,
              item.outstanding_balance > 0 ? { color: THEME.colors.danger } : {},
            ]}
          >
            {formatCurrency(item.outstanding_balance)}
          </Text>
        </View>
      </View>

      {item.status === 'expiring_soon' || item.status === 'expired' ? (
        <View style={styles.alertRow}>
          <View style={styles.alertNotice}>
            <AlertTriangle size={15} color={THEME.colors.warning} />
            <Text style={styles.alertText}>
              {item.status === 'expiring_soon'
                ? 'License requires renewal soon'
                : 'License has expired'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.remindBtn}
            onPress={() => sendRenewalReminder(item.id)}
          >
            <Text style={styles.remindBtnText}>
              {item.reminder_sent ? 'Sent Again' : 'Send Reminder'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Subscriptions</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'active', 'expiring_soon', 'expired'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[
              styles.filterPill,
              statusFilter === st && styles.filterPillActive,
            ]}
            onPress={() => setStatusFilter(st)}
          >
            <Text
              style={[
                styles.filterPillText,
                statusFilter === st && styles.filterPillTextActive,
              ]}
            >
              {st.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={subscriptions}
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
              icon={<ShieldCheck size={40} color={THEME.colors.textMuted} />}
              title="No Subscriptions Found"
              description="No active or pending subscriptions match the selected filter."
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subCard: {
    marginBottom: 12,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  planName: {
    fontSize: 13,
    color: THEME.colors.royalBlue,
    fontWeight: '600',
    marginTop: 2,
  },
  datesContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radii.md,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dateBlock: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.border,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    marginTop: 4,
  },
  finLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  finValue: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 1,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: THEME.radii.sm,
    marginTop: 8,
  },
  alertNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  alertText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  remindBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.radii.xs,
  },
  remindBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
