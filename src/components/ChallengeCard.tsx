import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Clock,
  Award,
  MessageCircle,
  Repeat,
  Heart,
} from "lucide-react-native";
import { useTheme } from '../../contexts/ThemeContext';

interface ChallengeCardProps {
  title?: string;
  theme?: string;
  reward?: number;
  timeRemaining?: string;
  requiredLikes?: number;
  requiredRetweets?: number;
  requiredReplies?: number;
  onSelect?: () => void;
}

const ChallengeCard = ({
  title = "Weekly Crypto Insights",
  theme: challengeTheme = "Blockchain Technology",
  reward = 50,
  timeRemaining = "2 days 4 hours",
  requiredLikes = 25,
  requiredRetweets = 10,
  requiredReplies = 5,
  onSelect = () => console.log("Challenge selected"),
}: ChallengeCardProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Challenge Header */}
      <View style={styles.header}>
        <View style={styles.themeBadge}>
          <Text style={styles.themeText}>{challengeTheme}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={14} color={theme.colors.textSecondary} />
          <Text style={styles.timeText}>{timeRemaining}</Text>
        </View>
      </View>

      {/* Challenge Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Reward */}
      <View style={styles.rewardContainer}>
        <Award size={16} color={theme.colors.warning} />
        <Text style={styles.rewardText}>
          {reward} ALGO
        </Text>
      </View>

      {/* Required Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Heart size={14} color={theme.colors.error} />
          <Text style={styles.metricText}>
            {requiredLikes} likes
          </Text>
        </View>
        <View style={styles.metric}>
          <Repeat size={14} color={theme.colors.success} />
          <Text style={styles.metricText}>
            {requiredRetweets} retweets
          </Text>
        </View>
        <View style={styles.metric}>
          <MessageCircle size={14} color={theme.colors.primary} />
          <Text style={styles.metricText}>
            {requiredReplies} replies
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onSelect}
      >
        <Text style={styles.actionButtonText}>Select Challenge</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  rewardText: {
    color: theme.colors.warning,
    fontWeight: '700',
    fontSize: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ChallengeCard;