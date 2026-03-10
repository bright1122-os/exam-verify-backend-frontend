import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius, Layout } from '../constants/spacing';
import { SearchBar } from '../components/SearchBar';
import { MealCard } from '../components/MealCard';
import { SectionHeader } from '../components/SectionHeader';
import { MEALS, Meal } from '../data/meals';
import { SEARCH_SUGGESTIONS, POPULAR_SEARCHES, CUISINES, MEAL_CATEGORIES } from '../data/categories';

interface MealSearchScreenProps {
  navigation: any;
}

const RECENT_SEARCHES = ['Shakshuka', 'Pasta carbonara', 'Thai curry', 'Salmon bowl'];

export const MealSearchScreen: React.FC<MealSearchScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<Meal[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim().length > 0) {
      const filtered = MEALS.filter(
        m =>
          m.name.toLowerCase().includes(text.toLowerCase()) ||
          m.cuisine.toLowerCase().includes(text.toLowerCase()) ||
          m.tags.some(t => t.toLowerCase().includes(text.toLowerCase())) ||
          m.category.toLowerCase().includes(text.toLowerCase()),
      );
      setResults(filtered);
      setHasSearched(true);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const showResults = query.length > 0 && hasSearched;
  const showEmpty = hasSearched && results.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Discover Meals</Text>
              <Text style={styles.headerSubtitle}>Search by name, cuisine, or mood</Text>
            </View>
            <TouchableOpacity style={styles.voiceBtn} activeOpacity={0.75}>
              <Ionicons name="mic" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <SearchBar
            value={query}
            onChangeText={handleSearch}
            placeholder="Try 'risotto' or 'quick chicken'..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmit={() => Keyboard.dismiss()}
            onClear={() => { setResults([]); setHasSearched(false); }}
            style={styles.searchBar}
          />
        </Animated.View>
      </SafeAreaView>

      {/* Content */}
      {showResults ? (
        // Search Results
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContent}>
          {/* Results header */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              <Text style={styles.resultsCountNum}>{results.length}</Text>
              {' '}result{results.length !== 1 ? 's' : ''} for "{query}"
            </Text>
            <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.75}>
              <Ionicons name="options-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {showEmpty ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>No meals found</Text>
              <Text style={styles.emptyDesc}>
                Try searching with different keywords like a cuisine type or ingredient
              </Text>
              <View style={styles.emptySuggestions}>
                {SEARCH_SUGGESTIONS.slice(0, 4).map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleSuggestion(s)}
                    style={styles.emptySuggPill}
                  >
                    <Text style={styles.emptySuggText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {results.map(meal => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onPress={(m) => navigation.navigate('MealDetail', { mealId: m.id })}
                  variant="horizontal"
                />
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        // Discovery State
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.discoveryContent}>

          {/* Recent Searches */}
          <View style={styles.section}>
            <SectionHeader
              title="Recent Searches"
              actionLabel="Clear all"
              onAction={() => {}}
              style={styles.sectionPad}
            />
            <View style={styles.recentRow}>
              {RECENT_SEARCHES.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSuggestion(s)}
                  style={styles.recentChip}
                  activeOpacity={0.75}
                >
                  <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                  <Text style={styles.recentText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Trending Searches */}
          <View style={styles.section}>
            <SectionHeader
              title="Trending Searches 🔥"
              style={styles.sectionPad}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingScroll}
            >
              {SEARCH_SUGGESTIONS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSuggestion(s)}
                  style={styles.trendingPill}
                  activeOpacity={0.78}
                >
                  <Text style={styles.trendingNum}>#{i + 1}</Text>
                  <Text style={styles.trendingText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Browse by Cuisine */}
          <View style={styles.section}>
            <SectionHeader
              title="Browse by Cuisine"
              style={styles.sectionPad}
            />
            <View style={styles.cuisineGrid}>
              {CUISINES.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSuggestion(c.name)}
                  style={[styles.cuisineCard, Shadows.sm]}
                  activeOpacity={0.82}
                >
                  <Text style={styles.cuisineEmoji}>{c.emoji}</Text>
                  <Text style={styles.cuisineName}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mood-based Picks */}
          <View style={styles.section}>
            <SectionHeader
              title="Search by Mood"
              subtitle="What are you feeling tonight?"
              style={styles.sectionPad}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodScroll}
            >
              {[
                { label: 'Date Night', emoji: '🕯️', color: '#E8704A' },
                { label: 'Quick Dinner', emoji: '⚡', color: '#F5A623' },
                { label: 'Healthy', emoji: '🥗', color: '#22C55E' },
                { label: 'Comfort Food', emoji: '🍜', color: '#8B5CF6' },
                { label: 'Brunch', emoji: '🥞', color: '#EC4899' },
                { label: 'Meal Prep', emoji: '📦', color: '#0EA5E9' },
              ].map((mood, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSuggestion(mood.label)}
                  activeOpacity={0.85}
                  style={[styles.moodCard, { backgroundColor: mood.color + '18' }, Shadows.sm]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Featured Quick Results */}
          <View style={styles.section}>
            <SectionHeader
              title="Popular Right Now"
              actionLabel="View all"
              onAction={() => {}}
              style={styles.sectionPad}
            />
            <FlatList
              data={MEALS.slice(0, 5)}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularList}
              renderItem={({ item }) => (
                <MealCard
                  meal={item}
                  onPress={(m) => navigation.navigate('MealDetail', { mealId: m.id })}
                  variant="compact"
                  style={styles.popularCard}
                />
              )}
            />
          </View>

          {/* Quick Search Tags */}
          <View style={[styles.section, styles.lastSection]}>
            <SectionHeader
              title="Quick Tags"
              style={styles.sectionPad}
            />
            <View style={styles.tagsGrid}>
              {['High Protein', 'Vegan', 'Gluten-Free', 'Under 400 cal', 'One Pan', 'Quick', 'Spicy', 'Date Night', 'Meal Prep', 'Italian', 'Japanese', 'Thai'].map((tag, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSuggestion(tag)}
                  style={styles.quickTag}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickTagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
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

  // Header
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontWeight: '400',
    marginTop: 2,
  },
  voiceBtn: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  searchBar: {
    // overrides
  },

  // Results
  resultsContent: {
    paddingBottom: 32,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 14,
  },
  resultsCount: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  resultsCountNum: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsList: {
    paddingHorizontal: Layout.screenPadding,
    gap: 0,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  emptyDesc: {
    color: Colors.textTertiary,
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.6,
  },
  emptySuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
  },
  emptySuggPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptySuggText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Discovery
  discoveryContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionPad: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 12,
  },

  // Recent
  recentRow: {
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  recentText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },

  // Trending
  trendingScroll: {
    paddingHorizontal: Layout.screenPadding,
    gap: 10,
  },
  trendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  trendingNum: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  trendingText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Cuisines
  cuisineGrid: {
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cuisineCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cuisineEmoji: {
    fontSize: 24,
  },
  cuisineName: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Mood
  moodScroll: {
    paddingHorizontal: Layout.screenPadding,
    gap: 10,
  },
  moodCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: 6,
    minWidth: 90,
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.1,
    textAlign: 'center',
  },

  // Popular
  popularList: {
    paddingHorizontal: Layout.screenPadding,
    gap: 12,
  },
  popularCard: {},

  // Quick Tags
  tagsGrid: {
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  quickTagText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
