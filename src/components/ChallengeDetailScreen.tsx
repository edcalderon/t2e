import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { ArrowLeft, Send, Heart, MessageCircle, Repeat, Award, CreditCard as Edit3 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";

interface ChallengeDetailScreenProps {
  challenge?: {
    id: string;
    title: string;
    description: string;
    theme: string;
    reward: number;
    requiredLikes: number;
    requiredRetweets: number;
    requiredReplies: number;
    timeRemaining: string;
    tweetTemplate: string;
  };
  onClose?: () => void;
  onPost?: (tweetContent: string) => void;
}

const ChallengeDetailScreen = ({
  challenge = {
    id: "challenge-1",
    title: "Crypto Education Challenge",
    description: "Share your knowledge about Algorand with your followers",
    theme: "Blockchain Education",
    reward: 25,
    requiredLikes: 15,
    requiredRetweets: 5,
    requiredReplies: 3,
    timeRemaining: "23 hours",
    tweetTemplate:
      "Did you know that #Algorand can process over 1000 transactions per second? It's one of the fastest and most environmentally friendly blockchains out there! #Crypto #Blockchain",
  },
  onClose = () => {},
  onPost = () => {},
}: ChallengeDetailScreenProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [tweetContent, setTweetContent] = useState(challenge.tweetTemplate);
  const [isPosting, setIsPosting] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [currentEngagement, setCurrentEngagement] = useState({
    likes: 0,
    retweets: 0,
    replies: 0,
  });
  const router = useRouter();

  const handlePost = () => {
    setIsPosting(true);
    // Simulate posting delay
    setTimeout(() => {
      onPost(tweetContent);
      setIsPosting(false);
      setIsPosted(true);
      // Simulate engagement metrics coming in
      simulateEngagement();
    }, 1500);
  };

  const simulateEngagement = () => {
    // Simulate engagement metrics updating over time
    const interval = setInterval(() => {
      setCurrentEngagement((prev) => {
        const newLikes = Math.min(
          prev.likes + Math.floor(Math.random() * 3),
          challenge.requiredLikes,
        );
        const newRetweets = Math.min(
          prev.retweets + Math.floor(Math.random() * 2),
          challenge.requiredRetweets,
        );
        const newReplies = Math.min(
          prev.replies + Math.floor(Math.random() * 1),
          challenge.requiredReplies,
        );

        const isComplete =
          newLikes >= challenge.requiredLikes &&
          newRetweets >= challenge.requiredRetweets &&
          newReplies >= challenge.requiredReplies;

        if (isComplete) {
          clearInterval(interval);
        }

        return {
          likes: newLikes,
          retweets: newRetweets,
          replies: newReplies,
        };
      });
    }, 3000);
  };

  const isRewardEarned =
    currentEngagement.likes >= challenge.requiredLikes &&
    currentEngagement.retweets >= challenge.requiredRetweets &&
    currentEngagement.replies >= challenge.requiredReplies;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Challenge Info */}
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>

          <View style={styles.challengeMeta}>
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>{challenge.theme}</Text>
            </View>
            <View style={styles.rewardContainer}>
              <Award size={16} color="#FFD700" />
              <Text style={styles.rewardText}>{challenge.reward} ALGO</Text>
            </View>
          </View>

          <Text style={styles.timeRemaining}>
            Time remaining: {challenge.timeRemaining}
          </Text>
        </View>

        {/* Tweet Composer */}
        <View style={styles.tweetComposer}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=user123" }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Your Twitter Handle</Text>
              <Text style={styles.userHandle}>@yourusername</Text>
            </View>
            <View style={styles.editButton}>
              <Edit3 size={16} color="#3B82F6" />
              <Text style={styles.editText}>Edit</Text>
            </View>
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              multiline
              value={tweetContent}
              onChangeText={setTweetContent}
              style={styles.textInput}
              placeholder="What's happening?"
              editable={!isPosted}
            />
          </View>

          <View style={styles.tweetFooter}>
            <Text style={styles.characterCount}>
              {280 - tweetContent.length} characters left
            </Text>
            {!isPosted ? (
              <TouchableOpacity
                onPress={handlePost}
                disabled={isPosting}
                style={[
                  styles.postButton,
                  isPosting ? styles.postButtonDisabled : styles.postButtonActive
                ]}
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Send size={16} color="#fff" />
                    <Text style={styles.postButtonText}>
                      Post Tweet
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.postedButton}>
                <Text style={styles.postedButtonText}>Posted</Text>
              </View>
            )}
          </View>
        </View>

        {/* Engagement Metrics */}
        {isPosted && (
          <View style={styles.engagementMetrics}>
            <Text style={styles.metricsTitle}>Engagement Metrics</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Heart size={16} color="#F43F5E" />
                  <Text style={styles.metricValue}>
                    {currentEngagement.likes}/{challenge.requiredLikes}
                  </Text>
                </View>
                <Text style={styles.metricLabel}>Likes</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFillRed,
                      {
                        width: `${(currentEngagement.likes / challenge.requiredLikes) * 100}%`,
                      }
                    ]}
                  />
                </View>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Repeat size={16} color="#10B981" />
                  <Text style={styles.metricValue}>
                    {currentEngagement.retweets}/{challenge.requiredRetweets}
                  </Text>
                </View>
                <Text style={styles.metricLabel}>Retweets</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFillGreen,
                      {
                        width: `${(currentEngagement.retweets / challenge.requiredRetweets) * 100}%`,
                      }
                    ]}
                  />
                </View>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <MessageCircle size={16} color="#3B82F6" />
                  <Text style={styles.metricValue}>
                    {currentEngagement.replies}/{challenge.requiredReplies}
                  </Text>
                </View>
                <Text style={styles.metricLabel}>Replies</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFillBlue,
                      {
                        width: `${(currentEngagement.replies / challenge.requiredReplies) * 100}%`,
                      }
                    ]}
                  />
                </View>
              </View>
            </View>

            {isRewardEarned ? (
              <View style={styles.rewardEarned}>
                <Text style={styles.rewardEarnedTitle}>
                  Congratulations! You've earned {challenge.reward} ALGO
                </Text>
                <Text style={styles.rewardEarnedSubtitle}>
                  Tokens have been transferred to your wallet
                </Text>
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => router.push("/")}
                >
                  <Text style={styles.returnButtonText}>
                    Return to Dashboard
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.trackingStatus}>
                <Text style={styles.trackingTitle}>
                  Tracking engagement metrics in real-time
                </Text>
                <Text style={styles.trackingSubtitle}>
                  You'll earn rewards once all targets are met
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>
            Tips for Better Engagement
          </Text>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Add relevant hashtags to increase visibility</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Post during peak hours (9am-11am, 1pm-3pm)</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Include a question to encourage replies</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Add an image or GIF to increase engagement</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  challengeInfo: {
    padding: 16,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    margin: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  challengeDescription: {
    color: '#6b7280',
    marginTop: 4,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  themeTag: {
    backgroundColor: '#bfdbfe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  themeText: {
    color: '#1e40af',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  rewardText: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  timeRemaining: {
    color: '#6b7280',
    marginTop: 8,
  },
  tweetComposer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    marginLeft: 8,
  },
  userName: {
    fontWeight: 'bold',
  },
  userHandle: {
    color: '#6b7280',
  },
  editButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    color: '#3b82f6',
    marginLeft: 4,
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
  },
  textInput: {
    fontSize: 16,
    textAlignVertical: 'top',
  },
  tweetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  characterCount: {
    color: '#6b7280',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postButtonActive: {
    backgroundColor: '#3b82f6',
  },
  postButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  postedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#10b981',
    borderRadius: 16,
  },
  postedButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  engagementMetrics: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricsTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    width: 80,
    marginTop: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillRed: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 2,
  },
  progressFillGreen: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  progressFillBlue: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  rewardEarned: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  rewardEarnedTitle: {
    color: '#166534',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rewardEarnedSubtitle: {
    color: '#16a34a',
    textAlign: 'center',
    marginTop: 4,
  },
  returnButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 12,
    alignSelf: 'center',
  },
  returnButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  trackingStatus: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  trackingTitle: {
    color: '#1e40af',
    textAlign: 'center',
  },
  trackingSubtitle: {
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 4,
  },
  tipsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipsTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginRight: 8,
  },
  tipText: {
    flex: 1,
  },
});

export default ChallengeDetailScreen;