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

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Sparkles size={40} color={theme.colors.accent} />
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
                  <Check size={16} color="#FFFFFF" />
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
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  themeCardWrapper: {
    width: (width - 88) / 2,
  },
  themeCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    position: 'relative',
    minHeight: 100,
    justifyContent: 'center',
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
    paddingHorizontal: 20,
  },
});