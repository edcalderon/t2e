import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Easing } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
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
const isMobile = width < 768;

const AccountSetupModal = ({
  isVisible = false,
  onClose = () => {},
  onComplete = () => {},
}: AccountSetupModalProps) => {
  // Internal state for controlling Modal visibility
  const [internalVisible, setInternalVisible] = useState(false);
  const { theme } = useTheme();
  const { 
    updateUser, 
    twitterUser, 
    isSupabaseAuthenticated, 
    isLoading: isAuthLoading 
  } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { user } = useAuth();

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

  // Check if all steps are completed
  const isComplete = useMemo(() => {
    return (
      twitterConnected &&
      walletConnected &&
      selectedThemes.length > 0
    );
  }, [twitterConnected, walletConnected, selectedThemes.length]);

  // Reset state when modal is opened
  const resetModalState = () => {
    setCurrentStep(0);
    setTwitterConnected(false);
    setWalletConnected(false);
    setSelectedThemes([]);
  };

  // Sync internalVisible with isVisible for opening/closing
  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 10,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
        resetModalState();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Handle modal visibility and initial auth state
  useEffect(() => {
    if (isVisible) {
      console.log('🔍 Modal became visible, checking auth state...');
      console.log('🔍 Auth state:', { isSupabaseAuthenticated, hasTwitterUser: !!twitterUser });
      
      // If already authenticated, update the state
      if (isSupabaseAuthenticated && twitterUser) {
        console.log('✅ User is already authenticated with X, updating state');
        setTwitterConnected(true);
        
        // Only auto-advance if we're on the first step
        if (currentStep === 0) {
          console.log('⏳ Preparing to advance to next step...');
          const timer = setTimeout(() => {
            console.log('➡️ Advancing to next step from initial check');
            setCurrentStep(1);
          }, 800);
          
          return () => clearTimeout(timer);
        }
      } else {
        console.log('ℹ️ User is not authenticated with X yet or missing Twitter user data');
        setTwitterConnected(false);
      }
    }
  }, [isVisible, isSupabaseAuthenticated, twitterUser, currentStep]);

  // Handle Twitter connection state changes
  const handleTwitterConnect = useCallback((connected: boolean) => {
    console.log('🔄 handleTwitterConnect called with:', connected);
    setTwitterConnected(connected);
    
    if (connected) {
      console.log('✅ Twitter connected, moving to next step');
      // Small delay to allow the UI to update before moving to next step
      setTimeout(() => {
        if (currentStep === 0) {
          setCurrentStep(1);
        }
      }, 300);
    }
  }, [currentStep]);

  // Update Twitter connection status when Supabase auth changes
  useEffect(() => {
    const connected = !!(isSupabaseAuthenticated && twitterUser);
    console.log('🔄 Auth state changed:', { isSupabaseAuthenticated, hasTwitterUser: !!twitterUser, connected });
    
    // Only update if the state actually changed
    if (connected !== twitterConnected) {
      console.log('🔀 Twitter connection state changed to:', connected);
      setTwitterConnected(connected);
    }
    
    // If we're on the Twitter step and user just connected, automatically advance
    if (connected && currentStep === 0) {
      console.log('⏱️ User connected, preparing to advance to next step...');
      
      // Clear any existing timeouts to prevent multiple advances
      const timer = setTimeout(() => {
        console.log('➡️ Advancing to next step after successful connection');
        setCurrentStep(1);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // Set auth check as complete after initial check
    if (isCheckingAuth) {
      console.log('✅ Initial auth check complete');
      setIsCheckingAuth(false);
      
      // If user is already authenticated and setup is complete, close the modal
      if (connected && user?.setupCompleted) {
        console.log('🔒 User already authenticated and setup complete, closing modal');
        handleClose();
      }
    }
  }, [isSupabaseAuthenticated, twitterUser, currentStep, isCheckingAuth, twitterConnected, user?.setupCompleted]);

  // Only call this to trigger the animation, not to hide the modal immediately
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start(() => {
      setInternalVisible(false); // Actually hide the modal
      onClose(); // Notify parent
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
    console.log('🎯 Starting setup completion...');
    
    // If X user is authenticated, just update the existing user with additional setup data
    if (isSupabaseAuthenticated && twitterUser) {
      console.log('✅ Completing setup for X user:', twitterUser.username);
      
      try {
        // First, update the user with all the setup data
        const updateData = {
          walletAddress: walletConnected ? `ALGO${twitterUser.twitterId || "385"}WALLET` : undefined,
          walletConnected,
          selectedThemes,
          setupCompleted: true, // Mark setup as completed
        };

        console.log('🔄 Updating user with:', updateData);
        
        // Wait for the update to complete
        await updateUser(updateData);
        
        // Force a small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log('✅ Setup completed for X user:', {
          userId: twitterUser.id,
          username: twitterUser.username,
          walletConnected,
          selectedThemes,
        });

        // Animate completion
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start(() => {
            console.log('🏁 Setup flow completed successfully');
            // Ensure we call onComplete after all animations and state updates
            setTimeout(() => {
              onComplete();
            }, 100);
          });
        });
      } catch (error) {
        console.error('❌ Error completing setup for X user:', error);
        // Still call onComplete to ensure the modal closes
        onComplete();
      }
    } else {
      console.log('⚠️ No X user authenticated during setup completion');
      // Still call onComplete to ensure the modal closes
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
    if (isCheckingAuth) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking authentication status...</Text>
          <Text style={styles.loadingSubtext}>This should only take a moment</Text>
        </View>
      );
    }
    
    switch (currentStep) {
      case 0:
        return (
          <TwitterConnectStep 
            onConnect={handleTwitterConnect} 
            key="twitter-connect"
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

  const styles = createStyles(theme, isMobile);

  const handleOverlayPress = (e: any) => {
    // Only close if the overlay itself is clicked, not its children
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <Modal 
      visible={internalVisible} 
      animationType="none" 
      transparent={true}
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleOverlayPress}
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
                    <Check size={isMobile ? 10 : 12} color="#FFFFFF" />
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
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {renderStepContent()}
          </ScrollView>

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

const createStyles = (theme: any, isMobile: boolean) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: isMobile ? 20 : 24,
    width: '100%',
    maxWidth: isMobile ? width - 32 : 400,
    maxHeight: isMobile ? height * 0.95 : height * 0.9,
    minHeight: isMobile ? height * 0.8 : 600,
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
    paddingHorizontal: isMobile ? 16 : 24,
    paddingTop: isMobile ? 16 : 24,
    paddingBottom: isMobile ? 12 : 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: isMobile ? 18 : 20,
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
    paddingHorizontal: isMobile ? 16 : 24,
    marginBottom: isMobile ? 20 : 32,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: isMobile ? 28 : 32,
    height: isMobile ? 28 : 32,
    borderRadius: isMobile ? 14 : 16,
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
    fontSize: isMobile ? 12 : 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  progressNumberActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: isMobile ? 30 : 40,
    height: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: isMobile ? 6 : 8,
  },
  progressLineCompleted: {
    backgroundColor: theme.colors.success,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: isMobile ? 16 : 24,
    paddingBottom: isMobile ? 16 : 24,
    flexGrow: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: isMobile ? 16 : 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  backButtonText: {
    fontSize: isMobile ? 14 : 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 20 : 24,
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
    fontSize: isMobile ? 14 : 16,
    fontWeight: '600',
  },
});

export default AccountSetupModal;