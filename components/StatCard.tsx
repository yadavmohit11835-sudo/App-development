import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  subtext?: string;
  trend?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBgColor = THEME.colors.primaryLight,
  subtext,
  trend,
  onPress,
}) => {
  const content = (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        {trend && (
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {subtext && (
          <Text style={styles.subtext} numberOfLines={1}>
            {subtext}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={0.7}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.touchable}>{content}</View>;
};

const styles = StyleSheet.create({
  touchable: {
    width: '48%',
    marginVertical: 6,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 125,
    justifyContent: 'space-between',
    ...THEME.shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: THEME.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    backgroundColor: THEME.colors.successLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: THEME.radii.full,
  },
  trendText: {
    color: THEME.colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  bottomSection: {
    marginTop: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  subtext: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
});

export default StatCard;
