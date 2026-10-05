export const THEME = {
  colors: {
    // Brand Primary Palette (KeyPrime Navy & Royal Blues)
    primary: '#0B2545',
    primaryDark: '#07162C',
    primaryLight: '#133E87',
    royalBlue: '#1D4ED8',
    royalBlueLight: '#3B82F6',
    
    // Brand Accent (KeyPrime Red swoosh and arrow)
    accentRed: '#DC2626',
    accentRedLight: '#FEE2E2',
    
    // Status colors
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    info: '#0284C7',
    infoLight: '#E0F2FE',

    // Neutrals
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    surfaceHover: '#E2E8F0',
    border: '#E2E8F0',
    borderFocus: '#1D4ED8',
    
    // Text
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    textAccent: '#DC2626',

    // Tab bar
    tabBarActive: '#0B2545',
    tabBarInactive: '#94A3B8',
    tabBarBg: '#FFFFFF',
  },
  typography: {
    fontFamilies: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
      hero: 34,
    }
  },
  radii: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#0B2545',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    hover: {
      shadowColor: '#0B2545',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    floating: {
      shadowColor: '#0B2545',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    }
  }
};
