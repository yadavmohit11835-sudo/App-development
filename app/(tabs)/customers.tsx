import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  ChevronRight,
  Filter,
  UserCheck,
  Building2,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { Customer, CustomerStatus } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../services/authContext';

export default function CustomersScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get('/customers', {
        params: {
          search: searchQuery,
          status: selectedStatus === 'all' ? undefined : selectedStatus,
        },
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const getStatusVariant = (status: CustomerStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'demo_scheduled':
        return 'info';
      case 'contacted':
        return 'primary';
      case 'lead':
        return 'warning';
      case 'inactive':
      default:
        return 'neutral';
    }
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <Card
      variant="elevated"
      style={styles.customerCard}
      onPress={() => router.push(`/customers/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.shop_name}</Text>
          <Text style={styles.ownerName}>Proprietor: {item.owner_name}</Text>
        </View>
        <Badge
          label={item.status.replace('_', ' ')}
          variant={getStatusVariant(item.status)}
        />
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Phone size={14} color={THEME.colors.textMuted} />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={THEME.colors.textMuted} />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.city}, {item.state}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.repInfo}>
          <UserCheck size={13} color={THEME.colors.royalBlue} />
          <Text style={styles.repText}>
            Assigned: {item.assigned_salesperson_name || 'Unassigned'}
          </Text>
        </View>
        <ChevronRight size={16} color={THEME.colors.textMuted} />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header bar */}
      <View style={styles.topHeader}>
        <Text style={styles.title}>Customers & Leads</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/customers/add')}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color={THEME.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by shop, owner name, or phone..."
          placeholderTextColor={THEME.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScroll}>
        {['all', 'active', 'demo_scheduled', 'lead', 'contacted', 'inactive'].map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterPill,
                selectedStatus === status && styles.filterPillActive,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedStatus === status && styles.filterPillTextActive,
                ]}
              >
                {status.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* List */}
      <FlatList
        data={customers}
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
              icon={<Building2 size={40} color={THEME.colors.textMuted} />}
              title="No Customers Found"
              description={
                searchQuery
                  ? 'No customers match your search criteria.'
                  : 'Start growing your business pipeline by adding new customer records.'
              }
              actionTitle="Add New Customer"
              onAction={() => router.push('/customers/add')}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 4,
  },
  filterPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterPillText: {
    fontSize: 10,
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
  customerCard: {
    marginBottom: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  shopInfo: {
    flex: 1,
    marginRight: 8,
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
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  repInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  repText: {
    fontSize: 11,
    color: THEME.colors.royalBlue,
    fontWeight: '600',
  },
});
