import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Send,
  Heart,
  MessageCircle,
  Repeat,
  Award,
  Edit3,
} from "lucide-react-native";
import { useRouter } from "expo-router";

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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={onClose} className="mr-4">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold flex-1">Challenge Details</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Challenge Info */}
        <View className="p-4 bg-blue-50 rounded-lg m-4">
          <Text className="text-lg font-bold">{challenge.title}</Text>
          <Text className="text-gray-600 mt-1">{challenge.description}</Text>

          <View className="flex-row items-center mt-3">
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-800">{challenge.theme}</Text>
            </View>
            <View className="flex-row items-center ml-auto">
              <Award size={16} color="#FFD700" />
              <Text className="font-bold ml-1">{challenge.reward} ALGO</Text>
            </View>
          </View>

          <Text className="text-gray-500 mt-2">
            Time remaining: {challenge.timeRemaining}
          </Text>
        </View>

        {/* Tweet Composer */}
        <View className="bg-white rounded-lg mx-4 mb-4 p-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Image
              source="https://api.dicebear.com/7.x/avataaars/svg?seed=user123"
              style={{ width: 40, height: 40 }}
              className="rounded-full"
            />
            <View className="ml-2">
              <Text className="font-bold">Your Twitter Handle</Text>
              <Text className="text-gray-500">@yourusername</Text>
            </View>
            <View className="ml-auto flex-row items-center">
              <Edit3 size={16} color="#3B82F6" />
              <Text className="text-blue-500 ml-1">Edit</Text>
            </View>
          </View>

          <View className="border border-gray-200 rounded-lg p-3 min-h-[120px]">
            <TextInput
              multiline
              value={tweetContent}
              onChangeText={setTweetContent}
              className="text-base"
              placeholder="What's happening?"
              editable={!isPosted}
            />
          </View>

          <View className="flex-row justify-between items-center mt-3">
            <Text className="text-gray-500">
              {280 - tweetContent.length} characters left
            </Text>
            {!isPosted ? (
              <TouchableOpacity
                onPress={handlePost}
                disabled={isPosting}
                className={`flex-row items-center px-4 py-2 rounded-full ${isPosting ? "bg-blue-300" : "bg-blue-500"}`}
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Send size={16} color="#fff" />
                    <Text className="text-white font-bold ml-2">
                      Post Tweet
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View className="px-4 py-2 bg-green-500 rounded-full">
                <Text className="text-white font-bold">Posted</Text>
              </View>
            )}
          </View>
        </View>

        {/* Engagement Metrics */}
        {isPosted && (
          <View className="bg-white rounded-lg mx-4 mb-4 p-4 border border-gray-200">
            <Text className="font-bold text-lg mb-3">Engagement Metrics</Text>

            <View className="flex-row justify-between mb-4">
              <View className="items-center">
                <View className="flex-row items-center">
                  <Heart size={16} color="#F43F5E" />
                  <Text className="ml-1 font-bold">
                    {currentEngagement.likes}/{challenge.requiredLikes}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm mt-1">Likes</Text>
                <View className="h-1 bg-gray-200 w-20 mt-2 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${(currentEngagement.likes / challenge.requiredLikes) * 100}%`,
                    }}
                  />
                </View>
              </View>

              <View className="items-center">
                <View className="flex-row items-center">
                  <Repeat size={16} color="#10B981" />
                  <Text className="ml-1 font-bold">
                    {currentEngagement.retweets}/{challenge.requiredRetweets}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm mt-1">Retweets</Text>
                <View className="h-1 bg-gray-200 w-20 mt-2 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${(currentEngagement.retweets / challenge.requiredRetweets) * 100}%`,
                    }}
                  />
                </View>
              </View>

              <View className="items-center">
                <View className="flex-row items-center">
                  <MessageCircle size={16} color="#3B82F6" />
                  <Text className="ml-1 font-bold">
                    {currentEngagement.replies}/{challenge.requiredReplies}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm mt-1">Replies</Text>
                <View className="h-1 bg-gray-200 w-20 mt-2 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(currentEngagement.replies / challenge.requiredReplies) * 100}%`,
                    }}
                  />
                </View>
              </View>
            </View>

            {isRewardEarned ? (
              <View className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Text className="text-green-800 font-bold text-center">
                  Congratulations! You've earned {challenge.reward} ALGO
                </Text>
                <Text className="text-green-600 text-center mt-1">
                  Tokens have been transferred to your wallet
                </Text>
                <TouchableOpacity
                  className="bg-green-500 py-2 px-4 rounded-full mt-3 self-center"
                  onPress={() => router.push("/")}
                >
                  <Text className="text-white font-bold">
                    Return to Dashboard
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Text className="text-blue-800 text-center">
                  Tracking engagement metrics in real-time
                </Text>
                <Text className="text-blue-600 text-center mt-1">
                  You'll earn rewards once all targets are met
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tips Section */}
        <View className="bg-white rounded-lg mx-4 mb-8 p-4 border border-gray-200">
          <Text className="font-bold text-lg mb-2">
            Tips for Better Engagement
          </Text>
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <Text>Add relevant hashtags to increase visibility</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <Text>Post during peak hours (9am-11am, 1pm-3pm)</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <Text>Include a question to encourage replies</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <Text>Add an image or GIF to increase engagement</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChallengeDetailScreen;
