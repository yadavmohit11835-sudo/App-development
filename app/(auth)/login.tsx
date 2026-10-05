import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Server,
  Settings,
  Check,
  X,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import KeyPrimeLogo from '../../components/KeyPrimeLogo';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../services/authContext';
import api, { API_BASE_URL, updateServerUrl } from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Server IP config modal state
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(api.defaults.baseURL || API_BASE_URL);
  const [serverStatus, setServerStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [activeServerUrl, setActiveServerUrl] = useState(api.defaults.baseURL || API_BASE_URL);

  useEffect(() => {
    setActiveServerUrl(api.defaults.baseURL || API_BASE_URL);
    setServerUrlInput(api.defaults.baseURL || API_BASE_URL);
  }, []);

  const testServerConnection = async (urlToTest: string) => {
    setServerStatus('checking');
    try {
      let url = urlToTest.trim();
      if (!url.endsWith('/api')) url = url.replace(/\/+$/, '') + '/api';
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'http://' + url;
      const res = await fetch(`${url}/health`);
      if (res.ok) {
        setServerStatus('connected');
      } else {
        setServerStatus('error');
      }
    } catch (e) {
      setServerStatus('error');
    }
  };

  const handleSaveServerUrl = async () => {
    try {
      const saved = await updateServerUrl(serverUrlInput);
      setActiveServerUrl(saved);
      setServerModalVisible(false);
      Alert.alert('Server Updated', `API endpoint set to:\n${saved}`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const validate = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email or username is required');
      isValid = false;
    } else if (!trimmedEmail.includes('@') && trimmedEmail.length < 3) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'sales') => {
    if (role === 'admin') {
      setEmail('admin@keyprime.com');
      setPassword('Admin@123');
    } else {
      setEmail('sales@keyprime.com');
      setPassword('Sales@123');
    }
    setEmailError('');
    setPasswordError('');
    setErrorMessage(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Logo & Branding Section */}
        <View style={styles.brandContainer}>
          <KeyPrimeLogo size="hero" width={260} />
          <Text style={styles.businessSubtitle}>BUSINESS SOLUTIONS</Text>
        </View>

        {/* Card Form */}
        <View style={styles.cardContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to access your sales dashboard and client records
          </Text>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={THEME.colors.danger} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          <Input
            label="Email or Username"
            placeholder="e.g. admin@keyprime.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            leftIcon={<Mail size={20} color={THEME.colors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            isPassword
            error={passwordError}
            leftIcon={<Lock size={20} color={THEME.colors.textMuted} />}
          />

          <View style={styles.forgotRow}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="lg"
            icon={<ArrowRight size={20} color="#FFFFFF" />}
            iconPosition="right"
            style={styles.loginButton}
          />

          {/* Quick Demo Credentials */}
          <View style={styles.quickFillSection}>
            <Text style={styles.quickFillHeading}>DEMO ACCOUNTS (ONE-TAP):</Text>
            <View style={styles.quickFillRow}>
              <TouchableOpacity
                style={styles.quickFillBtn}
                onPress={() => fillCredentials('admin')}
              >
                <ShieldCheck size={14} color={THEME.colors.royalBlue} />
                <Text style={styles.quickFillText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickFillBtn}
                onPress={() => fillCredentials('sales')}
              >
                <ShieldCheck size={14} color={THEME.colors.success} />
                <Text style={styles.quickFillText}>Sales Rep</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Server Connection Bar */}
        <TouchableOpacity
          style={styles.serverBar}
          onPress={() => {
            setServerUrlInput(api.defaults.baseURL || activeServerUrl);
            setServerStatus('idle');
            setServerModalVisible(true);
          }}
        >
          <Server size={14} color={THEME.colors.textMuted} />
          <Text style={styles.serverBarText} numberOfLines={1}>
            Server: {activeServerUrl}
          </Text>
          <Settings size={14} color={THEME.colors.royalBlue} />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            KeyPrime Sales Management System • v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Server IP Config Modal */}
      <Modal visible={serverModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backend Server Configuration</Text>
              <TouchableOpacity onPress={() => setServerModalVisible(false)}>
                <X size={20} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Enter your PC's IP address if testing on a physical phone via Wi-Fi:
            </Text>

            <Input
              label="API Endpoint URL"
              value={serverUrlInput}
              onChangeText={setServerUrlInput}
              placeholder="http://192.168.29.240:5000/api"
              autoCapitalize="none"
            />

            <View style={styles.testRow}>
              <TouchableOpacity
                style={styles.testBtn}
                onPress={() => testServerConnection(serverUrlInput)}
              >
                <Text style={styles.testBtnText}>
                  {serverStatus === 'checking' ? 'Testing...' : 'Test Connection'}
                </Text>
              </TouchableOpacity>

              {serverStatus === 'connected' && (
                <View style={styles.statusBadgeSuccess}>
                  <Check size={14} color={THEME.colors.success} />
                  <Text style={styles.statusSuccessText}>Connected</Text>
                </View>
              )}

              {serverStatus === 'error' && (
                <View style={styles.statusBadgeError}>
                  <AlertCircle size={14} color={THEME.colors.danger} />
                  <Text style={styles.statusErrorText}>Cannot Reach</Text>
                </View>
              )}
            </View>

            <Button
              title="Save & Use Server"
              onPress={handleSaveServerUrl}
              variant="primary"
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  businessSubtitle: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  cardContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.card,
  },
  welcomeTitle: {
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.dangerLight,
    padding: 12,
    borderRadius: THEME.radii.md,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.danger,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.danger,
    fontWeight: '600',
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
    color: THEME.colors.royalBlue,
  },
  loginButton: {
    marginBottom: 16,
    backgroundColor: THEME.colors.primary,
  },
  quickFillSection: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    alignItems: 'center',
  },
  quickFillHeading: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginBottom: 8,
  },
  quickFillRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.md,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 6,
  },
  quickFillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  serverBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 16,
    gap: 8,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  serverBarText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.xl,
    padding: 20,
    ...THEME.shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  modalDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  testBtn: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.sm,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.royalBlue,
  },
  statusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusSuccessText: {
    fontSize: 12,
    color: THEME.colors.success,
    fontWeight: '700',
  },
  statusBadgeError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusErrorText: {
    fontSize: 12,
    color: THEME.colors.danger,
    fontWeight: '700',
  },
});
