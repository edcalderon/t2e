import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Image,
} from "react-native";
import { X, ArrowRight, Check, Wallet, Settings } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface AccountSetupModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

const AccountSetupModal = ({
  isVisible = true,
  onClose = () => {},
  onComplete = () => {},
}: AccountSetupModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const steps = [
    {
      title: "Connect Twitter/X",
      description: "Link your Twitter/X account to participate in challenges",
    },
    {
      title: "Connect Algorand Wallet",
      description: "Connect your Algorand wallet to receive rewards",
    },
    {
      title: "Set Preferences",
      description: "Choose content themes you are interested in",
    },
  ];

  const themes = [
    "Technology",
    "Crypto",
    "Finance",
    "Gaming",
    "Sports",
    "Entertainment",
    "Politics",
    "Science",
  ];

  const handleTwitterConnect = () => {
    // In a real implementation, this would trigger OAuth flow
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTwitterConnected(true);
  };

  const handleWalletConnect = () => {
    // In a real implementation, this would use MyAlgo SDK
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setWalletConnected(true);
  };

  const toggleTheme = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== theme));
    } else {
      setSelectedThemes([...selectedThemes, theme]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentStep(currentStep + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View className="items-center">
            <View className="w-16 h-16 bg-gradient-to-r from-xqcyan to-xqblue rounded-full items-center justify-center mb-6">
              <X size={32} color="white" />
            </View>
            <Text className="text-lg mb-6 text-center">
              Connect your Twitter/X account to participate in tweet challenges
              and earn rewards
            </Text>
            {twitterConnected ? (
              <View className="flex-row items-center bg-green-100 p-4 rounded-lg mb-6 w-full">
                <Check size={24} color="green" />
                <Text className="ml-2 text-green-700">
                  Twitter/X account connected successfully!
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-gradient-to-r from-xqcyan to-xqblue py-3 px-6 rounded-lg mb-6"
                onPress={handleTwitterConnect}
              >
                <Text className="text-white font-bold text-center">
                  Connect Twitter/X
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case 1:
        return (
          <View className="items-center">
            <View className="w-16 h-16 bg-gradient-to-r from-xqcyan to-xqblue rounded-full items-center justify-center mb-6">
              <Wallet size={32} color="white" />
            </View>
            <Text className="text-lg mb-6 text-center">
              Connect your Algorand wallet to receive token rewards for your
              engagement
            </Text>
            {walletConnected ? (
              <View className="flex-row items-center bg-green-100 p-4 rounded-lg mb-6 w-full">
                <Check size={24} color="green" />
                <Text className="ml-2 text-green-700">
                  Algorand wallet connected successfully!
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-gradient-to-r from-xqcyan to-xqblue py-3 px-6 rounded-lg mb-6"
                onPress={handleWalletConnect}
              >
                <Text className="text-white font-bold text-center">
                  Connect Algorand Wallet
                </Text>
              </TouchableOpacity>
            )}
            <Text className="text-sm text-gray-500 text-center">
              Your wallet will be used to receive rewards automatically when
              your tweets meet engagement criteria
            </Text>
          </View>
        );
      case 2:
        return (
          <View className="items-center">
            <View className="w-16 h-16 bg-gradient-to-r from-xqcyan to-xqpurple rounded-full items-center justify-center mb-6">
              <Settings size={32} color="white" />
            </View>
            <Text className="text-lg mb-4 text-center">
              Select content themes you're interested in for tweet challenges
            </Text>
            <View className="flex-row flex-wrap justify-center mb-6">
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme}
                  className={`m-1 py-2 px-4 rounded-full ${selectedThemes.includes(theme) ? "bg-gradient-to-r from-xqcyan to-xqpurple" : "bg-gray-200"}`}
                  onPress={() => toggleTheme(theme)}
                >
                  <Text
                    className={`${selectedThemes.includes(theme) ? "text-white" : "text-gray-800"}`}
                  >
                    {theme}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-sm text-gray-500 text-center">
              AI will generate tweet challenges based on your selected themes
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black/50 font-sans">
        <View className="bg-white w-[90%] max-w-md rounded-xl p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold">Account Setup</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row justify-between mb-8">
            {steps.map((step, index) => (
              <View key={index} className="items-center flex-1">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${index === currentStep ? "bg-xqcyan" : index < currentStep ? "bg-green-500" : "bg-gray-300"}`}
                >
                  {index < currentStep ? (
                    <Check size={16} color="white" />
                  ) : (
                    <Text className="text-white font-bold">{index + 1}</Text>
                  )}
                </View>
                <Text className="text-xs text-center mt-1">{step.title}</Text>
                {index < steps.length - 1 && (
                  <View
                    className={`h-0.5 w-full absolute top-4 left-1/2 -z-10 ${index < currentStep ? "bg-green-500" : "bg-gray-300"}`}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Step Content */}
          <View className="mb-8">
            <Text className="text-xl font-bold mb-2">
              {steps[currentStep].title}
            </Text>
            <Text className="text-gray-600 mb-6">
              {steps[currentStep].description}
            </Text>
            {renderStepContent()}
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="py-3 px-6 rounded-lg border border-gray-300"
              onPress={handleBack}
            >
              <Text className="text-gray-700">
                {currentStep === 0 ? "Cancel" : "Back"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`py-3 px-6 rounded-lg flex-row items-center ${(currentStep === 0 && !twitterConnected) || (currentStep === 1 && !walletConnected) || (currentStep === 2 && selectedThemes.length === 0) ? "bg-gray-300" : "bg-gradient-to-r from-xqcyan to-xqblue"}`}
              onPress={handleNext}
              disabled={
                (currentStep === 0 && !twitterConnected) ||
                (currentStep === 1 && !walletConnected) ||
                (currentStep === 2 && selectedThemes.length === 0)
              }
            >
              <Text className="text-white font-bold mr-2">
                {currentStep === steps.length - 1 ? "Complete" : "Next"}
              </Text>
              <ArrowRight size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AccountSetupModal;
