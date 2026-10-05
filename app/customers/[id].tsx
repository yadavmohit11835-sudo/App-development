import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  CalendarPlus,
  Receipt,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingScreen from '../../components/LoadingScreen';
import { Customer, Demo, Subscription, Payment } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../services/authContext';

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerDetails = useCallback(async () => {
    if (!id) return;
    try {
      const [custRes, demoRes, subRes, payRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/customers/${id}/demos`),
        api.get(`/customers/${id}/subscriptions`),
        api.get(`/customers/${id}/payments`),
      ]);
      setCustomer(custRes.data);
      setDemos(demoRes.data || []);
      setSubscriptions(subRes.data || []);
      setPayments(payRes.data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (customer?.phone) {
      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/91${cleanPhone}`);
    }
  };

  const formatCurrency = (amt: number) => '₹' + (amt || 0).toLocaleString('en-IN');

  if (loading) {
    return <LoadingScreen message="Loading customer record..." showLogo={false} />;
  }

  if (!customer) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Customer record not found.</Text>
        <Button title="Back to Customers" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Profile Card */}
        <Card variant="elevated" style={styles.mainCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.shopName}>{customer.shop_name}</Text>
              <Text style={styles.ownerName}>Proprietor: {customer.owner_name}</Text>
            </View>
            <Badge label={customer.status.replace('_', ' ')} variant="primary" />
          </View>

          {/* Quick Contact Buttons */}
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: '#25D366' }]}
              onPress={handleWhatsApp}
            >
              <Text style={styles.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: THEME.colors.surfaceSubtle }]}
              onPress={() =>
                router.push({
                  pathname: '/demos/add',
                  params: {
                    customerId: customer.id,
                    shopName: customer.shop_name,
                  },
                })
              }
            >
              <CalendarPlus size={16} color={THEME.colors.primary} />
              <Text style={[styles.contactBtnText, { color: THEME.colors.primary }]}>
                Demo
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Address and Info Card */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Contact & Address</Text>
          <View style={styles.infoLine}>
            <Phone size={15} color={THEME.colors.textMuted} />
            <Text style={styles.infoText}>{customer.phone}</Text>
          </View>
          {customer.email ? (
            <View style={styles.infoLine}>
              <Mail size={15} color={THEME.colors.textMuted} />
              <Text style={styles.infoText}>{customer.email}</Text>
            </View>
          ) : null}
          <View style={styles.infoLine}>
            <MapPin size={15} color={THEME.colors.textMuted} />
            <Text style={styles.infoText}>
              {customer.address}, {customer.city}, {customer.state}{' '}
              {customer.pincode ? `- ${customer.pincode}` : ''}
            </Text>
          </View>
          <View style={styles.infoLine}>
            <User size={15} color={THEME.colors.royalBlue} />
            <Text style={styles.infoText}>
              Assigned Rep: {customer.assigned_salesperson_name || 'Unassigned'}
            </Text>
          </View>
          {customer.notes ? (
            <View style={styles.notesBlock}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesValue}>{customer.notes}</Text>
            </View>
          ) : null}
        </Card>

        {/* Subscriptions section */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>Subscriptions & Licenses</Text>
          </View>
          {subscriptions.length > 0 ? (
            subscriptions.map((s) => (
              <View key={s.id} style={styles.subItem}>
                <View style={styles.subItemTop}>
                  <Text style={styles.subPlan}>{s.plan_name}</Text>
                  <Badge label={s.status} variant={s.status === 'active' ? 'success' : 'warning'} />
                </View>
                <Text style={styles.subDates}>
                  Validity: {s.start_date} to {s.expiry_date}
                </Text>
                <View style={styles.subFinancials}>
                  <Text style={styles.finSmall}>Total: {formatCurrency(s.total_amount)}</Text>
                  <Text style={styles.finSmall}>Paid: {formatCurrency(s.amount_paid)}</Text>
                  <Text style={[styles.finSmall, { color: THEME.colors.danger, fontWeight: '700' }]}>
                    Due: {formatCurrency(s.outstanding_balance)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyNote}>No subscription plan active yet.</Text>
          )}
        </Card>

        {/* Demo History */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>Demo Visits History</Text>
          </View>
          {demos.length > 0 ? (
            demos.map((d) => (
              <View key={d.id} style={styles.demoItem}>
                <View style={styles.subItemTop}>
                  <Text style={styles.demoDate}>
                    {d.demo_date} at {d.demo_time}
                  </Text>
                  <Badge
                    label={d.status}
                    variant={d.status === 'completed' ? 'success' : 'warning'}
                  />
                </View>
                <Text style={styles.demoLoc}>Location: {d.location}</Text>
                {d.notes ? <Text style={styles.demoNote}>Notes: {d.notes}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyNote}>No demo records found for this customer.</Text>
          )}
        </Card>

        {/* Payments History */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>Payment Records</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/payments/add',
                  params: {
                    customerId: customer.id,
                    shopName: customer.shop_name,
                  },
                })
              }
            >
              <Text style={styles.addPaymentLink}>+ Record Payment</Text>
            </TouchableOpacity>
          </View>
          {payments.length > 0 ? (
            payments.map((p) => (
              <View key={p.id} style={styles.payItem}>
                <View style={styles.subItemTop}>
                  <Text style={styles.payAmount}>{formatCurrency(p.amount_paid)}</Text>
                  <Text style={styles.payDate}>{p.payment_date}</Text>
                </View>
                <Text style={styles.payMethod}>
                  Method: {p.payment_method.toUpperCase()} • Ref: {p.reference_number || 'N/A'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyNote}>No payments recorded yet.</Text>
          )}
        </Card>
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
  },
  mainCard: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  shopName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  ownerName: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.radii.md,
    gap: 6,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addPaymentLink: {
    color: THEME.colors.royalBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  notesBlock: {
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 10,
    borderRadius: THEME.radii.sm,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  notesValue: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  emptyNote: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  subItem: {
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 10,
    borderRadius: THEME.radii.md,
    marginBottom: 8,
  },
  subItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subPlan: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  subDates: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginVertical: 4,
  },
  subFinancials: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 4,
    marginTop: 4,
  },
  finSmall: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
  },
  demoItem: {
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 10,
    borderRadius: THEME.radii.md,
    marginBottom: 8,
  },
  demoDate: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  demoLoc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  demoNote: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  payItem: {
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 10,
    borderRadius: THEME.radii.md,
    marginBottom: 8,
  },
  payAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.success,
  },
  payDate: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  payMethod: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
});
