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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Store, User, Phone, Mail, MapPin, Check } from 'lucide-react-native';
import { THEME } from '../../../constants/theme';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import LoadingScreen from '../../../components/LoadingScreen';
import api from '../../../services/api';

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/customers/${id}`)
      .then((res) => {
        const c = res.data;
        setShopName(c.shop_name || '');
        setOwnerName(c.owner_name || '');
        setPhone(c.phone || '');
        setEmail(c.email || '');
        setAddress(c.address || '');
        setCity(c.city || '');
        setState(c.state || '');
        setPincode(c.pincode || '');
        setStatus(c.status || 'lead');
        setNotes(c.notes || '');
      })
      .catch((err) => {
        Alert.alert('Error', err.message || 'Failed to load customer');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    if (!shopName.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Shop name and phone number are required.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/customers/${id}`, {
        shop_name: shopName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Saved', 'Customer details updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading customer data..." showLogo={false} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionHeader}>Edit Business Information</Text>

          <Input
            label="Shop / Business Name *"
            value={shopName}
            onChangeText={setShopName}
            leftIcon={<Store size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Owner / Contact Person *"
            value={ownerName}
            onChangeText={setOwnerName}
            leftIcon={<User size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={THEME.colors.textMuted} />}
          />

          <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Location Details</Text>

          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            leftIcon={<MapPin size={18} color={THEME.colors.textMuted} />}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="City" value={city} onChangeText={setCity} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="State" value={state} onChangeText={setState} />
            </View>
          </View>

          <Input
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ height: 70 }}
          />

          <Button
            title="Update Customer"
            onPress={handleUpdate}
            loading={saving}
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
