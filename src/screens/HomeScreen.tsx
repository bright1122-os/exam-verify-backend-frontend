import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius, Layout, Spacing } from '../constants/spacing';
import { MealCard } from '../components/MealCard';
import { CategoryCard } from '../components/CategoryCard';
import { SectionHeader } from '../components/SectionHeader';
import { MEALS, TRENDING_MEALS, QUICK_MEALS } from '../data/meals';
import { MEAL_CATEGORIES } from '../data/categories';

const { width } = Dimensions.get('window');

const GREETING_ITEMS = [
  { time: [0, 12], label: 'Good morning', emoji: '☀️' },
  { time: [12, 17], label: 'Good afternoon', emoji: '🌤️' },
  { time: [17, 21], label: 'Good evening', emoji: '🌆' },
  { time: [21, 24], label: 'Good night', emoji: '🌙' },
];

function getGreeting() {
  const hour = new Date().getHours();
  const item = GREETING_ITEMS.find(g => hour >= g.time[0] && hour < g.time[1]);
  return item || GREETING_ITEMS[0];
}

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const greeting = getGreeting();
  const featuredMeal = TRENDING_MEALS[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerLogo}>
                <Ionicons name="restaurant" size={16} color={Colors.textInverse} />
              </View>
              <View>
                <Text style={styles.greeting}>{greeting.emoji} {greeting.label}</Text>
                <Text style={styles.headerTitle}>SavorAI</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerBtn} activeOpacity={0.75}>
                <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerAvatarBtn} activeOpacity={0.75}>
                <Text style={styles.headerAvatarEmoji}>👤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Primary Action Cards */}
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>What would you like to do?</Text>
          <View style={styles.actionRow}>
            {/* Discover by Ingredients */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Ingredients')}
              activeOpacity={0.88}
              style={[styles.actionCard, Shadows.lg]}
            >
              <LinearGradient
                colors={Colors.gradientWarm as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionCardGradient}
              >
                <View style={styles.actionIconWrap}>
                  <Text style={styles.actionEmoji}>🥦</Text>
                </View>
                <Text style={styles.actionCardTitle}>Discover{'\n'}from Ingredients</Text>
                <Text style={styles.actionCardDesc}>Tell us what you have</Text>
                <View style={styles.actionCardArrow}>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Search a Meal */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.88}
              style={[styles.actionCard, Shadows.md]}
            >
              <LinearGradient
                colors={['#F0FBF5', '#E0F5EA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIconWrap, styles.actionIconGreen]}>
                  <Text style={styles.actionEmoji}>🔍</Text>
                </View>
                <Text style={[styles.actionCardTitle, styles.actionCardTitleDark]}>Search a{'\n'}Meal</Text>
                <Text style={[styles.actionCardDesc, styles.actionCardDescDark]}>Find your craving</Text>
                <View style={[styles.actionCardArrow, styles.actionCardArrowGreen]}>
                  <Ionicons name="arrow-forward" size={14} color={Colors.secondary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Meal */}
        {featuredMeal && (
          <View style={styles.section}>
            <SectionHeader
              title="Today's Pick"
              subtitle="Curated by SavorAI"
              actionLabel="See all"
              onAction={() => {}}
              style={styles.sectionPadding}
            />
            <View style={styles.featuredPadding}>
              <MealCard
                meal={featuredMeal}
                onPress={(meal) => navigation.navigate('MealDetail', { mealId: meal.id })}
                variant="featured"
              />
            </View>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader
            title="Browse Categories"
            subtitle="Find meals by mood or goal"
            style={styles.sectionPadding}
          />
          <FlatList
            data={MEAL_CATEGORIES}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => {}}
                style={styles.categoryItem}
              />
            )}
          />
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <SectionHeader
            title="Trending Now 🔥"
            subtitle={`${TRENDING_MEALS.length} hot dishes this week`}
            actionLabel="View all"
            onAction={() => {}}
            style={styles.sectionPadding}
          />
          <FlatList
            data={TRENDING_MEALS}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <MealCard
                meal={item}
                onPress={(meal) => navigation.navigate('MealDetail', { mealId: meal.id })}
                variant="standard"
                style={styles.standardCardItem}
              />
            )}
          />
        </View>

        {/* Quick Dinners */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Dinners ⚡"
            subtitle="Ready in 30 minutes or less"
            actionLabel="View all"
            onAction={() => {}}
            style={styles.sectionPadding}
          />
          <FlatList
            data={QUICK_MEALS.slice(0, 4)}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <MealCard
                meal={item}
                onPress={(meal) => navigation.navigate('MealDetail', { mealId: meal.id })}
                variant="compact"
                style={styles.compactCardItem}
              />
            )}
          />
        </View>

        {/* Editor's Collection */}
        <View style={styles.section}>
          <SectionHeader
            title="Editor's Collection"
            subtitle="Handpicked fine dining recipes"
            style={styles.sectionPadding}
          />
          <View style={styles.editorsCollection}>
            {MEALS.filter(m => m.difficulty === 'Hard').slice(0, 3).map((meal, index) => (
              <TouchableOpacity
                key={meal.id}
                onPress={() => navigation.navigate('MealDetail', { mealId: meal.id })}
                style={[styles.editorCard, Shadows.card]}
                activeOpacity={0.88}
              >
                <Image
                  source={{ uri: meal.image }}
                  style={styles.editorImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(26,18,7,0.72)']}
                  style={styles.editorGradient}
                />
                <View style={styles.editorContent}>
                  <View style={styles.editorBadge}>
                    <Text style={styles.editorBadgeText}>{meal.cuisine}</Text>
                  </View>
                  <Text style={styles.editorTitle}>{meal.name}</Text>
                  <View style={styles.editorMeta}>
                    <Ionicons name="star" size={12} color={Colors.accent} />
                    <Text style={styles.editorMetaText}>{meal.rating}</Text>
                    <Text style={styles.editorMetaDivider}>·</Text>
                    <Text style={styles.editorMetaText}>{meal.prepTime + meal.cookTime} min</Text>
                    <Text style={styles.editorMetaDivider}>·</Text>
                    <Text style={styles.editorMetaText}>by {meal.chef}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Promo Banner */}
        <View style={styles.promoPadding}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Ingredients')}
            activeOpacity={0.90}
          >
            <LinearGradient
              colors={Colors.gradientDark as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.promoBanner, Shadows.lg]}
            >
              <View style={styles.promoLeft}>
                <Text style={styles.promoLabel}>✨ AI-Powered</Text>
                <Text style={styles.promoTitle}>Fridge to Table</Text>
                <Text style={styles.promoDesc}>Enter 3 ingredients and get 12+ curated meal ideas instantly</Text>
              </View>
              <View style={styles.promoRight}>
                <View style={styles.promoIconCircle}>
                  <Text style={styles.promoEmoji}>🤖</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Healthy Picks */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader
            title="Healthy & Light 🥗"
            subtitle="Under 400 calories per serving"
            actionLabel="View all"
            onAction={() => {}}
            style={styles.sectionPadding}
          />
          <FlatList
            data={MEALS.filter(m => m.calories <= 400).slice(0, 5)}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <MealCard
                meal={item}
                onPress={(meal) => navigation.navigate('MealDetail', { mealId: meal.id })}
                variant="standard"
                style={styles.standardCardItem}
              />
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  safeHeader: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 12,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  headerAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarEmoji: {
    fontSize: 18,
  },

  // Action Section
  actionSection: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 16,
  },
  actionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    height: 170,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  actionCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,251,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconGreen: {
    backgroundColor: 'rgba(45,106,79,0.12)',
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionCardTitle: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: FontSize.md * 1.2,
    flex: 1,
    marginTop: 8,
  },
  actionCardTitleDark: {
    color: Colors.textPrimary,
  },
  actionCardDesc: {
    color: 'rgba(255,251,247,0.72)',
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginBottom: 8,
  },
  actionCardDescDark: {
    color: Colors.textTertiary,
  },
  actionCardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,251,247,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  actionCardArrowGreen: {
    backgroundColor: 'rgba(45,106,79,0.12)',
  },

  // Sections
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionPadding: {
    paddingHorizontal: Layout.screenPadding,
  },
  featuredPadding: {
    paddingHorizontal: Layout.screenPadding,
  },
  horizontalList: {
    paddingHorizontal: Layout.screenPadding,
    gap: 12,
  },
  categoryList: {
    paddingHorizontal: Layout.screenPadding,
    gap: 10,
  },
  categoryItem: {},
  standardCardItem: {},
  compactCardItem: {},

  // Editors Collection
  editorsCollection: {
    paddingHorizontal: Layout.screenPadding,
    gap: 12,
  },
  editorCard: {
    height: 120,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: Colors.darkCard,
  },
  editorImage: {
    width: 120,
    height: '100%',
  },
  editorGradient: {
    position: 'absolute',
    left: 80,
    top: 0,
    bottom: 0,
    width: 60,
  },
  editorContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  editorBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.full,
  },
  editorBadgeText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  editorTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    lineHeight: FontSize.base * 1.3,
    marginVertical: 4,
  },
  editorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editorMetaText: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  editorMetaDivider: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },

  // Promo Banner
  promoPadding: {
    paddingHorizontal: Layout.screenPadding,
    marginTop: 16,
    marginBottom: 8,
  },
  promoBanner: {
    borderRadius: BorderRadius.xl,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoLeft: {
    flex: 1,
    gap: 4,
  },
  promoLabel: {
    color: Colors.primaryLight,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  promoTitle: {
    color: Colors.textInverse,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  promoDesc: {
    color: 'rgba(255,251,247,0.60)',
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.55,
    marginTop: 2,
  },
  promoRight: {
    marginLeft: 16,
  },
  promoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,251,247,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,251,247,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoEmoji: {
    fontSize: 28,
  },
});

