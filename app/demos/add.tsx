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
import { Calendar, Clock, MapPin, Building, User, FileText, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Customer } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../services/authContext';

export default function ScheduleDemoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ customerId?: string; shopName?: string }>();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    params.customerId ? parseInt(params.customerId, 10) : null
  );
  const [selectedShopName, setSelectedShopName] = useState<string>(params.shopName || '');

  // Form fields
  const todayStr = new Date().toISOString().split('T')[0];
  const [demoDate, setDemoDate] = useState(todayStr);
  const [demoTime, setDemoTime] = useState('11:00 AM');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch customers list for selection
    api
      .get('/customers')
      .then((res) => {
        setCustomers(res.data || []);
        if (params.customerId) {
          const match = res.data.find((c: Customer) => c.id.toString() === params.customerId);
          if (match) {
            setSelectedShopName(match.shop_name);
            setLocation(`${match.address}, ${match.city}`);
          }
        }
      })
      .catch((err) => console.log('Error fetching customers for demo:', err));
  }, [params.customerId]);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setSelectedShopName(c.shop_name);
    setLocation(`${c.address}, ${c.city}`);
  };

  const handleSchedule = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Customer Required', 'Please select a customer for the demo visit.');
      return;
    }
    if (!demoDate.trim() || !demoTime.trim()) {
      Alert.alert('Date & Time Required', 'Please provide the demo date and time.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Location Required', 'Please specify the visit location / shop address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/demos', {
        customer_id: selectedCustomerId,
        salesperson_id: user?.id,
        demo_date: demoDate.trim(),
        demo_time: demoTime.trim(),
        location: location.trim(),
        notes: notes.trim() || undefined,
        status: 'scheduled',
      });

      Alert.alert('Demo Scheduled', 'Demo visit successfully added to your calendar!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Scheduling Error', err.message || 'Could not schedule demo');
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
          <Text style={styles.sectionHeader}>Select Target Customer</Text>

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
              <Text style={styles.promptText}>Choose customer from recent list:</Text>
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

          <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Schedule Details</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Date (YYYY-MM-DD)"
                placeholder="2026-10-05"
                value={demoDate}
                onChangeText={setDemoDate}
                leftIcon={<Calendar size={18} color={THEME.colors.textMuted} />}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Time"
                placeholder="11:30 AM"
                value={demoTime}
                onChangeText={setDemoTime}
                leftIcon={<Clock size={18} color={THEME.colors.textMuted} />}
              />
            </View>
          </View>

          <Input
            label="Demo Location / Address *"
            placeholder="e.g. Shop #12, Galaxy Commercial Center, CG Road"
            value={location}
            onChangeText={setLocation}
            leftIcon={<MapPin size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Agenda & Demo Notes"
            placeholder="e.g. Focus on POS billing, inventory sync, and multi-counter setup..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ height: 75 }}
          />

          <Button
            title="Schedule Demo Visit"
            onPress={handleSchedule}
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
  row: {
    flexDirection: 'row',
  },
});
