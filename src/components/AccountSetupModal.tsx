import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { X, ArrowRight, Check, Wallet, Settings, Twitter, Eye, EyeOff, CircleAlert as AlertCircle, Sparkles } from "lucide-react-native";
import { useTheme } from '../../contexts/ThemeContext';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Animation values
  const [slideAnim] = useState(new Animated.Value(height));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const steps = [
    {
      title: "Connect to X",
      description: "Link your X (Twitter) account to start earning rewards",
      icon: <Twitter size={32} color={theme.colors.primary} />,
    },
    {
      title: "Setup Wallet",
      description: "Connect your Algorand wallet to receive token rewards",
      icon: <Wallet size={32} color={theme.colors.primary} />,
    },
    {
      title: "Choose Interests",
      description: "Select topics you're passionate about for personalized challenges",
      icon: <Settings size={32} color={theme.colors.primary} />,
    },
  ];

  const themes = [
    { id: 'tech', name: 'Technology', emoji: '💻' },
    { id: 'crypto', name: 'Cryptocurrency', emoji: '₿' },
    { id: 'finance', name: 'Finance', emoji: '💰' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮' },
    { id: 'sports', name: 'Sports', emoji: '⚽' },
    { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
    { id: 'science', name: 'Science', emoji: '🔬' },
    { id: 'art', name: 'Art & Design', emoji: '🎨' },
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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (currentStep === 0) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTwitterConnect = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setTwitterConnected(true);
      setIsLoading(false);
      
      // Trigger haptic feedback on native platforms
      if (Platform.OS !== 'web') {
        // Would use Haptics.notificationAsync here
      }
    }, 2000);
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      setWalletConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  const toggleTheme = (themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== themeId));
    } else {
      setSelectedThemes([...selectedThemes, themeId]);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
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
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      handleClose();
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
    const styles = createStyles(theme);
    
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Twitter size={40} color="#1DA1F2" />
              </View>
            </View>
            
            <Text style={styles.stepTitle}>Connect Your X Account</Text>
            <Text style={styles.stepDescription}>
              Sign in with your X (Twitter) credentials to start participating in challenges and earning rewards
            </Text>

            {!twitterConnected ? (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Username or Email</Text>
                  <TextInput
                    style={[styles.input, errors.username && styles.inputError]}
                    value={formData.username}
                    onChangeText={(text) => {
                      setFormData({...formData, username: text});
                      if (errors.username) {
                        setErrors({...errors, username: ''});
                      }
                    }}
                    placeholder="Enter your X username or email"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.username && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={14} color={theme.colors.error} />
                      <Text style={styles.errorText}>{errors.username}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.passwordInput, errors.password && styles.inputError]}
                      value={formData.password}
                      onChangeText={(text) => {
                        setFormData({...formData, password: text});
                        if (errors.password) {
                          setErrors({...errors, password: ''});
                        }
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor={theme.colors.textTertiary}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={theme.colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={theme.colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={14} color={theme.colors.error} />
                      <Text style={styles.errorText}>{errors.password}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.connectButton, isLoading && styles.connectButtonDisabled]}
                  onPress={handleTwitterConnect}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View
                        style={[
                          styles.loadingSpinner,
                          {
                            transform: [{
                              rotate: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            }],
                          },
                        ]}
                      />
                      <Text style={styles.connectButtonText}>Connecting...</Text>
                    </View>
                  ) : (
                    <>
                      <Twitter size={20} color="#FFFFFF" />
                      <Text style={styles.connectButtonText}>Connect to X</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.disclaimerText}>
                  We'll never post without your permission. Your credentials are encrypted and secure.
                </Text>
              </View>
            ) : (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Check size={24} color={theme.colors.success} />
                </View>
                <Text style={styles.successTitle}>Successfully Connected!</Text>
                <Text style={styles.successDescription}>
                  Your X account is now linked. You can start participating in challenges.
                </Text>
              </View>
            )}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Wallet size={40} color={theme.colors.primary} />
              </View>
            </View>
            
            <Text style={styles.stepTitle}>Connect Algorand Wallet</Text>
            <Text style={styles.stepDescription}>
              Link your Algorand wallet to receive ALGO token rewards automatically when you complete challenges
            </Text>

            {!walletConnected ? (
              <View style={styles.walletOptions}>
                <TouchableOpacity
                  style={styles.walletOption}
                  onPress={handleWalletConnect}
                  disabled={isLoading}
                >
                  <Image
                    source={{ uri: "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2" }}
                    style={styles.walletIcon}
                  />
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>MyAlgo Wallet</Text>
                    <Text style={styles.walletDescription}>Secure web wallet for Algorand</Text>
                  </View>
                  <ArrowRight size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.walletOption}
                  onPress={handleWalletConnect}
                  disabled={isLoading}
                >
                  <Image
                    source={{ uri: "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2" }}
                    style={styles.walletIcon}
                  />
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>Pera Wallet</Text>
                    <Text style={styles.walletDescription}>Mobile-first Algorand wallet</Text>
                  </View>
                  <ArrowRight size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.walletOption}
                  onPress={handleWalletConnect}
                  disabled={isLoading}
                >
                  <Image
                    source={{ uri: "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2" }}
                    style={styles.walletIcon}
                  />
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>AlgoSigner</Text>
                    <Text style={styles.walletDescription}>Browser extension wallet</Text>
                  </View>
                  <ArrowRight size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <Animated.View
                      style={[
                        styles.loadingSpinner,
                        {
                          transform: [{
                            rotate: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          }],
                        },
                      ]}
                    />
                    <Text style={styles.loadingText}>Connecting wallet...</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Check size={24} color={theme.colors.success} />
                </View>
                <Text style={styles.successTitle}>Wallet Connected!</Text>
                <Text style={styles.successDescription}>
                  Your Algorand wallet is now linked. Rewards will be sent automatically.
                </Text>
                <View style={styles.walletAddress}>
                  <Text style={styles.walletAddressLabel}>Connected Address:</Text>
                  <Text style={styles.walletAddressText}>ALGO...X7K9</Text>
                </View>
              </View>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Sparkles size={40} color={theme.colors.accent} />
              </View>
            </View>
            
            <Text style={styles.stepTitle}>Choose Your Interests</Text>
            <Text style={styles.stepDescription}>
              Select topics you're passionate about. We'll create personalized challenges based on your interests.
            </Text>

            <View style={styles.themesGrid}>
              {themes.map((themeItem) => (
                <TouchableOpacity
                  key={themeItem.id}
                  style={[
                    styles.themeCard,
                    selectedThemes.includes(themeItem.id) && styles.themeCardSelected
                  ]}
                  onPress={() => toggleTheme(themeItem.id)}
                >
                  <Text style={styles.themeEmoji}>{themeItem.emoji}</Text>
                  <Text style={[
                    styles.themeName,
                    selectedThemes.includes(themeItem.id) && styles.themeNameSelected
                  ]}>
                    {themeItem.name}
                  </Text>
                  {selectedThemes.includes(themeItem.id) && (
                    <View style={styles.selectedIndicator}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.selectionHint}>
              Select at least one topic to continue. You can change these later in settings.
            </Text>
          </View>
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
  stepContent: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
  },
  connectButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  walletOptions: {
    gap: 12,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  walletInfo: {
    flex: 1,
    marginLeft: 12,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  walletDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: 12,
    fontSize: 14,
  },
  walletAddress: {
    marginTop: 16,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  walletAddressLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  walletAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 4,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  themeCard: {
    width: (width - 88) / 2,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    position: 'relative',
  },
  themeCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  themeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  themeNameSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionHint: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
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