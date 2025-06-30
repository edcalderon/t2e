import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Hash, RefreshCw, ChevronLeft, ChevronRight, Wifi, WifiOff, CheckCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { 
  fetchXQuestsTweets, 
  loadMoreXQuestsTweets, 
  refreshXQuestsTweets, 
  isTwitterApiAvailable,
  getTwitterApiStatus,
  type CommunityTweet,
  type TweetLoadResult
} from '../../lib/twitterApi';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Skeleton Tweet Component
const SkeletonTweet = ({ theme }: { theme: any }) => {
  const [shimmerAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = StyleSheet.create({
    skeletonCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      width: 280,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 12,
    },
    skeletonHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    skeletonAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.border,
      marginRight: 12,
    },
    skeletonUserInfo: {
      flex: 1,
    },
    skeletonName: {
      height: 14,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      width: '60%',
      marginBottom: 4,
    },
    skeletonUsername: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      width: '40%',
    },
    skeletonTimestamp: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      width: 30,
    },
    skeletonContent: {
      marginBottom: 12,
    },
    skeletonContentLine: {
      height: 14,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      marginBottom: 6,
    },
    skeletonTag: {
      height: 20,
      backgroundColor: theme.colors.border,
      borderRadius: 8,
      width: 80,
      marginBottom: 12,
    },
    skeletonEngagement: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    skeletonEngagementItem: {
      height: 14,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      width: 30,
    },
  });

  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <Animated.View style={[styles.skeletonAvatar, { opacity: shimmerOpacity }]} />
        <View style={styles.skeletonUserInfo}>
          <Animated.View style={[styles.skeletonName, { opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.skeletonUsername, { opacity: shimmerOpacity }]} />
        </View>
        <Animated.View style={[styles.skeletonTimestamp, { opacity: shimmerOpacity }]} />
      </View>
      
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonContentLine, { opacity: shimmerOpacity, width: '100%' }]} />
        <Animated.View style={[styles.skeletonContentLine, { opacity: shimmerOpacity, width: '80%' }]} />
        <Animated.View style={[styles.skeletonContentLine, { opacity: shimmerOpacity, width: '60%' }]} />
      </View>
      
      <Animated.View style={[styles.skeletonTag, { opacity: shimmerOpacity }]} />
      
      <View style={styles.skeletonEngagement}>
        <Animated.View style={[styles.skeletonEngagementItem, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.skeletonEngagementItem, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.skeletonEngagementItem, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.skeletonEngagementItem, { opacity: shimmerOpacity }]} />
      </View>
    </View>
  );
};

