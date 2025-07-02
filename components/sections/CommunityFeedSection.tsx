import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Animated,
} from 'react-native';
import { Lightbulb, Hash, Search, WifiOff, ChevronLeft, ChevronRight, RefreshCcw, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchTweets, searchTweets as searchTweetsApi, loadMoreTweets } from '@/lib/api/twitterService';
import type { CommunityTweet } from '@/lib/twitterInterfaces';

interface CommunityFeedSectionProps {
  theme: any;
  refreshing: boolean;
  onRefresh: () => void;
}

const CommunityFeedSection: React.FC<CommunityFeedSectionProps> = ({ theme, refreshing, onRefresh }) => {
  const styles = createStyles(theme);
  const [tweets, setTweets] = useState<CommunityTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const loadInitialTweets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchTweets();
      setTweets(result.tweets);
      setNextToken(result.nextToken);
      setHasMore(result.hasMore);
    } catch (err) {
      setError('Failed to load tweets. Please try again.');
      console.error('Error loading tweets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !nextToken) return;
    
    setLoadingMore(true);
    try {
      const result = await loadMoreTweets(nextToken);
      setTweets(prev => [...prev, ...result.tweets]);
      setNextToken(result.nextToken);
      setHasMore(result.hasMore);
    } catch (err) {
      setError('Failed to load more tweets');
      console.error('Error loading more tweets:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      await loadInitialTweets();
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const result = await searchTweetsApi(query);
      setTweets(result.tweets);
      setNextToken(result.nextToken);
      setHasMore(result.hasMore);
    } catch (err) {
      setError('Failed to search tweets');
      console.error('Error searching tweets:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    // Clear current tweets and show skeleton while fetching new ones
    setTweets([]);
    setHasMore(true);
    setLoading(true);

    // Trigger parent refresh logic if any
    onRefresh();

    await loadInitialTweets();
  };

  const scrollToIndex = (index: number) => {
    if (!flatListRef.current || index < 0 || index >= tweets.length) return;
    flatListRef.current.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const scrollNext = () => {
    if (currentIndex < tweets.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const scrollPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    // Calculate the index based on card width + margin (300 + 12)
    const index = Math.round(contentOffset.x / 312);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    loadInitialTweets();
  }, []);

  const [likedTweets, setLikedTweets] = useState<{ [key: string]: boolean }>({});

  const handleLike = (tweetId: string) => {
    setLikedTweets((prev) => ({ ...prev, [tweetId]: !prev[tweetId] }));
    // TODO: Optionally trigger API call here
  };

  const renderTweet = ({ item }: { item: CommunityTweet }) => {
    const liked = likedTweets[item.id];
    return (
      <View style={[styles.tweetCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, margin: 12 }]} > 
        <View style={styles.tweetHeader}>
          {item.avatar ? (
            <Image 
              source={{ uri: item.avatar }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}> 
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}> 
                {item.displayName?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={[styles.displayName, { color: theme.colors.text, fontWeight: 'bold' }]} numberOfLines={1}>
              {item.displayName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={[styles.username, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                @{item.username}
              </Text>
              {item.timestamp && (
                <Text style={[styles.timestamp, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                  · {item.timestamp}
                </Text>
              )}
            </View>
          </View>
        </View>
        <Text style={[styles.content, { color: theme.colors.text, padding: 12 }]} > 
          {item.content}
        </Text>
        <View style={styles.engagementRow}>
          <TouchableOpacity
            style={styles.engagementIcon}
            onPress={() => handleLike(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, liked && styles.liked]}>❤️</Text>
            <Text style={styles.engagementCount}>{(item.likes || 0) + (liked ? 1 : 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementIcon} activeOpacity={0.7}>
            <Text style={styles.icon}>🔄</Text>
            <Text style={styles.engagementCount}>{item.retweets || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementIcon} activeOpacity={0.7}>
            <Text style={styles.icon}>💬</Text>
            <Text style={styles.engagementCount}>{item.replies || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const SkeletonItem = ({ width, height, style = {} }: { width: number; height: number; style?: any }) => (
    <View style={[{
      width,
      height,
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
      borderRadius: 4,
    }, style]}>
      <LinearGradient
        colors={[theme.colors.border, theme.colors.card, theme.colors.border]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );

  const renderSkeletonCard = ({ index }: { index: number }) => (
    <View
      style={[
        styles.tweetCard,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          shadowColor: theme.dark ? '#000' : '#222',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: theme.dark ? 0.35 : 0.12,
          shadowRadius: 8,
          elevation: 4,
          margin: 12,
          minHeight: 180,
          justifyContent: 'space-between',
        },
      ]}
    >
      {/* Header (avatar + user info) */}
      <View style={styles.tweetHeader}>
        <SkeletonItem width={44} height={44} style={{ borderRadius: 22 }} />
        <View style={styles.userInfo}>
          <SkeletonItem width={90} height={16} style={{ borderRadius: 6 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <SkeletonItem width={60} height={14} style={{ borderRadius: 6 }} />
            <SkeletonItem width={40} height={12} style={{ borderRadius: 6, marginLeft: 8 }} />
          </View>
        </View>
      </View>
      <SkeletonItem width={100} height={16} style={{ marginVertical: 8 }} />
      <SkeletonItem width={80} height={16} style={{ marginBottom: 16 }} />
      <View style={styles.skeletonFooter}>
        <SkeletonItem width={40} height={16} />
        <SkeletonItem width={40} height={16} style={{ marginLeft: 16 }} />
        <SkeletonItem width={40} height={16} style={{ marginLeft: 16 }} />
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.listContent, { paddingHorizontal: 16 }]}
    >
      {[0, 1, 2].map((index) => (
        <React.Fragment key={index}>{renderSkeletonCard({ index })}</React.Fragment>
      ))}
    </ScrollView>
  );

  const renderEmptyState = () => {
    if (loading) {
      return renderSkeleton();
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <WifiOff size={32} color={theme.colors.error} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadInitialTweets}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Hash size={32} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No tweets found. Start a conversation with #xquests!
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    const [showCaughtUp, setShowCaughtUp] = React.useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(40)).current;
    React.useEffect(() => {
      if (!hasMore && tweets.length > 0) {
        setShowCaughtUp(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [hasMore, tweets.length, fadeAnim, translateY]);

    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }

    if (hasMore && tweets.length > 0) {
      return (
        <TouchableOpacity 
          style={[
            styles.loadMoreButton,
            loadingMore && { opacity: 0.6 },
          ]}
          onPress={handleLoadMore}
          disabled={loadingMore}
          activeOpacity={0.7}
        >
          <Text style={styles.loadMoreText}>
            {loadingMore ? 'Loading...' : 'Load More'}
          </Text>
          {loadingMore && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      );
    }

    if (!hasMore && tweets.length > 0) {
      return (
        <Animated.View
          style={[
            styles.tweetCard,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderRadius: 12,
              shadowColor: theme.dark ? '#000' : '#222',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: theme.dark ? 0.35 : 0.12,
              shadowRadius: 8,
              elevation: 4,
              margin: 12,
              width: 320,
              minHeight: 180,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 18,
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          
          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Award size={40} color={theme.colors.primary} style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>You are caught up!</Text>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.primary + '22',
            borderRadius: 16,
            paddingVertical: 7,
            paddingHorizontal: 18,
            alignSelf: 'center',
            marginTop: 4,
          }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 14, textAlign: 'center' }}>
              More tweets appear when someone tweets with the #xquests hashtag
            </Text>
          </View>
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Community Feed
        </Text>
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Search size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.reloadButton} 
            onPress={handleRefresh}
            disabled={refreshing}
            activeOpacity={0.8}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <View style={styles.reloadIconWrapper}>
                <RefreshCcw size={22} color={theme.colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.horizontalContainer}>
        {!loading && tweets.length > 0 && (
          <TouchableOpacity 
            style={[
              styles.arrowButton, 
              styles.arrowLeft, 
              { 
                opacity: currentIndex === 0 ? 0.5 : 1,
                borderColor: theme.colors.primary,
                backgroundColor: 'rgba(29, 161, 242, 0.15)',
              }
            ]} 
            onPress={scrollPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        
        <View style={{ flex: 1, position: 'relative' }}>
          <FlatList
            ref={flatListRef}
            data={tweets}
            renderItem={renderTweet}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: 24 }]}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={false}
            snapToInterval={312} // 300 (card width) + 12 (margin)
            snapToAlignment="start"
            decelerationRate="normal"
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={renderEmptyState()}
            ListFooterComponent={renderFooter()}
            ListFooterComponentStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
          
          {tweets.length > 0 && (
            <View style={styles.scrollIndicator}>
              {tweets.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && [styles.activeDot, { backgroundColor: theme.colors.primary }]
                  ]} 
                />
              ))}
            </View>
          )}
        </View>
        
          {!loading && tweets.length > 0 && (
            <TouchableOpacity 
              style={[
                styles.arrowButton, 
                styles.arrowRight, 
                { 
                  opacity: currentIndex >= tweets.length - 1 ? 0.5 : 1,
                  borderColor: theme.colors.primary,
                  backgroundColor: 'rgba(29, 161, 242, 0.15)',
                }
              ]} 
              onPress={scrollNext}
              disabled={currentIndex >= tweets.length - 1}
            >
              <ChevronRight size={24} color={theme.colors.primary}  style={{ marginTop: -2 }}/>
            </TouchableOpacity>
          )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  skeletonCard: {
    marginRight: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonFooter: {
    flexDirection: 'row',
    marginTop: 16,
  },
  container: {
    flex: 1,
  },
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(29, 161, 242, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -18 }], // vertically center
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 4,
  },
  arrowLeft: {
    left: 16,
  },
  arrowRight: {
    right: 16,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  activeDot: {
    backgroundColor: '#1DA1F2',
    width: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  reloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 161, 242, 0.15)', // match arrow style
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(29,161,242,0.10)', // subtle blue border
  },
  reloadIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  reloadIcon: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 16,
  },
  tweetCard: {
    width: 320,
    minHeight: 180,
    borderRadius: 18,
    padding: 18,
    marginRight: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    shadowColor: theme.dark ? '#000' : '#222',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: theme.dark ? 0.35 : 0.12,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'space-between',
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29,161,242,0.15)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors.text,
  },
  username: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  timestamp: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.text,
    marginBottom: 14,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  engagementIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  icon: {
    fontSize: 20,
    marginRight: 5,
    color: theme.colors.textSecondary,
  },
  liked: {
    color: '#E0245E',
  },
  engagementCount: {
    fontSize: 15,
    color: '#657786',
    minWidth: 22,
    textAlign: 'left',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 0,
    // For press effect, see TouchableOpacity activeOpacity below
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  caughtUpContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29, 161, 242, 0.05)',
    borderRadius: 16,
    margin: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(29, 161, 242, 0.1)',
  },
  caughtUpText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});

export default CommunityFeedSection;
