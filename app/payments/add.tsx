import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCard, DollarSign, Calendar, Hash, Building, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Customer, Subscription, PaymentMethod } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../services/authContext';

export default function RecordPaymentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ customerId?: string; shopName?: string }>();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    params.customerId ? parseInt(params.customerId, 10) : null
  );
  const [selectedShopName, setSelectedShopName] = useState<string>(params.shopName || '');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);

  // Form fields
  const todayStr = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayStr);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/customers')
      .then((res) => setCustomers(res.data || []))
      .catch((err) => console.log('Error fetching customers:', err));
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      api
        .get(`/customers/${selectedCustomerId}/subscriptions`)
        .then((res) => {
          setSubscriptions(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedSubscriptionId(res.data[0].id);
          }
        })
        .catch((err) => console.log('Error fetching customer subscriptions:', err));
    } else {
      setSubscriptions([]);
      setSelectedSubscriptionId(null);
    }
  }, [selectedCustomerId]);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setSelectedShopName(c.shop_name);
  };

  const handleRecord = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Customer Required', 'Please select the customer making the payment.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount greater than zero.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/payments', {
        customer_id: selectedCustomerId,
        subscription_id: selectedSubscriptionId,
        amount_paid: parsedAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'verified',
      });

      Alert.alert('Payment Recorded', `Payment of ₹${parsedAmount.toLocaleString('en-IN')} successfully logged!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Transaction Failed', err.message || 'Could not record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionHeader}>Customer Account</Text>

          {selectedShopName ? (
            <View style={styles.selectedCustomerBox}>
              <View>
                <Text style={styles.selectedShopName}>{selectedShopName}</Text>
                <Text style={styles.selectedSubtext}>Customer ID: #{selectedCustomerId}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCustomerId(null);
                  setSelectedShopName('');
                }}
              >
                <Text style={styles.changeCustomerText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.customerSelectorList}>
              <Text style={styles.promptText}>Select paying customer:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.customerChips}
              >
                {customers.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.customerChip}
                    onPress={() => handleSelectCustomer(c)}
                  >
                    <Building size={14} color={THEME.colors.primary} />
                    <Text style={styles.customerChipText}>{c.shop_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {subscriptions.length > 0 && (
            <View style={styles.subSelector}>
              <Text style={styles.fieldLabel}>Link to Subscription Plan:</Text>
              <View style={styles.subPills}>
                {subscriptions.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.subPill,
                      selectedSubscriptionId === s.id && styles.subPillActive,
                    ]}
                    onPress={() => setSelectedSubscriptionId(s.id)}
                  >
                    <Text
                      style={[
                        styles.subPillText,
                        selectedSubscriptionId === s.id && styles.subPillTextActive,
                      ]}
                    >
                      {s.plan_name} (Due: ₹{s.outstanding_balance})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Payment Information</Text>

          <Input
            label="Amount Paid (₹) *"
            placeholder="e.g. 15000"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            leftIcon={<DollarSign size={18} color={THEME.colors.primary} />}
          />

          <View style={styles.methodsSection}>
            <Text style={styles.fieldLabel}>Payment Method:</Text>
            <View style={styles.methodPills}>
              {(['upi', 'cash', 'bank_transfer', 'cheque'] as PaymentMethod[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodPill, paymentMethod === m && styles.methodPillActive]}
                  onPress={() => setPaymentMethod(m)}
                >
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === m && styles.methodTextActive,
                    ]}
                  >
                    {m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Payment Date (YYYY-MM-DD)"
            value={paymentDate}
            onChangeText={setPaymentDate}
            leftIcon={<Calendar size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Transaction / UPI Reference Number"
            placeholder="e.g. UPI-928374921 or Cheque #10291"
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            leftIcon={<Hash size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Payment Remarks"
            placeholder="e.g. Received partial advance via GPay..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          <Button
            title="Record Customer Payment"
            onPress={handleRecord}
            loading={loading}
            variant="primary"
            size="lg"
            icon={<Check size={18} color="#FFFFFF" />}
            style={{ marginTop: 10 }}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 18,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  selectedCustomerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 12,
  },
  selectedShopName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  selectedSubtext: {
    fontSize: 11,
    color: THEME.colors.royalBlue,
    marginTop: 2,
  },
  changeCustomerText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.accentRed,
  },
  customerSelectorList: {
    marginBottom: 12,
  },
  promptText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  customerChips: {
    flexDirection: 'row',
  },
  customerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.full,
    marginRight: 8,
    gap: 6,
  },
  customerChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  subSelector: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  subPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.md,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  subPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: THEME.colors.royalBlue,
  },
  subPillText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  subPillTextActive: {
    color: THEME.colors.royalBlue,
    fontWeight: '700',
  },
  methodsSection: {
    marginBottom: 16,
  },
  methodPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  methodPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.radii.md,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minWidth: 70,
  },
  methodPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  methodTextActive: {
    color: '#FFFFFF',
  },
});
