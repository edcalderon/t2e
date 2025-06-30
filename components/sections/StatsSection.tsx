import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, Trophy, Sparkles } from 'lucide-react-native';

interface StatsSectionProps {
  theme: any;
  isAuthenticated: boolean;
  stats: {
    totalEarned: string;
    thisWeek: string;
    rank: string;
    streak: string;
    walletBalance: string;
  };
  onStatsPress: () => void;
}

export default function StatsSection({ theme, isAuthenticated, stats, onStatsPress }: StatsSectionProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={onStatsPress}
        >
          <TrendingUp size={20} color={theme.colors.success} />
          <Text style={styles.statValue}>{stats.totalEarned}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
          <Text style={styles.statChange}>{stats.thisWeek} this week</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={onStatsPress}
        >
          <Trophy size={20} color={theme.colors.warning} />
          <Text style={styles.statValue}>{stats.rank}</Text>
          <Text style={styles.statLabel}>Global Rank</Text>
          <Text style={styles.statChange}>{stats.streak} streak</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statChange: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: 2,
  },
});