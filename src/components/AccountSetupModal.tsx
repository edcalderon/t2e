import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { X, ArrowRight, Check } from "lucide-react-native";
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TwitterConnectStep, WalletConnectStep, InterestsStep } from './AccountSetup';

interface AccountSetupModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

const AccountSetupModal = ({
  isVisible = true,
  onClose = () => {},
  onComplete = () => {},
}: AccountSetupModalProps) => {
  const { theme } = useTheme();
  const { updateUser, twitterUser, isSupabaseAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // Animation values
  const [slideAnim] = useState(new Animated.Value(height));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const steps = [
    {
      title: "Connect to X",
      description: "Link your X (Twitter) account to start earning rewards",
    },
    {
      title: "Setup Wallet",
      description: "Connect your Algorand wallet to receive token rewards",
    },
    {
      title: "Choose Interests",
      description: "Select topics you're passionate about for personalized challenges",
    },
  ];

  useEffect(() => {
    if (isVisible) {
      // Animate modal in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Update Twitter connection status when Supabase auth changes
  useEffect(() => {
    if (isSupabaseAuthenticated && twitterUser) {
      setTwitterConnected(true);
    }
  }, [isSupabaseAuthenticated, twitterUser]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // If X user is authenticated, just update the existing user with additional setup data
    if (isSupabaseAuthenticated && twitterUser) {
      console.log('Completing setup for existing X user:', twitterUser);
      
      try {
        // Update the existing user with setup completion data
        await updateUser({
          walletAddress: walletConnected ? `ALGO${twitterUser.twitterId || "385"}WALLET` : undefined,
          walletConnected,
          selectedThemes,
          setupCompleted: true, // Mark setup as completed
        });

        console.log('Setup completed for X user:', {
          userId: twitterUser.id,
          username: twitterUser.username,
          walletConnected,
          selectedThemes,
        });

        // Animate completion
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onComplete();
          });
        });
      } catch (error) {
        console.error('Error completing setup for X user:', error);
        onComplete();
      }
    } else {
      // Only create a guest user if no X user is authenticated
      console.log('No X user authenticated, creating guest user');
      
      // This should rarely happen since we require X authentication first
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      handleClose();
    }
  };

  const handleThemeToggle = (themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== themeId));
    } else {
      setSelectedThemes([...selectedThemes, themeId]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return twitterConnected;
      case 1:
        return walletConnected;
      case 2:
        return selectedThemes.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <TwitterConnectStep
            onConnect={setTwitterConnected}
            isConnected={twitterConnected}
          />
        );
      case 1:
        return (
          <WalletConnectStep
            onConnect={setWalletConnected}
            isConnected={walletConnected}
          />
        );
      case 2:
        return (
          <InterestsStep
            selectedThemes={selectedThemes}
            onThemeToggle={handleThemeToggle}
          />
        );
      default:
        return null;
    }
  };

  const styles = createStyles(theme);

  return (
    <Modal visible={isVisible} animationType="none" transparent={true}>
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Welcome to XQuests</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.progressStep}>
                <View
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive,
                    index < currentStep && styles.progressDotCompleted
                  ]}
                >
                  {index < currentStep ? (
                    <Check size={12} color="#FFFFFF" />
                  ) : (
                    <Text style={[
                      styles.progressNumber,
                      index === currentStep && styles.progressNumberActive
                    ]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      index < currentStep && styles.progressLineCompleted
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Step Content */}
          <View style={styles.content}>
            {renderStepContent()}
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>
                {currentStep === 0 ? "Cancel" : "Back"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
              </Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.9,
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.success,
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  progressNumberActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
  progressLineCompleted: {
    backgroundColor: theme.colors.success,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountSetupModal;