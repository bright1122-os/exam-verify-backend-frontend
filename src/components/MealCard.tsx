import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/colors';
import { Typography, FontSize } from '../constants/typography';
import { BorderRadius, Spacing, Layout } from '../constants/spacing';
import { Meal } from '../data/meals';

const { width } = Dimensions.get('window');

interface MealCardProps {
  meal: Meal;
  onPress: (meal: Meal) => void;
  variant?: 'featured' | 'standard' | 'compact' | 'horizontal';
  style?: object;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onPress,
  variant = 'standard',
  style,
}) => {
  if (variant === 'featured') {
    return (
      <TouchableOpacity
        onPress={() => onPress(meal)}
        style={[styles.featuredCard, Shadows.lg, style]}
        activeOpacity={0.92}
      >
        <Image
          source={{ uri: meal.image }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(26,18,7,0.6)', 'rgba(26,18,7,0.92)']}
          style={styles.featuredGradient}
        />
        {meal.isTrending && (
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingText}>🔥 Trending</Text>
          </View>
        )}
        <View style={styles.featuredContent}>
          <View style={styles.featuredMeta}>
            <Text style={styles.cuisineLabel}>{meal.cuisine}</Text>
          </View>
          <Text style={styles.featuredTitle}>{meal.name}</Text>
          <Text style={styles.featuredDesc} numberOfLines={2}>{meal.description}</Text>
          <View style={styles.featuredStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,251,247,0.8)" />
              <Text style={styles.statText}>{meal.prepTime + meal.cookTime} min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={14} color="rgba(255,251,247,0.8)" />
              <Text style={styles.statText}>{meal.calories} kcal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={13} color={Colors.accent} />
              <Text style={styles.statText}>{meal.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        onPress={() => onPress(meal)}
        style={[styles.horizontalCard, Shadows.card, style]}
        activeOpacity={0.90}
      >
        <Image
          source={{ uri: meal.image }}
          style={styles.horizontalImage}
          resizeMode="cover"
        />
        <View style={styles.horizontalContent}>
          <View style={styles.horizontalTop}>
            <View style={styles.difficultyPill}>
              <Text style={styles.difficultyText}>{meal.difficulty}</Text>
            </View>
            {meal.matchPercent && (
              <View style={styles.matchPill}>
                <Text style={styles.matchText}>{meal.matchPercent}% match</Text>
              </View>
            )}
          </View>
          <Text style={styles.horizontalTitle} numberOfLines={2}>{meal.name}</Text>
          <Text style={styles.horizontalDesc} numberOfLines={2}>{meal.description}</Text>
          <View style={styles.horizontalStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.statTextDark}>{meal.prepTime + meal.cookTime}m</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.statTextDark}>{meal.servings}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={13} color={Colors.accent} />
              <Text style={styles.statTextDark}>{meal.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={() => onPress(meal)}
        style={[styles.compactCard, Shadows.sm, style]}
        activeOpacity={0.90}
      >
        <Image
          source={{ uri: meal.image }}
          style={styles.compactImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(26,18,7,0.80)']}
          style={styles.compactGradient}
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>{meal.name}</Text>
          <View style={styles.compactStats}>
            <Ionicons name="time-outline" size={12} color="rgba(255,251,247,0.75)" />
            <Text style={styles.compactTime}>{meal.prepTime + meal.cookTime}m</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Standard variant
  return (
    <TouchableOpacity
      onPress={() => onPress(meal)}
      style={[styles.standardCard, Shadows.card, style]}
      activeOpacity={0.90}
    >
      <Image
        source={{ uri: meal.image }}
        style={styles.standardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(26,18,7,0.55)']}
        style={styles.standardImageGradient}
      />
      {meal.isTrending && (
        <View style={styles.standardBadge}>
          <Ionicons name="flame" size={11} color="#fff" />
        </View>
      )}
      <View style={styles.standardContent}>
        <View style={styles.standardHeader}>
          <Text style={styles.standardCuisine}>{meal.cuisine}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={Colors.accent} />
            <Text style={styles.ratingText}>{meal.rating}</Text>
          </View>
        </View>
        <Text style={styles.standardTitle} numberOfLines={2}>{meal.name}</Text>
        <View style={styles.standardFooter}>
          <View style={styles.statItemSmall}>
            <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.statTextSm}>{meal.prepTime + meal.cookTime} min</Text>
          </View>
          <View style={styles.statItemSmall}>
            <Ionicons name="flame-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.statTextSm}>{meal.calories} kcal</Text>
          </View>
          <View style={[styles.difficultyTagSmall, meal.difficulty === 'Easy' && styles.easyTag]}>
            <Text style={styles.difficultyTagText}>{meal.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Featured Card
  featuredCard: {
    width: width - Layout.screenPadding * 2,
    height: 380,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.darkCard,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
  },
  trendingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(26,18,7,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backdropFilter: 'blur(8px)',
  },
  trendingText: {
    color: Colors.textInverse,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredMeta: {
    marginBottom: 6,
  },
  cuisineLabel: {
    color: Colors.primaryLight,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: Colors.textInverse,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: FontSize['2xl'] * 1.15,
    marginBottom: 8,
  },
  featuredDesc: {
    color: 'rgba(255,251,247,0.75)',
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.55,
    marginBottom: 16,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'rgba(255,251,247,0.85)',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,251,247,0.25)',
    marginHorizontal: 12,
  },

  // Horizontal Card
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 12,
  },
  horizontalImage: {
    width: 110,
    height: 130,
  },
  horizontalContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  horizontalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  difficultyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  matchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.secondaryMuted,
    borderRadius: BorderRadius.full,
  },
  matchText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  horizontalTitle: {
    ...Typography.h4,
    marginBottom: 4,
    lineHeight: FontSize.md * 1.3,
  },
  horizontalDesc: {
    ...Typography.bodySmall,
    lineHeight: FontSize.sm * 1.45,
    marginBottom: 8,
    flex: 1,
  },
  horizontalStats: {
    flexDirection: 'row',
    gap: 14,
  },
  statTextDark: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginLeft: 3,
  },

  // Compact Card
  compactCard: {
    width: 155,
    height: 195,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.darkCard,
  },
  compactImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  compactGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  compactContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  compactTitle: {
    color: Colors.textInverse,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: FontSize.sm * 1.3,
    marginBottom: 6,
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  compactTime: {
    color: 'rgba(255,251,247,0.75)',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Standard Card
  standardCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  standardImage: {
    width: '100%',
    height: 130,
  },
  standardImageGradient: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 44,
  },
  standardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardContent: {
    padding: 12,
  },
  standardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  standardCuisine: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  standardTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: FontSize.sm * 1.35,
    marginBottom: 10,
  },
  standardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statTextSm: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  difficultyTagSmall: {
    marginLeft: 'auto',
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.full,
  },
  easyTag: {
    backgroundColor: Colors.secondaryMuted,
  },
  difficultyTagText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
