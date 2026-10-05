import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Store, User, Phone, Mail, MapPin, Building, FileText, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../services/api';
import { useAuth } from '../../services/authContext';

export default function AddCustomerScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!shopName.trim()) errs.shopName = 'Business or Shop name is required';
    if (!ownerName.trim()) errs.ownerName = 'Contact person / Owner name is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.trim().length < 10) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!address.trim()) errs.address = 'Street address is required';
    if (!city.trim()) errs.city = 'City is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/customers', {
        shop_name: shopName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim() || undefined,
        notes: notes.trim() || undefined,
        assigned_salesperson_id: user?.id,
      });

      Alert.alert('Success', 'Customer successfully registered!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not register customer');
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
          <Text style={styles.sectionHeader}>Business Information</Text>

          <Input
            label="Shop / Business Name *"
            placeholder="e.g. Apex Electronics"
            value={shopName}
            onChangeText={setShopName}
            error={errors.shopName}
            leftIcon={<Store size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Owner / Contact Person *"
            placeholder="e.g. Rajesh Kumar"
            value={ownerName}
            onChangeText={setOwnerName}
            error={errors.ownerName}
            leftIcon={<User size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Mobile Phone *"
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon={<Phone size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Email Address (Optional)"
            placeholder="e.g. rajesh@apex.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={THEME.colors.textMuted} />}
          />

          <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Location Details</Text>

          <Input
            label="Address *"
            placeholder="Shop No., Market, Road"
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            leftIcon={<MapPin size={18} color={THEME.colors.textMuted} />}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="City *"
                placeholder="Ahmedabad"
                value={city}
                onChangeText={setCity}
                error={errors.city}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="State"
                placeholder="Gujarat"
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>

          <Input
            label="Pincode"
            placeholder="380001"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
          />

          <Input
            label="Notes & Requirements"
            placeholder="Any specific software requirements or follow-up details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ height: 70 }}
          />

          <Button
            title="Save Customer"
            onPress={handleSave}
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
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
});
