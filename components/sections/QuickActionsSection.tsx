import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Award } from 'lucide-react-native';

interface QuickActionsSectionProps {
  theme: any;
  onNewTweet: () => void;
  onBrowseChallenges: () => void;
}

export default function QuickActionsSection({ theme, onNewTweet, onBrowseChallenges }: QuickActionsSectionProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={onNewTweet}
        >
          <Plus size={20} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>New Tweet</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={onBrowseChallenges}
        >
          <Award size={20} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Browse Challenges</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});