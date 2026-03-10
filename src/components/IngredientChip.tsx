import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius } from '../constants/spacing';

interface IngredientChipProps {
  name: string;
  emoji?: string;
  selected?: boolean;
  onPress: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'selected' | 'tag';
}

export const IngredientChip: React.FC<IngredientChipProps> = ({
  name,
  emoji,
  selected = false,
  onPress,
  onRemove,
  variant = 'default',
}) => {
  if (variant === 'tag' || selected) {
    return (
      <View style={[styles.selectedChip, Shadows.sm]}>
        {emoji && <Text style={styles.chipEmoji}>{emoji}</Text>}
        <Text style={styles.selectedText}>{name}</Text>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
            <Ionicons name="close-circle" size={16} color="rgba(255,251,247,0.80)" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.75}
    >
      {emoji && <Text style={styles.chipEmoji}>{emoji}</Text>}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.primary,
  },
  chipEmoji: {
    fontSize: 15,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  selectedText: {
    color: Colors.textInverse,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
