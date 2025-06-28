import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Wallet, Check, ArrowRight } from "lucide-react-native";
import { useTheme } from '../../../contexts/ThemeContext';

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

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Wallet size={40} color={theme.colors.primary} />
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
              <ArrowRight size={20} color={theme.colors.textSecondary} />
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
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  walletOptions: {
    width: '100%',
    gap: 12,
    position: 'relative',
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
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: 12,
    fontSize: 14,
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
});