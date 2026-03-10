import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius, Layout } from '../constants/spacing';
import { NutritionBadge } from '../components/NutritionBadge';
import { MealCard } from '../components/MealCard';
import { PremiumButton } from '../components/PremiumButton';
import { getMealById, MEALS, Meal } from '../data/meals';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.52;

interface MealDetailScreenProps {
  navigation: any;
  route: any;
}

const TABS = ['Overview', 'Ingredients', 'Steps', 'Nutrition'];

export const MealDetailScreen: React.FC<MealDetailScreenProps> = ({ navigation, route }) => {
  const mealId = route.params?.mealId || '1';
  const meal = getMealById(mealId) || MEALS[0];
  const [isSaved, setIsSaved] = useState(meal.isSaved || false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 100, HERO_HEIGHT - 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.1, 1],
    extrapolate: 'clamp',
  });

  const similarMeals = meal.similarMeals
    .map(id => getMealById(id))
    .filter(Boolean) as Meal[];

  const adjustedServings = meal.servings * servingMultiplier;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Floating Header (appears on scroll) */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.floatingHeaderInner}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.headerBtn, styles.headerBtnDark]}
              activeOpacity={0.80}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.floatingTitle} numberOfLines={1}>{meal.name}</Text>
            <TouchableOpacity
              onPress={() => setIsSaved(!isSaved)}
              style={[styles.headerBtn, styles.headerBtnDark]}
              activeOpacity={0.80}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? Colors.primary : Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Animated.View style={[styles.heroImageWrap, { transform: [{ scale: heroScale }] }]}>
            <Image source={{ uri: meal.image }} style={styles.heroImage} resizeMode="cover" />
          </Animated.View>

          {/* Hero Gradient */}
          <LinearGradient
            colors={['rgba(26,18,7,0.10)', 'rgba(26,18,7,0.40)', 'rgba(26,18,7,0.90)', Colors.dark]}
            locations={[0, 0.4, 0.75, 1]}
            style={styles.heroGradient}
          />

          {/* Top Controls */}
          <SafeAreaView edges={['top']} style={styles.heroControls}>
            <View style={styles.heroControlsRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.heroBtn}
                activeOpacity={0.80}
              >
                <Ionicons name="chevron-back" size={22} color={Colors.textInverse} />
              </TouchableOpacity>
              <View style={styles.heroRightBtns}>
                <TouchableOpacity style={styles.heroBtn} activeOpacity={0.80}>
                  <Ionicons name="share-outline" size={20} color={Colors.textInverse} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsSaved(!isSaved)}
                  style={styles.heroBtn}
                  activeOpacity={0.80}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={isSaved ? Colors.accent : Colors.textInverse}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            {/* Cuisine & Tags */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.heroTagsRow}
              style={styles.heroTagsScroll}
            >
              <View style={styles.cuisineTag}>
                <Text style={styles.cuisineTagText}>{meal.cuisine}</Text>
              </View>
              {meal.tags.slice(0, 3).map((tag, i) => (
                <View key={i} style={styles.heroTag}>
                  <Text style={styles.heroTagText}>{tag}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Title */}
            <Text style={styles.heroTitle}>{meal.name}</Text>

            {/* Stats Row */}
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <View style={styles.heroStatIcon}>
                  <Ionicons name="star" size={14} color={Colors.accent} />
                </View>
                <View>
                  <Text style={styles.heroStatValue}>{meal.rating}</Text>
                  <Text style={styles.heroStatLabel}>{meal.reviewCount.toLocaleString()} reviews</Text>
                </View>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <View style={styles.heroStatIcon}>
                  <Ionicons name="time-outline" size={14} color={Colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.heroStatValue}>{meal.prepTime + meal.cookTime} min</Text>
                  <Text style={styles.heroStatLabel}>{meal.prepTime}m prep · {meal.cookTime}m cook</Text>
                </View>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <View style={styles.heroStatIcon}>
                  <Ionicons name="speedometer-outline" size={14} color={Colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.heroStatValue}>{meal.difficulty}</Text>
                  <Text style={styles.heroStatLabel}>difficulty</Text>
                </View>
              </View>
            </View>

            {/* Chef line */}
            {meal.chef && (
              <View style={styles.chefRow}>
                <View style={styles.chefAvatar}>
                  <Text style={styles.chefAvatarEmoji}>👨‍🍳</Text>
                </View>
                <Text style={styles.chefText}>by <Text style={styles.chefName}>{meal.chef}</Text></Text>
              </View>
            )}
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.mainCard}>
          {/* Tab Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
            style={styles.tabBarScroll}
          >
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <View style={styles.tabContent}>
              {/* Description */}
              <View style={styles.descriptionBox}>
                <Text style={styles.description}>{meal.description}</Text>
              </View>

              {/* Quick Stats Grid */}
              <View style={styles.quickStatsGrid}>
                {[
                  { icon: 'people-outline', label: 'Servings', value: String(adjustedServings), color: Colors.secondary },
                  { icon: 'flame-outline', label: 'Calories', value: String(meal.calories * servingMultiplier), color: Colors.primary },
                  { icon: 'time-outline', label: 'Total Time', value: `${meal.prepTime + meal.cookTime}m`, color: Colors.accent },
                  { icon: 'barbell-outline', label: 'Protein', value: `${meal.protein * servingMultiplier}g`, color: '#8B5CF6' },
                ].map((stat, i) => (
                  <View key={i} style={[styles.quickStat, Shadows.sm]}>
                    <View style={[styles.quickStatIcon, { backgroundColor: stat.color + '18' }]}>
                      <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                    </View>
                    <Text style={styles.quickStatValue}>{stat.value}</Text>
                    <Text style={styles.quickStatLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* Serving Adjuster */}
              <View style={styles.servingAdjuster}>
                <Text style={styles.servingTitle}>Adjust Servings</Text>
                <View style={styles.servingControls}>
                  <TouchableOpacity
                    onPress={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                    style={styles.servingBtn}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="remove" size={20} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <View style={styles.servingValue}>
                    <Text style={styles.servingNum}>{adjustedServings}</Text>
                    <Text style={styles.servingUnit}>servings</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setServingMultiplier(Math.min(4, servingMultiplier + 0.5))}
                    style={styles.servingBtn}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="add" size={20} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mood tags */}
              <View style={styles.moodSection}>
                <Text style={styles.moodSectionTitle}>Perfect for</Text>
                <View style={styles.moodTags}>
                  {meal.mood.map((m, i) => (
                    <View key={i} style={styles.moodTag}>
                      <Text style={styles.moodTagText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Ingredients Tab */}
          {activeTab === 'Ingredients' && (
            <View style={styles.tabContent}>
              <View style={styles.ingredientHeader}>
                <Text style={styles.ingredientCount}>
                  {meal.ingredients.length} ingredients
                </Text>
                <View style={styles.servingBadge}>
                  <Text style={styles.servingBadgeText}>for {adjustedServings} servings</Text>
                </View>
              </View>

              {/* Group by category */}
              {Array.from(new Set(meal.ingredients.map(i => i.category))).map(cat => (
                <View key={cat} style={styles.ingredientGroup}>
                  <Text style={styles.ingredientGroupTitle}>{cat}</Text>
                  {meal.ingredients
                    .filter(i => i.category === cat)
                    .map((ing, idx) => (
                      <View key={idx} style={styles.ingredientRow}>
                        <View style={styles.ingredientDot} />
                        <View style={styles.ingredientInfo}>
                          <Text style={styles.ingredientName}>{ing.name}</Text>
                        </View>
                        <Text style={styles.ingredientAmount}>
                          {ing.amount && ing.unit
                            ? `${ing.amount} ${ing.unit}`
                            : ing.amount || ing.unit || '—'}
                        </Text>
                      </View>
                    ))}
                </View>
              ))}

              <PremiumButton
                label="Add to Shopping List"
                onPress={() => {}}
                variant="secondary"
                icon="cart-outline"
                iconPosition="left"
                fullWidth
                style={styles.shoppingBtn}
              />
            </View>
          )}

          {/* Steps Tab */}
          {activeTab === 'Steps' && (
            <View style={styles.tabContent}>
              <View style={styles.stepsHeader}>
                <Text style={styles.stepsCount}>{meal.steps.length} steps</Text>
                <Text style={styles.stepsTime}>{meal.prepTime + meal.cookTime} min total</Text>
              </View>

              {meal.steps.map((step, idx) => (
                <View key={idx} style={styles.stepCard}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepNumber, idx === 0 && styles.stepNumberActive]}>
                      <Text style={[styles.stepNum, idx === 0 && styles.stepNumActive]}>
                        {idx + 1}
                      </Text>
                    </View>
                    {idx < meal.steps.length - 1 && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepLabel}>Step {idx + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Nutrition Tab */}
          {activeTab === 'Nutrition' && (
            <View style={styles.tabContent}>
              <Text style={styles.nutritionNote}>
                Per serving · {adjustedServings} serving{adjustedServings !== 1 ? 's' : ''} total
              </Text>

              <NutritionBadge
                calories={meal.calories}
                protein={meal.protein}
                carbs={meal.carbs}
                fat={meal.fat}
                fiber={meal.fiber}
                variant="grid"
              />

              {/* Detailed Breakdown */}
              <View style={styles.nutritionDetail}>
                {[
                  { label: 'Calories', value: meal.calories, unit: 'kcal', percent: 24, color: Colors.primary },
                  { label: 'Total Fat', value: meal.fat, unit: 'g', percent: 28, color: '#F59E0B' },
                  { label: 'Total Carbs', value: meal.carbs, unit: 'g', percent: 22, color: Colors.accent },
                  { label: 'Protein', value: meal.protein, unit: 'g', percent: 84, color: Colors.secondary },
                  { label: 'Fiber', value: meal.fiber || 0, unit: 'g', percent: 36, color: '#8B5CF6' },
                ].map((item, i) => (
                  <View key={i} style={styles.nutritionRow}>
                    <View style={styles.nutritionLeft}>
                      <View style={[styles.nutritionDot, { backgroundColor: item.color }]} />
                      <Text style={styles.nutritionLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.nutritionRight}>
                      <View style={styles.nutritionBar}>
                        <View
                          style={[
                            styles.nutritionBarFill,
                            { width: `${item.percent}%`, backgroundColor: item.color },
                          ]}
                        />
                      </View>
                      <Text style={styles.nutritionValue}>
                        {item.value}{item.unit}
                      </Text>
                      <Text style={styles.nutritionPercent}>{item.percent}%</Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.nutritionDisclaimer}>
                * Percent Daily Values are based on a 2,000 calorie diet
              </Text>
            </View>
          )}

          {/* Similar Meals */}
          {similarMeals.length > 0 && (
            <View style={styles.similarSection}>
              <View style={styles.similarHeader}>
                <Text style={styles.similarTitle}>You Might Also Love</Text>
                <TouchableOpacity activeOpacity={0.75}>
                  <Text style={styles.similarAction}>View all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={similarMeals}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarList}
                renderItem={({ item }) => (
                  <MealCard
                    meal={item}
                    onPress={(m) => navigation.replace('MealDetail', { mealId: m.id })}
                    variant="compact"
                    style={styles.similarCard}
                  />
                )}
              />
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyBottom}>
        <LinearGradient
          colors={['rgba(255,251,247,0)', 'rgba(255,251,247,0.98)', Colors.background]}
          style={styles.stickyGradient}
        />
        <SafeAreaView edges={['bottom']} style={styles.stickySafe}>
          <View style={styles.stickyContent}>
            <View style={styles.stickyLeft}>
              <Text style={styles.stickyCalories}>{meal.calories} kcal</Text>
              <Text style={styles.stickyTime}>{meal.prepTime + meal.cookTime} min · {meal.difficulty}</Text>
            </View>
            <PremiumButton
              label="Start Cooking"
              onPress={() => {}}
              variant="primary"
              icon="play"
              iconPosition="left"
              size="md"
              style={styles.stickyBtn}
            />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  floatingHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 10,
    gap: 12,
  },
  floatingTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnDark: {
    backgroundColor: Colors.backgroundDark,
  },

  // Hero
  heroContainer: {
    height: HERO_HEIGHT,
    backgroundColor: Colors.dark,
  },
  heroImageWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
  },
  heroControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(26,18,7,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  heroRightBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  heroTagsScroll: {
    marginBottom: 12,
  },
  heroTagsRow: {
    gap: 8,
  },
  cuisineTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  cuisineTagText: {
    color: Colors.textInverse,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,251,247,0.15)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,251,247,0.20)',
  },
  heroTagText: {
    color: 'rgba(255,251,247,0.90)',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  heroTitle: {
    color: Colors.textInverse,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: FontSize['2xl'] * 1.15,
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,18,7,0.45)',
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,251,247,0.10)',
  },
  heroStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroStatIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(255,251,247,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatValue: {
    color: Colors.textInverse,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  heroStatLabel: {
    color: 'rgba(255,251,247,0.55)',
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,251,247,0.15)',
    marginHorizontal: 8,
  },
  chefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chefAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,251,247,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chefAvatarEmoji: {
    fontSize: 14,
  },
  chefText: {
    color: 'rgba(255,251,247,0.65)',
    fontSize: FontSize.sm,
    fontWeight: '400',
  },
  chefName: {
    color: 'rgba(255,251,247,0.90)',
    fontWeight: '600',
  },

  // Main Card
  mainCard: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingTop: 8,
    minHeight: height * 0.6,
  },

  // Tabs
  tabBarScroll: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tabBar: {
    paddingHorizontal: Layout.screenPadding,
    gap: 4,
    paddingBottom: 0,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 20,
  },

  // Overview
  descriptionBox: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.65,
    fontWeight: '400',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickStat: {
    flex: 1,
    minWidth: '43%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  quickStatLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servingAdjuster: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  servingTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  servingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  servingBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingValue: {
    alignItems: 'center',
    minWidth: 48,
  },
  servingNum: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  servingUnit: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  moodSection: {
    marginBottom: 20,
  },
  moodSectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: 12,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  moodTagText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Ingredients
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ingredientCount: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  servingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.secondaryMuted,
    borderRadius: BorderRadius.full,
  },
  servingBadgeText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  ingredientGroup: {
    marginBottom: 20,
  },
  ingredientGroupTitle: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  ingredientDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  ingredientAmount: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  shoppingBtn: {
    marginTop: 20,
    marginBottom: 8,
  },

  // Steps
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepsCount: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  stepsTime: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  stepCard: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 0,
  },
  stepLeft: {
    alignItems: 'center',
    width: 32,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNum: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  stepNumActive: {
    color: Colors.textInverse,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 6,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  stepText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.6,
    fontWeight: '400',
  },

  // Nutrition
  nutritionNote: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginBottom: 20,
  },
  nutritionDetail: {
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 14,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nutritionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 90,
  },
  nutritionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nutritionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  nutritionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8,
  },
  nutritionBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.backgroundDark,
    overflow: 'hidden',
  },
  nutritionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  nutritionValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'right',
  },
  nutritionPercent: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  nutritionDisclaimer: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '400',
    marginTop: 12,
    fontStyle: 'italic',
  },

  // Similar Meals
  similarSection: {
    marginTop: 32,
  },
  similarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 14,
  },
  similarTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  similarAction: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  similarList: {
    paddingHorizontal: Layout.screenPadding,
    gap: 12,
  },
  similarCard: {},

  // Sticky CTA
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  stickyGradient: {
    height: 24,
  },
  stickySafe: {
    backgroundColor: Colors.background,
  },
  stickyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stickyLeft: {
    flex: 1,
  },
  stickyCalories: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  stickyTime: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  stickyBtn: {
    flex: 1,
  },
});
