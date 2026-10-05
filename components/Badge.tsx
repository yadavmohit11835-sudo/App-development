import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: THEME.colors.successLight, text: THEME.colors.success };
      case 'warning':
        return { bg: THEME.colors.warningLight, text: THEME.colors.warning };
      case 'danger':
        return { bg: THEME.colors.dangerLight, text: THEME.colors.danger };
      case 'info':
        return { bg: THEME.colors.infoLight, text: THEME.colors.info };
      case 'primary':
        return { bg: '#E0E7FF', text: THEME.colors.royalBlue };
      case 'neutral':
      default:
        return { bg: THEME.colors.surfaceSubtle, text: THEME.colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          size === 'sm' ? styles.textSm : styles.textMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: THEME.radii.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeMd: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 11,
  },
});

export default Badge;
