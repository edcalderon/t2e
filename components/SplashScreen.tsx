import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

export default function SplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotating animation for the logo
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();

    // Auto-complete after 2 seconds (reduced from 3)
    const timer = setTimeout(() => {
      console.log('🎬 Splash screen animation complete');
      onAnimationComplete();
    }, 2000);

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      clearTimeout(timer);
    };
  }, [pulseAnim, rotateAnim, fadeAnim, onAnimationComplete]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View 
        style={[
          styles.logoContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Animated.View 
          style={[
            styles.logo,
            { transform: [{ rotate: spin }] }
          ]}
        >
          <Text style={styles.logoText}>X</Text>
        </Animated.View>
      </Animated.View>
      
      <Text style={styles.title}>XQuests</Text>
      <Text style={styles.subtitle}>Tweet. Engage. Earn.</Text>
      
      <View style={styles.spinnerContainer}>
        <View style={styles.spinner} />
      </View>
      
      <Text style={styles.loadingText}>Loading your experience...</Text>
      <Text style={styles.loadingSubtext}>Connecting to the future of social engagement</Text>
      
      <View style={styles.featuresContainer}>
        {[
          '🐦 Connect your X account',
          '💰 Earn ALGO rewards',
          '🏆 Complete challenges',
          '📈 Track your progress'
        ].map((feature, index) => (
          <Animated.View 
            key={index} 
            style={[
              styles.feature,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.featureIcon}>
              <Text>{feature.split(' ')[0]}</Text>
            </View>
            <Text style={styles.featureText}>{feature.split(' ').slice(1).join(' ')}</Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#1D9BF0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D9BF0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1D9BF0',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
    fontWeight: '500',
  },
  spinnerContainer: {
    marginBottom: 20,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(29, 155, 240, 0.3)',
    borderTopColor: '#1D9BF0',
  },
  loadingText: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 8,
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(29, 155, 240, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});