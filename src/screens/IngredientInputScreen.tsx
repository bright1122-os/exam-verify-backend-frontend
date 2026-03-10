import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius, Layout } from '../constants/spacing';
import { IngredientChip } from '../components/IngredientChip';
import { PremiumButton } from '../components/PremiumButton';
import { SectionHeader } from '../components/SectionHeader';
import {
  ALL_INGREDIENTS,
  POPULAR_INGREDIENTS,
  RECENT_INGREDIENTS,
  INGREDIENT_CATEGORIES,
  IngredientItem,
} from '../data/ingredients';

interface IngredientInputScreenProps {
  navigation: any;
}

const MIN_INGREDIENTS = 2;
const MAX_INGREDIENTS = 12;

export const IngredientInputScreen: React.FC<IngredientInputScreenProps> = ({ navigation }) => {
  const [selected, setSelected] = useState<IngredientItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const filteredIngredients = ALL_INGREDIENTS.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || ing.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleIngredient = (ing: IngredientItem) => {
    if (selected.find(s => s.id === ing.id)) {
      setSelected(selected.filter(s => s.id !== ing.id));
    } else {
      if (selected.length >= MAX_INGREDIENTS) {
        // Shake effect
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
        return;
      }
      setSelected([...selected, ing]);
    }
  };

  const removeIngredient = (id: string) => {
    setSelected(selected.filter(s => s.id !== id));
  };

  const handleDiscover = () => {
    if (selected.length < MIN_INGREDIENTS) return;
    Keyboard.dismiss();
    navigation.navigate('Recommendations', {
      ingredients: selected.map(s => s.name),
    });
  };

  const canDiscover = selected.length >= MIN_INGREDIENTS;

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
            <Text style={styles.headerTitle}>Your Ingredients</Text>
            <Text style={styles.headerSubtitle}>Pick what's in your kitchen</Text>
          </View>
          <TouchableOpacity
            onPress={() => setSelected([])}
            style={styles.clearBtn}
            activeOpacity={0.75}
            disabled={selected.length === 0}
          >
            <Text style={[styles.clearText, selected.length === 0 && styles.clearTextDisabled]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selected Ingredients Zone */}
        <View style={styles.selectedZone}>
          {selected.length === 0 ? (
            <View style={styles.emptySelected}>
              <Text style={styles.emptyEmoji}>🛒</Text>
              <Text style={styles.emptyTitle}>No ingredients yet</Text>
              <Text style={styles.emptyDesc}>Add at least {MIN_INGREDIENTS} ingredients to discover meals</Text>
            </View>
          ) : (
            <>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedCount}>
                  <Text style={styles.selectedCountNum}>{selected.length}</Text>
                  <Text style={styles.selectedCountSlash}>/{MAX_INGREDIENTS}</Text>
                  {' '}ingredients selected
                </Text>
                {selected.length >= MIN_INGREDIENTS && (
                  <View style={styles.readyPill}>
                    <Ionicons name="checkmark-circle" size={13} color={Colors.secondary} />
                    <Text style={styles.readyText}>Ready!</Text>
                  </View>
                )}
              </View>
              <Animated.View
                style={[styles.selectedChips, { transform: [{ translateX: shakeAnim }] }]}
              >
                {selected.map(ing => (
                  <IngredientChip
                    key={ing.id}
                    name={ing.name}
                    emoji={ing.emoji}
                    selected={true}
                    onPress={() => removeIngredient(ing.id)}
                    onRemove={() => removeIngredient(ing.id)}
                    variant="tag"
                  />
                ))}
              </Animated.View>
            </>
          )}
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, Shadows.sm]}>
            <Ionicons name="search" size={18} color={Colors.textTertiary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search ingredients..."
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={styles.categoryScrollOuter}
        >
          {INGREDIENT_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
              activeOpacity={0.78}
            >
              <Text style={[styles.categoryPillText, activeCategory === cat && styles.categoryPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Ingredients */}
        {searchQuery.length === 0 && activeCategory === 'All' && (
          <View style={styles.ingredientSection}>
            <SectionHeader
              title="Recently Used"
              style={styles.sectionPad}
            />
            <View style={styles.chipGrid}>
              {RECENT_INGREDIENTS.map(ing => (
                <IngredientChip
                  key={ing.id}
                  name={ing.name}
                  emoji={ing.emoji}
                  selected={!!selected.find(s => s.id === ing.id)}
                  onPress={() => toggleIngredient(ing)}
                  variant="default"
                />
              ))}
            </View>
          </View>
        )}

        {/* All / Filtered Ingredients */}
        <View style={styles.ingredientSection}>
          <SectionHeader
            title={
              searchQuery
                ? `Results for "${searchQuery}"`
                : activeCategory === 'All'
                ? 'Popular Picks'
                : activeCategory
            }
            subtitle={`${filteredIngredients.length} ingredients`}
            style={styles.sectionPad}
          />
          <View style={styles.chipGrid}>
            {(searchQuery || activeCategory !== 'All' ? filteredIngredients : POPULAR_INGREDIENTS).map(
              ing => (
                <IngredientChip
                  key={ing.id}
                  name={ing.name}
                  emoji={ing.emoji}
                  selected={!!selected.find(s => s.id === ing.id)}
                  onPress={() => toggleIngredient(ing)}
                  variant="default"
                />
              ),
            )}
          </View>
        </View>

        {/* Bottom spacing for CTA */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaContainer}>
        <LinearGradient
          colors={['rgba(255,251,247,0)', 'rgba(255,251,247,0.98)', 'rgb(255,251,247)']}
          style={styles.ctaGradient}
        />
        <SafeAreaView edges={['bottom']} style={styles.ctaSafe}>
          <View style={styles.ctaContent}>
            {!canDiscover && (
              <Text style={styles.ctaHint}>
                Add {MIN_INGREDIENTS - selected.length} more ingredient{MIN_INGREDIENTS - selected.length === 1 ? '' : 's'} to discover meals
              </Text>
            )}
            <PremiumButton
              label={canDiscover ? `Discover ${selected.length} Ingredient Meals` : 'Select Ingredients First'}
              onPress={handleDiscover}
              variant={canDiscover ? 'primary' : 'ghost'}
              icon="sparkles"
              iconPosition="left"
              fullWidth
              disabled={!canDiscover}
              size="lg"
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
  safeArea: {
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
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
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  clearTextDisabled: {
    color: Colors.textMuted,
  },

  // Selected zone
  selectedZone: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 16,
    minHeight: 100,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptySelected: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  emptyDesc: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: FontSize.xs * 1.6,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedCount: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  selectedCountNum: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: FontSize.base,
  },
  selectedCountSlash: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.secondaryMuted,
    borderRadius: BorderRadius.full,
  },
  readyText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Search
  searchSection: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '500',
    padding: 0,
  },

  // Category filter
  categoryScrollOuter: {
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: Layout.screenPadding,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  categoryPillActive: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  categoryPillText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: Colors.textInverse,
  },

  // Ingredient sections
  ingredientSection: {
    marginBottom: 8,
  },
  sectionPad: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 12,
  },
  chipGrid: {
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  ctaGradient: {
    height: 24,
  },
  ctaSafe: {
    backgroundColor: Colors.background,
  },
  ctaContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  ctaHint: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});
