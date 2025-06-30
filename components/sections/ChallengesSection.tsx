import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ChallengeCard from '../../src/components/ChallengeCard';

interface Challenge {
  id: string;
  theme: string;
  reward: number;
  requiredLikes: number;
  requiredRetweets: number;
  timeRemaining: string;
  description: string;
}

interface ChallengesSectionProps {
  theme: any;
  challenges: Challenge[];
  onSelectChallenge: (challengeId: string) => void;
  onViewAll: () => void;
}

export default function ChallengesSection({ theme, challenges, onSelectChallenge, onViewAll }: ChallengesSectionProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Challenges</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.sectionLink}>View All</Text>
        </TouchableOpacity>
      </View>

      {challenges.slice(0, 2).map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          title={challenge.description}
          theme={challenge.theme}
          reward={challenge.reward}
          timeRemaining={challenge.timeRemaining}
          requiredLikes={challenge.requiredLikes}
          requiredRetweets={challenge.requiredRetweets}
          requiredReplies={5}
          onSelect={() => onSelectChallenge(challenge.id)}
        />
      ))}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});