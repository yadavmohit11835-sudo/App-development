import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  onPress: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  iconBgColor = THEME.colors.primaryLight,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '23%',
    alignItems: 'center',
    marginVertical: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: THEME.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...THEME.shadows.card,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default QuickActionButton;
