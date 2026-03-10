import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius, Layout } from '../constants/spacing';
import { MealCard } from '../components/MealCard';
import { SectionHeader } from '../components/SectionHeader';
import { MEALS, Meal } from '../data/meals';

const { width } = Dimensions.get('window');

interface RecommendationResultsScreenProps {
  navigation: any;
  route: any;
}

const SORT_OPTIONS = ['Best Match', 'Quickest', 'Healthiest', 'Highest Rated'];

function getMockMatchPercent(mealId: string, ingredients: string[]): number {
  // Deterministic mock based on id + ingredient count
  const hash = mealId.charCodeAt(0) + ingredients.length * 7;
  return Math.min(98, Math.max(55, (hash * 13) % 45 + 55));
}

export const RecommendationResultsScreen: React.FC<RecommendationResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const ingredients: string[] = route.params?.ingredients || ['Chicken', 'Garlic', 'Lemon'];
  const [activeSort, setActiveSort] = useState('Best Match');
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Meal[]>([]);

  const loadingAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate AI processing
    const loader = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(loadingAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loader.start();

    const timer = setTimeout(() => {
      loader.stop();
      setIsLoading(false);
      const mealsWithMatch = MEALS.map(m => ({
        ...m,
        matchPercent: getMockMatchPercent(m.id, ingredients),
      })).sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0));
      setResults(mealsWithMatch);

      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const getSortedResults = () => {
    switch (activeSort) {
      case 'Quickest':
        return [...results].sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
      case 'Healthiest':
        return [...results].sort((a, b) => a.calories - b.calories);
      case 'Highest Rated':
        return [...results].sort((a, b) => b.rating - a.rating);
      default:
        return results;
    }
  };

  const sortedResults = getSortedResults();
  const topPick = sortedResults[0];
  const remainingResults = sortedResults.slice(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Your Matches</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Based on: {ingredients.join(', ')}
            </Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.75}>
            <Ionicons name="options-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isLoading ? (
        // Loading State
        <View style={styles.loadingContainer}>
          <View style={styles.aiLoader}>
            <Animated.View style={[styles.aiLoaderInner, { opacity: loadingAnim }]}>
              <LinearGradient
                colors={Colors.gradientWarm as [string, string]}
                style={styles.aiLoaderGradient}
              >
                <Text style={styles.aiLoaderEmoji}>🤖</Text>
              </LinearGradient>
            </Animated.View>
          </View>
          <Text style={styles.loadingTitle}>Analyzing your ingredients...</Text>
          <Text style={styles.loadingDesc}>
            SavorAI is curating personalized meal recommendations from {ingredients.length} ingredient{ingredients.length === 1 ? '' : 's'}
          </Text>
          <View style={styles.ingredientPills}>
            {ingredients.slice(0, 5).map((ing, i) => (
              <View key={i} style={styles.ingPill}>
                <Text style={styles.ingPillText}>{ing}</Text>
              </View>
            ))}
            {ingredients.length > 5 && (
              <View style={styles.ingPill}>
                <Text style={styles.ingPillText}>+{ingredients.length - 5} more</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <Animated.View style={[styles.content, { opacity: contentAnim }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statBlock}>
                <Text style={styles.statNum}>{results.length}</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={styles.statNum}>{ingredients.length}</Text>
                <Text style={styles.statLabel}>Ingredients</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={[styles.statNum, { color: Colors.secondary }]}>
                  {topPick?.matchPercent}%
                </Text>
                <Text style={styles.statLabel}>Top Match</Text>
              </View>
            </View>

            {/* Sort Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortScroll}
              style={styles.sortBar}
            >
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setActiveSort(opt)}
                  style={[styles.sortPill, activeSort === opt && styles.sortPillActive]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.sortText, activeSort === opt && styles.sortTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Top Pick */}
            {topPick && (
              <View style={styles.topPickSection}>
                <View style={styles.topPickHeader}>
                  <View style={styles.topPickBadge}>
                    <Ionicons name="trophy" size={14} color={Colors.accent} />
                    <Text style={styles.topPickBadgeText}>Top Pick for You</Text>
                  </View>
                  <Text style={styles.topPickMatchPct}>{topPick.matchPercent}% match</Text>
                </View>
                <MealCard
                  meal={topPick}
                  onPress={(meal) => navigation.navigate('MealDetail', { mealId: meal.id })}
                  variant="featured"
                />
              </View>
            )}

            {/* Ingredient Match Breakdown */}
            {topPick && (
              <View style={styles.matchBreakdown}>
                <Text style={styles.matchBreakdownTitle}>Ingredient Matches in Top Pick</Text>
                <View style={styles.matchIngredients}>
                  {ingredients.slice(0, 6).map((ing, i) => {
                    const matched = Math.random() > 0.35; // mock match
                    return (
                      <View
                        key={i}
                        style={[
                          styles.matchIngChip,
                          matched && styles.matchIngChipMatched,
                        ]}
                      >
                        <Ionicons
                          name={matched ? 'checkmark-circle' : 'add-circle-outline'}
                          size={13}
                          color={matched ? Colors.secondary : Colors.textTertiary}
                        />
                        <Text
                          style={[
                            styles.matchIngText,
                            matched && styles.matchIngTextMatched,
                          ]}
                        >
                          {ing}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* All Results */}
            <SectionHeader
              title={`All ${sortedResults.length} Recommendations`}
              subtitle={`Sorted by ${activeSort.toLowerCase()}`}
              style={styles.sectionPad}
            />
            <View style={styles.resultsList}>
              {sortedResults.map((meal, index) => (
                <View key={meal.id} style={styles.resultItem}>
                  <View style={styles.resultRank}>
                    <Text style={styles.resultRankNum}>#{index + 1}</Text>
                  </View>
                  <View style={styles.resultCardWrap}>
                    <MealCard
                      meal={meal}
                      onPress={(m) => navigation.navigate('MealDetail', { mealId: m.id })}
                      variant="horizontal"
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 1,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  aiLoader: {
    marginBottom: 8,
  },
  aiLoaderInner: {
    width: 90,
    height: 90,
    borderRadius: 28,
    overflow: 'hidden',
  },
  aiLoaderGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLoaderEmoji: {
    fontSize: 40,
  },
  loadingTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  loadingDesc: {
    color: Colors.textTertiary,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.6,
    textAlign: 'center',
  },
  ingredientPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
  },
  ingPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  ingPillText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Layout.screenPadding,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNum: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  statLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderLight,
  },

  // Sort
  sortBar: {
    marginBottom: 16,
  },
  sortScroll: {
    paddingHorizontal: Layout.screenPadding,
    gap: 8,
  },
  sortPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  sortPillActive: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  sortText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  sortTextActive: {
    color: Colors.textInverse,
  },

  // Top Pick
  topPickSection: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 20,
  },
  topPickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topPickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.full,
  },
  topPickBadgeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  topPickMatchPct: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },

  // Match breakdown
  matchBreakdown: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  matchBreakdownTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 12,
  },
  matchIngredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  matchIngChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  matchIngChipMatched: {
    backgroundColor: Colors.secondaryMuted,
    borderColor: Colors.secondary + '40',
  },
  matchIngText: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  matchIngTextMatched: {
    color: Colors.secondary,
  },

  // Results List
  sectionPad: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 12,
  },
  resultsList: {
    paddingHorizontal: Layout.screenPadding,
    gap: 0,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  resultRank: {
    width: 28,
    paddingTop: 10,
    alignItems: 'center',
  },
  resultRankNum: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  resultCardWrap: {
    flex: 1,
  },
});
