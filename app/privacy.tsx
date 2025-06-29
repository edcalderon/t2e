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
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

export default function PrivacyPolicy() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Eye size={20} color={theme.colors.primary} />
        <Text style={styles.privacyNoticeText}>
          Your privacy is protected. This document explains how we handle your data.
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

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          
          <Text style={styles.subsectionTitle}>1.1 Information from Social Media Authentication</Text>
          <Text style={styles.paragraph}>
            When you connect your X (Twitter) account through OAuth 2.0, we collect:
          </Text>
          <Text style={styles.bulletPoint}>• Public profile information (username, display name, profile picture)</Text>
          <Text style={styles.bulletPoint}>• Account verification status</Text>
          <Text style={styles.bulletPoint}>• Follower count and public metrics</Text>
          <Text style={styles.bulletPoint}>• Tweet content and engagement data for challenge verification</Text>

          <Text style={styles.subsectionTitle}>1.2 Wallet and Cryptocurrency Information</Text>
          <Text style={styles.paragraph}>
            For reward distribution, we collect:
          </Text>
          <Text style={styles.bulletPoint}>• Algorand wallet addresses</Text>
          <Text style={styles.bulletPoint}>• Transaction history related to our platform</Text>
          <Text style={styles.bulletPoint}>• Reward distribution records</Text>

          <Text style={styles.subsectionTitle}>1.3 Usage and Analytics Data</Text>
          <Text style={styles.paragraph}>
            We automatically collect:
          </Text>
          <Text style={styles.bulletPoint}>• Device information and operating system</Text>
          <Text style={styles.bulletPoint}>• App usage patterns and feature interactions</Text>
          <Text style={styles.bulletPoint}>• Challenge participation and completion data</Text>
          <Text style={styles.bulletPoint}>• Error logs and performance metrics</Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the collected information to:
          </Text>
          <Text style={styles.bulletPoint}>• Verify your identity and prevent fraud</Text>
          <Text style={styles.bulletPoint}>• Track challenge completion and distribute rewards</Text>
          <Text style={styles.bulletPoint}>• Personalize your experience and recommend relevant challenges</Text>
          <Text style={styles.bulletPoint}>• Improve our services and develop new features</Text>
          <Text style={styles.bulletPoint}>• Communicate with you about your account and platform updates</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations and enforce our terms</Text>

          <Text style={styles.sectionTitle}>3. Information Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With your explicit consent</Text>
          <Text style={styles.bulletPoint}>• To comply with legal obligations or court orders</Text>
          <Text style={styles.bulletPoint}>• To protect our rights, property, or safety</Text>
          <Text style={styles.bulletPoint}>• With service providers who assist in platform operations</Text>
          <Text style={styles.bulletPoint}>• In connection with a business transfer or acquisition</Text>

          <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our platform integrates with third-party services:
          </Text>
          <Text style={styles.bulletPoint}>• X (Twitter) API for authentication and engagement tracking</Text>
          <Text style={styles.bulletPoint}>• Algorand blockchain for cryptocurrency transactions</Text>
          <Text style={styles.bulletPoint}>• Wallet providers for secure cryptocurrency storage</Text>
          <Text style={styles.bulletPoint}>• Analytics services for platform improvement</Text>

          <Text style={styles.paragraph}>
            These services have their own privacy policies, and we encourage you to review them.
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your information:
          </Text>
          <Text style={styles.bulletPoint}>• Encryption of data in transit and at rest</Text>
          <Text style={styles.bulletPoint}>• Secure OAuth 2.0 authentication protocols</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and vulnerability assessments</Text>
          <Text style={styles.bulletPoint}>• Limited access to personal data on a need-to-know basis</Text>
          <Text style={styles.bulletPoint}>• Secure data centers with physical and digital protections</Text>

          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your information for as long as necessary to provide our services and comply with legal obligations:
          </Text>
          <Text style={styles.bulletPoint}>• Account information: Until account deletion</Text>
          <Text style={styles.bulletPoint}>• Transaction records: 7 years for tax and legal compliance</Text>
          <Text style={styles.bulletPoint}>• Analytics data: 2 years for service improvement</Text>
          <Text style={styles.bulletPoint}>• Support communications: 3 years</Text>

          <Text style={styles.sectionTitle}>7. Your Rights and Choices</Text>
          <Text style={styles.paragraph}>
            Depending on your location, you may have the following rights:
          </Text>
          <Text style={styles.bulletPoint}>• Access: Request a copy of your personal information</Text>
          <Text style={styles.bulletPoint}>• Correction: Update or correct inaccurate information</Text>
          <Text style={styles.bulletPoint}>• Deletion: Request deletion of your personal information</Text>
          <Text style={styles.bulletPoint}>• Portability: Receive your data in a machine-readable format</Text>
          <Text style={styles.bulletPoint}>• Objection: Object to certain processing of your information</Text>

          <Text style={styles.sectionTitle}>8. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.
          </Text>

          <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </Text>
          <Text style={styles.bulletPoint}>• Email: privacy@xquests.site</Text>
          <Text style={styles.bulletPoint}>• Data Protection Officer: dpo@xquests.site</Text>

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
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary + '30',
    gap: 8,
  },
  privacyNoticeText: {
    fontSize: 12,
    color: theme.colors.primary,
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 22,
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