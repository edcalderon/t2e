import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Hash, Search, WifiOff } from 'lucide-react-native';
import { fetchTweets, searchTweets as searchTweetsApi, loadMoreTweets } from '@/lib/api/twitterService';
import type { CommunityTweet } from '@/lib/twitterInterfaces';

interface CommunityFeedSectionProps {
  theme: any;
  refreshing: boolean;
  onRefresh: () => void;
}

const CommunityFeedSection: React.FC<CommunityFeedSectionProps> = ({ theme, refreshing, onRefresh }) => {
  const [tweets, setTweets] = useState<CommunityTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
    onRefresh();
    await loadInitialTweets();
  };

  useEffect(() => {
    loadInitialTweets();
  }, []);

  const renderTweet = ({ item }: { item: CommunityTweet }) => (
    <View style={[styles.tweetCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.tweetHeader}>
        <View style={styles.userInfo}>
          <Text style={[styles.displayName, { color: theme.colors.text }]}>
            {item.displayName}
          </Text>
          <Text style={[styles.username, { color: theme.colors.textSecondary }]}>
            @{item.username}
          </Text>
        </View>
      </View>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        {item.content}
      </Text>
      <View style={styles.engagement}>
        <Text style={[styles.engagementText, { color: theme.colors.textSecondary }]}>
          ❤️ {item.likes}  🔄 {item.retweets}  💬 {item.replies}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Loading tweets...
          </Text>
        </View>
      );
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
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Community Feed
        </Text>
        <TouchableOpacity onPress={() => {}}>
          <Search size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tweets}
        renderItem={renderTweet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState()}
        ListFooterComponent={renderFooter()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  tweetCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tweetHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  username: {
    fontSize: 14,
    opacity: 0.7,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  engagement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  engagementText: {
    fontSize: 14,
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
});

export default CommunityFeedSection;
