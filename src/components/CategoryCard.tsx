import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius } from '../constants/spacing';
import { Category } from '../data/categories';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  style?: object;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(category)}
      activeOpacity={0.88}
      style={[styles.card, Shadows.md, style]}
    >
      <LinearGradient
        colors={category.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.emoji}>{category.emoji}</Text>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>{category.mealCount} meals</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 130,
    height: 110,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  emoji: {
    fontSize: 24,
  },
  name: {
    color: Colors.textInverse,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: FontSize.sm * 1.3,
  },
  count: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
