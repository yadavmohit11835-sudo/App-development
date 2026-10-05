import React, { useState } from 'react';
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
import { Mail, ArrowLeft, Info, Send } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import KeyPrimeLogo from '../../components/KeyPrimeLogo';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid registered email address.',
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setStatusMessage({
        type: 'success',
        text: res.data?.message || 'Password reset instructions have been sent.',
      });
    } catch (err: any) {
      // In development or when email gateway is not configured:
      setStatusMessage({
        type: 'warning',
        text:
          err.message ||
          'Email service gateway is currently pending configuration. Please contact your KeyPrime System Administrator for credential assistance.',
      });
    } finally {
      setLoading(false);
    }
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
        <Button
          title="Back to Sign In"
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={18} color={THEME.colors.primary} />}
          style={styles.backBtn}
        />

        <View style={styles.brandContainer}>
          <KeyPrimeLogo size="large" width={220} />
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address to receive password recovery instructions.
          </Text>

          {statusMessage && (
            <View
              style={[
                styles.banner,
                statusMessage.type === 'success' && styles.bannerSuccess,
                statusMessage.type === 'warning' && styles.bannerWarning,
                statusMessage.type === 'error' && styles.bannerError,
              ]}
            >
              <Info
                size={18}
                color={
                  statusMessage.type === 'success'
                    ? THEME.colors.success
                    : statusMessage.type === 'warning'
                    ? THEME.colors.warning
                    : THEME.colors.danger
                }
              />
              <Text
                style={[
                  styles.bannerText,
                  statusMessage.type === 'success' && { color: THEME.colors.success },
                  statusMessage.type === 'warning' && { color: THEME.colors.warning },
                  statusMessage.type === 'error' && { color: THEME.colors.danger },
                ]}
              >
                {statusMessage.text}
              </Text>
            </View>
          )}

          <Input
            label="Registered Email"
            placeholder="you@keyprime.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={THEME.colors.textMuted} />}
          />

          <Button
            title="Request Reset Link"
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            size="lg"
            icon={<Send size={18} color="#FFFFFF" />}
            iconPosition="right"
            style={styles.submitBtn}
          />

          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>Note on Email Configuration:</Text>
            <Text style={styles.noticeText}>
              In offline or staging environments where SMTP/Email delivery is not connected,
              administrators can reset user credentials directly from the Admin Portal.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.card,
  },
  title: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: THEME.radii.md,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 4,
  },
  bannerSuccess: {
    backgroundColor: THEME.colors.successLight,
    borderLeftColor: THEME.colors.success,
  },
  bannerWarning: {
    backgroundColor: THEME.colors.warningLight,
    borderLeftColor: THEME.colors.warning,
  },
  bannerError: {
    backgroundColor: THEME.colors.dangerLight,
    borderLeftColor: THEME.colors.danger,
  },
  bannerText: {
    flex: 1,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  noticeBox: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
});
