import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, User as UserIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../constants/theme';
import KeyPrimeLogo from './KeyPrimeLogo';
import { useAuth } from '../services/authContext';

interface DashboardHeaderProps {
  unreadNotificationsCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  unreadNotificationsCount = 0,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <KeyPrimeLogo size="small" width={130} style={styles.logo} />
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color={THEME.colors.primary} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.avatarButton]}
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Profile"
          >
            <UserIcon size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greetingSubtext}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'Sales Representative'}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'admin' ? 'ADMINISTRATOR' : 'SALES TEAM'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: THEME.colors.surface,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    alignItems: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarButton: {
    backgroundColor: THEME.colors.primary,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: THEME.colors.accentRed,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  greetingSection: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingSubtext: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 1,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  roleText: {
    color: THEME.colors.royalBlue,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default DashboardHeader;
