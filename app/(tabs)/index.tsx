import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  Users,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  CreditCard,
  BarChart3,
  ChevronRight,
  Clock,
  Phone,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import DashboardHeader from '../../components/DashboardHeader';
import StatCard from '../../components/StatCard';
import QuickActionButton from '../../components/QuickActionButton';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { DashboardStats, Demo, Customer, Payment, Subscription } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../services/authContext';

type DateFilter = 'today' | 'week' | 'month' | 'all';
type ActivityTab = 'demos' | 'customers' | 'payments' | 'subscriptions';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [activityTab, setActivityTab] = useState<ActivityTab>('demos');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await api.get('/dashboard/stats', {
        params: { range: dateFilter },
      });
      setStats(res.data);
    } catch (err: any) {
      console.warn('Dashboard fetch error:', err.message);
      setErrorMessage(err.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardHeader unreadNotificationsCount={stats?.expiring_soon_subscriptions || 0} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Date Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Overview Range:</Text>
          <View style={styles.filterPills}>
            {(['today', 'week', 'month', 'all'] as DateFilter[]).map((filter) => {
              const isActive = dateFilter === filter;
              const labels: Record<DateFilter, string> = {
                today: 'Today',
                week: 'This Week',
                month: 'This Month',
                all: 'All Time',
              };
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setDateFilter(filter)}
                  style={[styles.pill, isActive && styles.pillActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {labels[filter]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {errorMessage && (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{errorMessage}</Text>
            <TouchableOpacity onPress={fetchDashboardData} style={styles.retryBtn}>
              <Text style={styles.retryText}>Tap to Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4 Primary Summary Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Today's Demos"
            value={stats?.today_demos ?? 0}
            icon={<CalendarDays size={22} color={THEME.colors.primary} />}
            iconBgColor="#E0F2FE"
            subtext="Scheduled visits"
            onPress={() => router.push('/(tabs)/demos')}
          />

          <StatCard
            label="Total Customers"
            value={stats?.total_customers ?? 0}
            icon={<Users size={22} color={THEME.colors.royalBlue} />}
            iconBgColor="#EEF2FF"
            subtext="Active accounts"
            onPress={() => router.push('/(tabs)/customers')}
          />

          <StatCard
            label="Active Subscriptions"
            value={stats?.active_subscriptions ?? 0}
            icon={<ShieldCheck size={22} color={THEME.colors.success} />}
            iconBgColor={THEME.colors.successLight}
            subtext={
              stats?.expiring_soon_subscriptions
                ? `${stats.expiring_soon_subscriptions} expiring soon`
                : 'Current licenses'
            }
            onPress={() => router.push('/(tabs)/subscriptions')}
          />

          <StatCard
            label="Collections"
            value={formatCurrency(stats?.monthly_collections ?? 0)}
            icon={<TrendingUp size={22} color="#DC2626" />}
            iconBgColor="#FEE2E2"
            subtext="Received payments"
            onPress={() => router.push('/reports')}
          />
        </View>

        {/* Outstanding Total Banner if any */}
        {(stats?.outstanding_total ?? 0) > 0 && (
          <TouchableOpacity
            style={styles.outstandingBanner}
            activeOpacity={0.8}
            onPress={() => router.push('/reports')}
          >
            <View style={styles.outstandingLeft}>
              <ShieldAlert size={20} color={THEME.colors.warning} />
              <View>
                <Text style={styles.outstandingLabel}>Total Outstanding Balance</Text>
                <Text style={styles.outstandingAmount}>
                  {formatCurrency(stats?.outstanding_total || 0)}
                </Text>
              </View>
            </View>
            <ArrowUpRight size={18} color={THEME.colors.warning} />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <Card variant="elevated" style={styles.quickActionsCard}>
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              label="Add Customer"
              icon={<UserPlus size={22} color="#FFFFFF" />}
              iconBgColor={THEME.colors.primary}
              onPress={() => router.push('/customers/add')}
            />
            <QuickActionButton
              label="Schedule Demo"
              icon={<CalendarPlus size={22} color="#FFFFFF" />}
              iconBgColor={THEME.colors.royalBlue}
              onPress={() => router.push('/demos/add')}
            />
            <QuickActionButton
              label="Record Payment"
              icon={<CreditCard size={22} color="#FFFFFF" />}
              iconBgColor="#16A34A"
              onPress={() => router.push('/payments/add')}
            />
            <QuickActionButton
              label="Reports"
              icon={<BarChart3 size={22} color="#FFFFFF" />}
              iconBgColor="#DC2626"
              onPress={() => router.push('/reports')}
            />
          </View>
        </Card>

        {/* Recent Activities Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {/* Activity Segment Tabs */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activityTab === 'demos' && styles.segmentActive]}
            onPress={() => setActivityTab('demos')}
          >
            <Text style={[styles.segmentText, activityTab === 'demos' && styles.segmentTextActive]}>
              Demos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activityTab === 'customers' && styles.segmentActive]}
            onPress={() => setActivityTab('customers')}
          >
            <Text style={[styles.segmentText, activityTab === 'customers' && styles.segmentTextActive]}>
              Customers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activityTab === 'payments' && styles.segmentActive]}
            onPress={() => setActivityTab('payments')}
          >
            <Text style={[styles.segmentText, activityTab === 'payments' && styles.segmentTextActive]}>
              Payments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activityTab === 'subscriptions' && styles.segmentActive]}
            onPress={() => setActivityTab('subscriptions')}
          >
            <Text
              style={[
                styles.segmentText,
                activityTab === 'subscriptions' && styles.segmentTextActive,
              ]}
            >
              Plans
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activity Tab Content */}
        <View style={styles.activityFeed}>
          {activityTab === 'demos' && (
            <>
              {stats?.recent_demos && stats.recent_demos.length > 0 ? (
                stats.recent_demos.map((demo: Demo) => (
                  <Card
                    key={demo.id}
                    variant="elevated"
                    style={styles.activityCard}
                    onPress={() => router.push(`/(tabs)/demos`)}
                  >
                    <View style={styles.activityCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle}>{demo.customer_shop_name}</Text>
                        <Text style={styles.activitySubtitle}>
                          Contact: {demo.customer_owner_name}
                        </Text>
                      </View>
                      <Badge
                        label={demo.status}
                        variant={
                          demo.status === 'completed'
                            ? 'success'
                            : demo.status === 'cancelled'
                            ? 'danger'
                            : 'warning'
                        }
                      />
                    </View>
                    <View style={styles.activityCardFooter}>
                      <View style={styles.footerInfoItem}>
                        <Clock size={13} color={THEME.colors.textMuted} />
                        <Text style={styles.footerInfoText}>
                          {demo.demo_date} • {demo.demo_time}
                        </Text>
                      </View>
                      <Text style={styles.repBadge}>By: {demo.salesperson_name}</Text>
                    </View>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={<CalendarDays size={32} color={THEME.colors.textMuted} />}
                  title="No Demos Scheduled"
                  description="Schedule a product demo for your leads to accelerate sales."
                  actionTitle="Schedule Demo"
                  onAction={() => router.push('/demos/add')}
                />
              )}
            </>
          )}

          {activityTab === 'customers' && (
            <>
              {stats?.recent_customers && stats.recent_customers.length > 0 ? (
                stats.recent_customers.map((c: Customer) => (
                  <Card
                    key={c.id}
                    variant="elevated"
                    style={styles.activityCard}
                    onPress={() => router.push(`/customers/${c.id}`)}
                  >
                    <View style={styles.activityCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle}>{c.shop_name}</Text>
                        <Text style={styles.activitySubtitle}>
                          {c.owner_name} • {c.city}, {c.state}
                        </Text>
                      </View>
                      <Badge
                        label={c.status.replace('_', ' ')}
                        variant={c.status === 'active' ? 'success' : 'neutral'}
                      />
                    </View>
                    <View style={styles.activityCardFooter}>
                      <View style={styles.footerInfoItem}>
                        <Phone size={13} color={THEME.colors.textMuted} />
                        <Text style={styles.footerInfoText}>{c.phone}</Text>
                      </View>
                      <ChevronRight size={16} color={THEME.colors.textMuted} />
                    </View>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={<Users size={32} color={THEME.colors.textMuted} />}
                  title="No Customers Yet"
                  description="Register new customer shops and track their sales journey."
                  actionTitle="Add Customer"
                  onAction={() => router.push('/customers/add')}
                />
              )}
            </>
          )}

          {activityTab === 'payments' && (
            <>
              {stats?.recent_payments && stats.recent_payments.length > 0 ? (
                stats.recent_payments.map((p: Payment) => (
                  <Card key={p.id} variant="elevated" style={styles.activityCard}>
                    <View style={styles.activityCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle}>{p.customer_shop_name}</Text>
                        <Text style={styles.activitySubtitle}>
                          Method: {p.payment_method.toUpperCase()} • Ref:{' '}
                          {p.reference_number || 'N/A'}
                        </Text>
                      </View>
                      <Text style={styles.paymentAmount}>{formatCurrency(p.amount_paid)}</Text>
                    </View>
                    <View style={styles.activityCardFooter}>
                      <Text style={styles.footerInfoText}>Date: {p.payment_date}</Text>
                      <Text style={styles.repBadge}>Recorded by: {p.recorded_by_name}</Text>
                    </View>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={<CreditCard size={32} color={THEME.colors.textMuted} />}
                  title="No Payments Recorded"
                  description="Payments will appear here when subscriptions or dues are collected."
                  actionTitle="Record Payment"
                  onAction={() => router.push('/payments/add')}
                />
              )}
            </>
          )}

          {activityTab === 'subscriptions' && (
            <>
              {stats?.recent_subscriptions && stats.recent_subscriptions.length > 0 ? (
                stats.recent_subscriptions.map((s: Subscription) => (
                  <Card
                    key={s.id}
                    variant="elevated"
                    style={styles.activityCard}
                    onPress={() => router.push('/(tabs)/subscriptions')}
                  >
                    <View style={styles.activityCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle}>{s.customer_shop_name}</Text>
                        <Text style={styles.activitySubtitle}>Plan: {s.plan_name}</Text>
                      </View>
                      <Badge
                        label={s.status.replace('_', ' ')}
                        variant={
                          s.status === 'active'
                            ? 'success'
                            : s.status === 'expiring_soon'
                            ? 'warning'
                            : 'danger'
                        }
                      />
                    </View>
                    <View style={styles.activityCardFooter}>
                      <Text style={styles.footerInfoText}>Expires: {s.expiry_date}</Text>
                      <Text style={styles.subAmountText}>
                        {formatCurrency(s.total_amount)}
                      </Text>
                    </View>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={<ShieldCheck size={32} color={THEME.colors.textMuted} />}
                  title="No Subscriptions Active"
                  description="Assign software licenses and subscription plans to onboarded customers."
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  scrollContent: {
    backgroundColor: THEME.colors.background,
    padding: 16,
    paddingBottom: 40,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  pillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  errorCard: {
    backgroundColor: THEME.colors.dangerLight,
    padding: 12,
    borderRadius: THEME.radii.md,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorCardText: {
    fontSize: 12,
    color: THEME.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  retryBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: THEME.colors.danger,
    borderRadius: THEME.radii.sm,
    marginLeft: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  outstandingBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: THEME.radii.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  outstandingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  outstandingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  outstandingAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 1,
  },
  sectionHeaderRow: {
    marginTop: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  quickActionsCard: {
    padding: 12,
    marginBottom: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radii.md,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.radii.sm,
  },
  segmentActive: {
    backgroundColor: THEME.colors.surface,
    ...THEME.shadows.card,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  segmentTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  activityFeed: {
    marginTop: 4,
  },
  activityCard: {
    padding: 14,
    marginVertical: 4,
  },
  activityCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  activitySubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  activityCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 8,
  },
  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerInfoText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  repBadge: {
    fontSize: 11,
    color: THEME.colors.royalBlue,
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.success,
  },
  subAmountText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
});
