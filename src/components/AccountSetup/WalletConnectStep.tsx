import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Wallet, Check, ArrowRight } from "lucide-react-native";
import { useTheme } from '../../../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface WalletConnectStepProps {
  onConnect: (connected: boolean) => void;
  isConnected: boolean;
}

export default function WalletConnectStep({ onConnect, isConnected }: WalletConnectStepProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleWalletConnect = async () => {
    setIsLoading(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      onConnect(true);
      setIsLoading(false);
    }, 1500);
  };

  const walletOptions = [
    {
      name: "MyAlgo Wallet",
      description: "Secure web wallet for Algorand",
      icon: "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2"
    },
    {
      name: "Pera Wallet",
      description: "Mobile-first Algorand wallet",
      icon: "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2"
    },
    {
      name: "AlgoSigner",
      description: "Browser extension wallet",
      icon: "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2"
    }
  ];

  const styles = createStyles(theme, isMobile);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Wallet size={isMobile ? 36 : 40} color={theme.colors.primary} />
        </View>
      </View>
      
      <Text style={styles.title}>Connect Algorand Wallet</Text>
      <Text style={styles.description}>
        Link your Algorand wallet to receive ALGO token rewards automatically when you complete challenges
      </Text>

      {!isConnected ? (
        <View style={styles.walletOptions}>
          {walletOptions.map((wallet, index) => (
            <TouchableOpacity
              key={index}
              style={styles.walletOption}
              onPress={handleWalletConnect}
              disabled={isLoading}
            >
              <Image
                source={{ uri: wallet.icon }}
                style={styles.walletIcon}
              />
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{wallet.name}</Text>
                <Text style={styles.walletDescription}>{wallet.description}</Text>
              </View>
              <ArrowRight size={isMobile ? 18 : 20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}

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
            <Check size={isMobile ? 20 : 24} color={theme.colors.success} />
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
    </Animated.View>
  );
}

const createStyles = (theme: any, isMobile: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: isMobile ? 16 : 20,
    paddingHorizontal: isMobile ? 8 : 0,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: isMobile ? 20 : 24,
  },
  iconBackground: {
    width: isMobile ? 70 : 80,
    height: isMobile ? 70 : 80,
    borderRadius: isMobile ? 35 : 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: isMobile ? 8 : 12,
    paddingHorizontal: isMobile ? 16 : 0,
  },
  description: {
    fontSize: isMobile ? 14 : 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isMobile ? 20 : 24,
    marginBottom: isMobile ? 24 : 32,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  walletOptions: {
    width: '100%',
    gap: isMobile ? 8 : 12,
    position: 'relative',
    paddingHorizontal: isMobile ? 8 : 0,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isMobile ? 12 : 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: isMobile ? 10 : 12,
    backgroundColor: theme.colors.surface,
  },
  walletIcon: {
    width: isMobile ? 32 : 40,
    height: isMobile ? 32 : 40,
    borderRadius: isMobile ? 16 : 20,
  },
  walletInfo: {
    flex: 1,
    marginLeft: isMobile ? 8 : 12,
  },
  walletName: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  walletDescription: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: isMobile ? 8 : 0,
    right: isMobile ? 8 : 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: isMobile ? 10 : 12,
  },
  loadingSpinner: {
    width: isMobile ? 16 : 20,
    height: isMobile ? 16 : 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopColor: 'transparent',
    borderRadius: isMobile ? 8 : 10,
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: isMobile ? 8 : 12,
    fontSize: isMobile ? 12 : 14,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: isMobile ? 16 : 20,
    paddingHorizontal: isMobile ? 16 : 0,
  },
  successIcon: {
    width: isMobile ? 50 : 60,
    height: isMobile ? 50 : 60,
    borderRadius: isMobile ? 25 : 30,
    backgroundColor: theme.colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isMobile ? 12 : 16,
  },
  successTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: isMobile ? 6 : 8,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: isMobile ? 12 : 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isMobile ? 18 : 20,
    marginBottom: isMobile ? 12 : 16,
  },
  walletAddress: {
    marginTop: isMobile ? 12 : 16,
    padding: isMobile ? 10 : 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  walletAddressLabel: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.textSecondary,
  },
  walletAddressText: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 4,
  },
});