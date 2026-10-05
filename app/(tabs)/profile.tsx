import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Shield,
  LogOut,
  ChevronRight,
  BarChart3,
  Users2,
  Info,
  Server,
  Lock,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import KeyPrimeLogo from '../../components/KeyPrimeLogo';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useAuth } from '../../services/authContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of KeyPrime Sales?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Card */}
        <Card variant="elevated" style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user?.full_name || 'KeyPrime Member'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@keyprime.com'}</Text>
          <View style={styles.roleRow}>
            <Badge
              label={isAdmin ? 'ADMINISTRATOR' : 'SALES EXECUTIVE'}
              variant={isAdmin ? 'primary' : 'success'}
            />
          </View>
        </Card>

        {/* Administration Section (If Admin) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Controls</Text>
            <Card variant="elevated" style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/admin/users')}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
                    <Users2 size={20} color={THEME.colors.royalBlue} />
                  </View>
                  <View>
                    <Text style={styles.menuTitle}>Sales Team Management</Text>
                    <Text style={styles.menuDesc}>View and create salesperson accounts</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Sales Performance & Reporting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports & Insights</Text>
          <Card variant="elevated" style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/reports')}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                  <BarChart3 size={20} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Analytics & Sales Reports</Text>
                  <Text style={styles.menuDesc}>Daily, weekly, and monthly collection metrics</Text>
                </View>
              </View>
              <ChevronRight size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* App & System Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Info</Text>
          <Card variant="elevated" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Server size={16} color={THEME.colors.textMuted} />
              <Text style={styles.infoKey}>Database Status:</Text>
              <Text style={styles.infoVal}>MySQL 8.0 / Active</Text>
            </View>
            <View style={styles.infoRow}>
              <Shield size={16} color={THEME.colors.textMuted} />
              <Text style={styles.infoKey}>Security Mode:</Text>
              <Text style={styles.infoVal}>JWT + Role-Based Access</Text>
            </View>
            <View style={styles.infoRow}>
              <Info size={16} color={THEME.colors.textMuted} />
              <Text style={styles.infoKey}>Client Version:</Text>
              <Text style={styles.infoVal}>1.0.0 (Production Build)</Text>
            </View>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            icon={<LogOut size={18} color={THEME.colors.accentRed} />}
            textStyle={{ color: THEME.colors.accentRed }}
            style={{ borderColor: THEME.colors.accentRed }}
          />
        </View>

        {/* Small KeyPrime Logo Footer */}
        <View style={styles.footerBranding}>
          <KeyPrimeLogo size="small" width={110} />
          <Text style={styles.footerBrandingText}>KeyPrime Business Solutions</Text>
        </View>
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
  userCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  userEmail: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  roleRow: {
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: THEME.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  menuDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    padding: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoKey: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  footerBranding: {
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  footerBrandingText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
});
