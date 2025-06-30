import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trophy, Users, Award } from 'lucide-react-native';

interface ActivitySectionProps {
  theme: any;
  isAuthenticated: boolean;
  onSetupPress: () => void;
}

export default function ActivitySection({ theme, isAuthenticated, onSetupPress }: ActivitySectionProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      
      {isAuthenticated ? (
        <>
          <TouchableOpacity style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <Trophy size={16} color={theme.colors.warning} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                You earned <Text style={styles.highlight}>25 ALGO</Text> from the Tech Innovation challenge
              </Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Users size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                You moved up to <Text style={styles.highlight}>rank #47</Text> on the global leaderboard
              </Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: theme.colors.success + '20' }]}>
              <Award size={16} color={theme.colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                New achievement unlocked: <Text style={styles.highlight}>Tweet Master</Text>
              </Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity 
          style={styles.emptyActivityState}
          onPress={onSetupPress}
        >
          <Text style={styles.emptyActivityText}>
            Connect your account to see your activity
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  highlight: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyActivityState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});