import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Sparkles, Check } from "lucide-react-native";
import { useTheme } from '../../../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface InterestsStepProps {
  selectedThemes: string[];
  onThemeToggle: (themeId: string) => void;
}

export default function InterestsStep({ selectedThemes, onThemeToggle }: InterestsStepProps) {
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnims] = useState(
    Array.from({ length: 8 }, () => new Animated.Value(1))
  );

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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleThemePress = (themeId: string, index: number) => {
    // Animate the card press
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onThemeToggle(themeId);
  };

  const styles = createStyles(theme, isMobile);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Sparkles size={isMobile ? 36 : 40} color={theme.colors.accent} />
        </View>
      </View>
      
      <Text style={styles.title}>Choose Your Interests</Text>
      <Text style={styles.description}>
        Select topics you're passionate about. We'll create personalized challenges based on your interests.
      </Text>

      <View style={styles.themesGrid}>
        {themes.map((themeItem, index) => (
          <Animated.View
            key={themeItem.id}
            style={[
              styles.themeCardWrapper,
              { transform: [{ scale: scaleAnims[index] }] }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.themeCard,
                selectedThemes.includes(themeItem.id) && styles.themeCardSelected
              ]}
              onPress={() => handleThemePress(themeItem.id, index)}
              activeOpacity={0.8}
            >
              <Text style={styles.themeEmoji}>{themeItem.emoji}</Text>
              <Text style={[
                styles.themeName,
                selectedThemes.includes(themeItem.id) && styles.themeNameSelected
              ]}>
                {themeItem.name}
              </Text>
              {selectedThemes.includes(themeItem.id) && (
                <Animated.View 
                  style={styles.selectedIndicator}
                  entering={fadeAnim}
                >
                  <Check size={isMobile ? 14 : 16} color="#FFFFFF" />
                </Animated.View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.selectionHint}>
        Select at least one topic to continue. You can change these later in settings.
      </Text>
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
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isMobile ? 8 : 12,
    marginBottom: isMobile ? 20 : 24,
    paddingHorizontal: isMobile ? 8 : 16,
  },
  themeCardWrapper: {
    width: isMobile ? Math.min((width - 64) / 2, 140) : Math.min((width - 80) / 2, 160),
    minWidth: isMobile ? 120 : 140,
  },
  themeCard: {
    padding: isMobile ? 12 : 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: isMobile ? 10 : 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    position: 'relative',
    minHeight: isMobile ? 80 : 100,
    justifyContent: 'center',
    width: '100%',
  },
  themeCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  themeEmoji: {
    fontSize: isMobile ? 20 : 24,
    marginBottom: isMobile ? 6 : 8,
  },
  themeName: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: isMobile ? 16 : 18,
  },
  themeNameSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: isMobile ? 6 : 8,
    right: isMobile ? 6 : 8,
    width: isMobile ? 18 : 20,
    height: isMobile ? 18 : 20,
    borderRadius: isMobile ? 9 : 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionHint: {
    fontSize: isMobile ? 10 : 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: isMobile ? 14 : 16,
    paddingHorizontal: isMobile ? 16 : 20,
  },
});