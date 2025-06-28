import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

export default function AchievementsScreen({ onBack = () => {} }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const achievements: Achievement[] = [
    {
      id: "1",
      name: "Tweet Master",
      description: "Complete 10 tweet challenges",
      icon: "tweet-master",
      earned: true,
    },
    {
      id: "2",
      name: "Retweet Hero",
      description: "Get 100+ retweets on a single challenge",
      icon: "retweet-hero",
      earned: true,
    },
    {
      id: "3",
      name: "Top Gainer",
      description: "Earn 500+ ALGO from challenges",
      icon: "top-gainer",
      earned: false,
      progress: 320,
      total: 500,
    },
    {
      id: "4",
      name: "Meme Lord",
      description: "Complete 5 meme challenges",
      icon: "meme-lord",
      earned: false,
      progress: 3,
      total: 5,
    },
    {
      id: "5",
      name: "ALGO Airdrop Winner",
      description: "Win a special ALGO airdrop",
      icon: "algo-airdrop",
      earned: false,
    },
  ];

  const getIconForAchievement = (iconName: string) => {
    // In a real app, you would have individual icons for each achievement
    // For now, we'll use the badges image and just display it
    return require("../../assets/images/xquests-badges.png");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>

      {/* Achievements List */}
      <ScrollView style={styles.scrollView}>
        <Text style={styles.badgeCount}>
          {achievements.filter((a) => a.earned).length} of {achievements.length}{" "}
          Badges Earned
        </Text>

        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              achievement.earned ? styles.earnedCard : styles.unearnedCard
            ]}
          >
            <View style={styles.achievementRow}>
              <View
                style={[
                  styles.iconContainer,
                  achievement.earned ? styles.iconEarned : styles.iconUnearned
                ]}
              >
                <Image
                  source={getIconForAchievement(achievement.icon)}
                  style={styles.iconImage}
                  contentFit="contain"
                />
              </View>
              <View style={styles.achievementContent}>
                <View style={styles.achievementHeader}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  {achievement.earned && (
                    <View style={styles.earnedBadge}>
                      <Text style={styles.earnedText}>
                        Earned
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>

                {achievement.progress !== undefined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(achievement.progress / achievement.total!) * 100}%`,
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {achievement.progress} / {achievement.total}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors?.xqdark || '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  badgeCount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  earnedCard: {
    borderColor: theme.colors?.xqcyan || '#22d3ee',
  },
  unearnedCard: {
    borderColor: '#e5e7eb',
  },
  achievementRow: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEarned: {
    opacity: 1,
  },
  iconUnearned: {
    opacity: 0.4,
  },
  iconImage: {
    width: 60,
    height: 60,
  },
  achievementContent: {
    marginLeft: 16,
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  earnedBadge: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  earnedText: {
    color: theme.colors?.xqcyan || '#22d3ee',
    fontSize: 12,
    fontWeight: '500',
  },
  achievementDescription: {
    color: '#6b7280',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors?.xqcyan || '#22d3ee',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});