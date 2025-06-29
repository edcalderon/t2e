import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Shield, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

export default function TermsOfService() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/');
    }
  };

  // Prevent text selection and copying
  const preventCopy = (e: any) => {
    e.preventDefault();
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Legal Notice */}
      <View style={styles.legalNotice}>
        <Shield size={20} color={theme.colors.warning} />
        <Text style={styles.legalNoticeText}>
          This document is legally binding and protected by copyright law
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onStartShouldSetResponder={preventCopy}
        onMoveShouldSetResponder={preventCopy}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>
            Last Updated: {new Date().toLocaleDateString()}
          </Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using XQuests ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            XQuests is a social media engagement platform that allows users to participate in challenges, earn cryptocurrency rewards, and connect their social media accounts including X (formerly Twitter) for authentication and engagement tracking.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts and Authentication</Text>
          <Text style={styles.paragraph}>
            To use our Service, you must create an account by connecting your X (Twitter) account through OAuth 2.0 authentication. By connecting your social media accounts, you grant us permission to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your public profile information</Text>
          <Text style={styles.bulletPoint}>• Read your tweets and engagement metrics</Text>
          <Text style={styles.bulletPoint}>• Verify your identity for reward distribution</Text>
          <Text style={styles.bulletPoint}>• Track challenge completion and engagement</Text>

          <Text style={styles.sectionTitle}>4. Cryptocurrency and Rewards</Text>
          <Text style={styles.paragraph}>
            XQuests distributes ALGO cryptocurrency rewards for completed challenges. By participating, you acknowledge that:
          </Text>
          <Text style={styles.bulletPoint}>• Cryptocurrency values are volatile and may fluctuate</Text>
          <Text style={styles.bulletPoint}>• Rewards are distributed based on verified engagement metrics</Text>
          <Text style={styles.bulletPoint}>• You are responsible for any tax implications of received rewards</Text>
          <Text style={styles.bulletPoint}>• Wallet connection is required for reward distribution</Text>

          <Text style={styles.sectionTitle}>5. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to use the Service to:
          </Text>
          <Text style={styles.bulletPoint}>• Engage in fraudulent or manipulative activities</Text>
          <Text style={styles.bulletPoint}>• Create fake engagement or use bots</Text>
          <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Harass, abuse, or harm other users</Text>
          <Text style={styles.bulletPoint}>• Share inappropriate or offensive content</Text>

          <Text style={styles.sectionTitle}>6. Privacy and Data Protection</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.
          </Text>

          <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our Service integrates with third-party platforms including X (Twitter), Algorand blockchain, and wallet providers. We are not responsible for the availability, content, or practices of these third-party services.
          </Text>

          <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The Service and its original content, features, and functionality are and will remain the exclusive property of XQuests and its licensors. The Service is protected by copyright, trademark, and other laws.
          </Text>

          <Text style={styles.sectionTitle}>9. Disclaimers and Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. XQuests makes no representations or warranties of any kind, express or implied, as to the operation of the Service or the information, content, or materials included therein.
          </Text>

          <Text style={styles.sectionTitle}>10. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including without limitation if you breach the Terms.
          </Text>

          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
          </Text>

          <Text style={styles.sectionTitle}>12. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at legal@xquests.site
          </Text>

          <View style={styles.footer}>
            <Lock size={16} color={theme.colors.textTertiary} />
            <Text style={styles.footerText}>
              © 2024 XQuests. All rights reserved. This document is protected by copyright law.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  headerSpacer: {
    width: 32,
  },
  legalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '10',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.warning + '30',
    gap: 8,
  },
  legalNoticeText: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: '600',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
    marginLeft: 16,
    textAlign: 'justify',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    flex: 1,
  },
});