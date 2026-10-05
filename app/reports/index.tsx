import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {
  BarChart3,
  Calendar,
  CreditCard,
  Users,
  ShieldAlert,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingScreen from '../../components/LoadingScreen';
import api from '../../services/api';

export default function ReportsScreen() {
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await api.get('/reports/summary', { params: { range } });
      setReportData(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN');

  if (loading) {
    return <LoadingScreen message="Aggregating performance reports..." showLogo={false} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {/* Date Filter selector */}
        <View style={styles.filterRow}>
          {(['today', 'week', 'month', 'year'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.filterPill, range === r && styles.filterPillActive]}
              onPress={() => setRange(r)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  range === r && styles.filterPillTextActive,
                ]}
              >
                {r === 'today'
                  ? 'Today'
                  : r === 'week'
                  ? 'This Week'
                  : r === 'month'
                  ? 'This Month'
                  : 'This Year'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Financial Collections vs Bookings */}
        <Text style={styles.sectionTitle}>Financial Breakdown</Text>
        <Card variant="elevated" style={styles.finCard}>
          <View style={styles.finRow}>
            <View style={styles.finCol}>
              <Text style={styles.finSubtitle}>Collected Payments</Text>
              <Text style={[styles.finLarge, { color: THEME.colors.success }]}>
                {formatCurrency(reportData?.collected_amount || 0)}
              </Text>
              <Text style={styles.finHint}>Actual cash/UPI received</Text>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.finCol}>
              <Text style={styles.finSubtitle}>Booked Sales</Text>
              <Text style={[styles.finLarge, { color: THEME.colors.royalBlue }]}>
                {formatCurrency(reportData?.booked_sales || 0)}
              </Text>
              <Text style={styles.finHint}>Total subscription volume</Text>
            </View>
          </View>

          <View style={styles.finOutstandingBar}>
            <ShieldAlert size={18} color="#D97706" />
            <Text style={styles.outstandingText}>
              Outstanding Pending Due: {formatCurrency(reportData?.outstanding_amount || 0)}
            </Text>
          </View>
        </Card>

        {/* Operational Metrics */}
        <Text style={styles.sectionTitle}>Operational Performance</Text>
        <View style={styles.metricsGrid}>
          <Card variant="elevated" style={styles.gridItem}>
            <Users size={20} color={THEME.colors.primary} />
            <Text style={styles.gridVal}>{reportData?.new_customers || 0}</Text>
            <Text style={styles.gridLbl}>New Customers</Text>
          </Card>

          <Card variant="elevated" style={styles.gridItem}>
            <Calendar size={20} color={THEME.colors.royalBlue} />
            <Text style={styles.gridVal}>{reportData?.demos_completed || 0}</Text>
            <Text style={styles.gridLbl}>Demos Completed</Text>
          </Card>

          <Card variant="elevated" style={styles.gridItem}>
            <TrendingUp size={20} color={THEME.colors.success} />
            <Text style={styles.gridVal}>{reportData?.total_payments_count || 0}</Text>
            <Text style={styles.gridLbl}>Transactions</Text>
          </Card>

          <Card variant="elevated" style={styles.gridItem}>
            <ShieldAlert size={20} color={THEME.colors.accentRed} />
            <Text style={styles.gridVal}>{reportData?.expiring_soon_count || 0}</Text>
            <Text style={styles.gridLbl}>Expiring Plans</Text>
          </Card>
        </View>

        {/* Sales Team Performance List */}
        {reportData?.team_performance && reportData.team_performance.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Sales Team Leaderboard</Text>
            <Card variant="elevated" style={styles.leaderboardCard}>
              {reportData.team_performance.map((rep: any, idx: number) => (
                <View key={rep.id || idx} style={styles.repRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.repName}>{rep.full_name}</Text>
                    <Text style={styles.repSub}>
                      {rep.demos_count || 0} Demos • {rep.customers_count || 0} Customers
                    </Text>
                  </View>
                  <Text style={styles.repCollections}>
                    {formatCurrency(rep.total_collected || 0)}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  finCard: {
    padding: 16,
    marginBottom: 16,
  },
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  finCol: {
    flex: 1,
    alignItems: 'center',
  },
  finSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  finLarge: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  finHint: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: THEME.colors.border,
    marginHorizontal: 12,
  },
  finOutstandingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: THEME.radii.md,
    gap: 8,
  },
  outstandingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: '48%',
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  gridVal: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 6,
  },
  gridLbl: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  leaderboardCard: {
    padding: 8,
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  repName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  repSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  repCollections: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.success,
  },
});