interface CommunityFeedSectionProps {
  theme: any;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function CommunityFeedSection({ theme, refreshing, onRefresh }: CommunityFeedSectionProps) {
  const [communityTweets, setCommunityTweets] = useState<CommunityTweet[]>([]);
  const [loadingMoreTweets, setLoadingMoreTweets] = useState(false);
  const [loadingInitialTweets, setLoadingInitialTweets] = useState(true);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [hasMoreTweets, setHasMoreTweets] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Load initial tweets on component mount
  useEffect(() => {
    loadInitialTweets();
  }, []);

  // Simulate real-time updates for engagement metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCommunityTweets(prevTweets => 
        prevTweets.map(tweet => ({
          ...tweet,
          likes: tweet.likes + Math.floor(Math.random() * 3),
          retweets: tweet.retweets + Math.floor(Math.random() * 2),
          replies: tweet.replies + Math.floor(Math.random() * 2),
        }))
      );
    }, 45000); // Update every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const loadInitialTweets = async () => {
    setLoadingInitialTweets(true);
    setApiError(null);
    
    try {
      console.log('🔄 Loading initial #xquests tweets...');
      console.log('📊 Twitter API Status:', getTwitterApiStatus());
      
      const result: TweetLoadResult = await fetchXQuestsTweets(10);
      
      if (result.success) {
        setCommunityTweets(result.tweets);
        setNextToken(result.nextToken);
        setHasMoreTweets(result.hasMore);
        setIsUsingFallback(result.isUsingFallback);
        
        if (result.error) {
          setApiError(result.error);
        }
        
        console.log(`✅ Loaded ${result.tweets.length} tweets`);
        if (result.isUsingFallback) {
          console.log('ℹ️ Using fallback tweets (no Twitter API token)');
        }
      } else {
        setApiError(result.error || 'Failed to load tweets');
        setIsUsingFallback(true);
        setHasMoreTweets(result.hasMore);
      }
    } catch (error: any) {
      console.error('❌ Error loading initial tweets:', error);
      setApiError(error.message);
      setIsUsingFallback(true);
      setHasMoreTweets(false);
    } finally {
      setLoadingInitialTweets(false);
    }
  };

  const loadMoreTweets = async () => {
    if (loadingMoreTweets || !hasMoreTweets) return;
    
    setLoadingMoreTweets(true);
    setApiError(null);
    
    try {
      console.log('🔄 Loading more #xquests tweets...');
      const result: TweetLoadResult = await loadMoreXQuestsTweets(nextToken);
      
      if (result.success) {
        if (result.tweets.length > 0) {
          setCommunityTweets(prev => [...prev, ...result.tweets]);
          setNextToken(result.nextToken);
          setHasMoreTweets(result.hasMore);
          
          console.log(`✅ Loaded ${result.tweets.length} more tweets`);
        } else {
          setHasMoreTweets(false);
          console.log('ℹ️ No more tweets available');
        }
        
        if (result.error) {
          setApiError(result.error);
        }
      } else {
        setApiError(result.error || 'Failed to load more tweets');
        setHasMoreTweets(result.hasMore);
      }
    } catch (error: any) {
      console.error('❌ Error loading more tweets:', error);
      setApiError(error.message);
    } finally {
      setLoadingMoreTweets(false);
    }
  };

  const handleRefresh = async () => {
    setApiError(null);
    
    try {
      console.log('🔄 Refreshing #xquests tweets...');
      const result: TweetLoadResult = await refreshXQuestsTweets();
      
      if (result.success) {
        setCommunityTweets(result.tweets);
        setNextToken(result.nextToken);
        setHasMoreTweets(result.hasMore);
        setIsUsingFallback(result.isUsingFallback);
        
        if (result.error) {
          setApiError(result.error);
        }
        
        console.log(`✅ Refreshed with ${result.tweets.length} tweets`);
      } else {
        setApiError(result.error || 'Failed to refresh tweets');
        setHasMoreTweets(result.hasMore);
      }
    } catch (error: any) {
      console.error('❌ Error refreshing tweets:', error);
      setApiError(error.message);
    }
  };

  // Enhanced scroll functions with proper ScrollView methods
  const scrollLeft = () => {
    if (scrollViewRef.current && isWeb) {
      scrollViewRef.current.scrollTo({ x: Math.max(0, (scrollViewRef.current as any)._scrollMetrics?.contentOffset?.x - 300 || 0), animated: true });
    }
  };

  const scrollRight = () => {
    if (scrollViewRef.current && isWeb) {
      scrollViewRef.current.scrollTo({ x: ((scrollViewRef.current as any)._scrollMetrics?.contentOffset?.x || 0) + 300, animated: true });
    }
  };

  const handleScroll = (event: any) => {
    if (isWeb) {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      setCanScrollLeft(contentOffset.x > 10);
      setCanScrollRight(contentOffset.x < contentSize.width - layoutMeasurement.width - 10);
    }
  };

  const formatEngagementNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const showApiStatus = () => {
    const status = getTwitterApiStatus();
    Alert.alert(
      'Twitter API Status',
      `Has Token: ${status.hasToken}\n` +
      `Token Preview: ${status.tokenPreview}\n` +
      `Platform: ${status.platform}\n` +
      `Using Fallback: ${isUsingFallback ? 'Yes' : 'No'}\n` +
      `Has More Tweets: ${hasMoreTweets ? 'Yes' : 'No'}\n` +
      `Error: ${apiError || 'None'}`,
      [{ text: 'OK' }]
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Hash size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Community Activity</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          {/* API Status Indicator */}
          <TouchableOpacity onPress={showApiStatus} style={styles.apiStatusBadge}>
            {isUsingFallback ? (
              <WifiOff size={12} color={theme.colors.warning} />
            ) : (
              <Wifi size={12} color={theme.colors.success} />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[
            styles.reloadButton, 
            (loadingMoreTweets || !hasMoreTweets) && styles.reloadButtonDisabled
          ]}
          onPress={loadMoreTweets}
          disabled={loadingMoreTweets || !hasMoreTweets}
        >
          {loadingMoreTweets ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : !hasMoreTweets ? (
            <CheckCircle size={16} color={theme.colors.success} />
          ) : (
            <RefreshCw size={16} color={theme.colors.primary} />
          )}
          <Text style={[
            styles.reloadButtonText,
            (loadingMoreTweets || !hasMoreTweets) && styles.reloadButtonTextDisabled
          ]}>
            {loadingMoreTweets ? 'Loading...' : !hasMoreTweets ? 'All Loaded' : 'Load More'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionSubtitle}>
        {isUsingFallback ? 
          'Demo tweets with #xquests hashtag (Twitter API not configured)' :
          'Real-time #xquests tweets from our community'
        }
      </Text>

      {/* API Error Banner */}
      {apiError && (
        <View style={styles.errorBanner}>
          <WifiOff size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>
            API Error: {apiError}. Showing demo content.
          </Text>
        </View>
      )}

      {/* Community Feed Container with Navigation */}
      <View style={styles.communityFeedContainer}>
        {/* Web Navigation Arrows */}
        {isWeb && !loadingInitialTweets && communityTweets.length > 0 && (
          <>
            <TouchableOpacity
              style={[styles.scrollArrow, styles.scrollArrowLeft, !canScrollLeft && styles.scrollArrowDisabled]}
              onPress={scrollLeft}
              disabled={!canScrollLeft}
            >
              <ChevronLeft size={20} color={canScrollLeft ? theme.colors.text : theme.colors.textTertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.scrollArrow, styles.scrollArrowRight, !canScrollRight && styles.scrollArrowDisabled]}
              onPress={scrollRight}
              disabled={!canScrollRight}
            >
              <ChevronRight size={20} color={canScrollRight ? theme.colors.text : theme.colors.textTertiary} />
            </TouchableOpacity>
          </>
        )}

        {/* Loading Initial Tweets */}
        {loadingInitialTweets ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.communityFeed}
            contentContainerStyle={styles.communityFeedContent}
          >
            <SkeletonTweet theme={theme} />
            <SkeletonTweet theme={theme} />
            <SkeletonTweet theme={theme} />
          </ScrollView>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={isWeb}
            style={styles.communityFeed}
            contentContainerStyle={styles.communityFeedContent}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            {...(isWeb && {
              overScrollMode: 'never',
              bounces: false,
            })}
          >
            {/* Actual tweets */}
            {communityTweets.map((tweet) => (
              <View key={tweet.id} style={styles.tweetCard}>
                {/* Tweet Header */}
                <View style={styles.tweetHeader}>
                  <Image
                    source={{ uri: tweet.avatar }}
                    style={styles.tweetAvatar}
                  />
                  <View style={styles.tweetUserInfo}>
                    <View style={styles.tweetUserNameRow}>
                      <Text style={styles.tweetDisplayName}>{tweet.displayName}</Text>
                      {tweet.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedIcon}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.tweetUsername}>@{tweet.username}</Text>
                  </View>
                  <Text style={styles.tweetTimestamp}>{tweet.timestamp}</Text>
                </View>

                {/* Tweet Content */}
                <Text style={styles.tweetContent}>{tweet.content}</Text>

                {/* Challenge Tag */}
                {tweet.challengeTag && (
                  <View style={styles.challengeTagContainer}>
                    <Hash size={12} color={theme.colors.primary} />
                    <Text style={styles.challengeTag}>{tweet.challengeTag}</Text>
                  </View>
                )}

                {/* Tweet Engagement */}
                <View style={styles.tweetEngagement}>
                  <View style={styles.engagementItem}>
                    <Text style={styles.engagementText}>
                      ❤️ {formatEngagementNumber(tweet.likes)}
                    </Text>
                  </View>
                  <View style={styles.engagementItem}>
                    <Text style={styles.engagementText}>
                      🔄 {formatEngagementNumber(tweet.retweets)}
                    </Text>
                  </View>
                  <View style={styles.engagementItem}>
                    <Text style={styles.engagementText}>
                      💬 {formatEngagementNumber(tweet.replies)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.engagementItem}>
                    <Text style={styles.engagementText}>🔗</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Loading More Tweets Skeleton */}
            {loadingMoreTweets && (
              <>
                <SkeletonTweet theme={theme} />
                <SkeletonTweet theme={theme} />
                <SkeletonTweet theme={theme} />
              </>
            )}

            {/* Empty State */}
            {!loadingMoreTweets && communityTweets.length === 0 && (
              <View style={styles.emptyTweetsState}>
                <Hash size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyTweetsTitle}>No tweets found</Text>
                <Text style={styles.emptyTweetsText}>
                  {isUsingFallback ? 
                    'Configure Twitter API to see real tweets' :
                    'No #xquests tweets available right now'
                  }
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadInitialTweets}>
                  <RefreshCw size={16} color={theme.colors.primary} />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* End of Feed Message */}
            {!loadingMoreTweets && !hasMoreTweets && communityTweets.length > 0 && (
              <View style={styles.endOfFeedState}>
                <CheckCircle size={32} color={theme.colors.success} />
                <Text style={styles.endOfFeedTitle}>You're all caught up!</Text>
                <Text style={styles.endOfFeedText}>
                  {isUsingFallback ? 
                    'No more demo tweets available' :
                    'No more #xquests tweets to load'
                  }
                </Text>
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                  <RefreshCw size={16} color={theme.colors.primary} />
                  <Text style={styles.refreshButtonText}>Refresh Feed</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Web Scroll Indicator */}
      {isWeb && !loadingInitialTweets && communityTweets.length > 0 && (
        <View style={styles.scrollIndicator}>
          <Text style={styles.scrollIndicatorText}>
            Scroll horizontally to see more tweets
          </Text>
        </View>
      )}
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.error,
  },
  apiStatusBadge: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  reloadButtonDisabled: {
    opacity: 0.6,
  },
  reloadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  reloadButtonTextDisabled: {
    color: theme.colors.textTertiary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    flex: 1,
  },
  communityFeedContainer: {
    position: 'relative',
    marginHorizontal: -16,
  },
  scrollArrow: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ translateY: -20 }],
  },
  scrollArrowLeft: {
    left: 8,
  },
  scrollArrowRight: {
    right: 8,
  },
  scrollArrowDisabled: {
    opacity: 0.3,
  },
  communityFeed: {
    ...(Platform.OS === 'web' && {
      overflow: 'auto',
    }),
  },
  communityFeedContent: {
    paddingHorizontal: 16,
    gap: 12,
    ...(Platform.OS === 'web' && {
      minWidth: '100%',
    }),
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  scrollIndicatorText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  tweetCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    width: 280,
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
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    }),
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tweetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tweetUserInfo: {
    flex: 1,
  },
  tweetUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tweetDisplayName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tweetUsername: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tweetTimestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tweetContent: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  challengeTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  challengeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  tweetEngagement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyTweetsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    width: 280,
  },
  emptyTweetsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTweetsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  endOfFeedState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: 280,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  endOfFeedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  endOfFeedText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  refreshButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});