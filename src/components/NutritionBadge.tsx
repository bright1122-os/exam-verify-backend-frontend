import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius } from '../constants/spacing';

interface NutritionBadgeProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  variant?: 'row' | 'grid';
}

const MacroItem = ({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) => (
  <View style={styles.macroItem}>
    <View style={[styles.macroBar, { backgroundColor: color }]} />
    <Text style={styles.macroValue}>{value}{unit}</Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

export const NutritionBadge: React.FC<NutritionBadgeProps> = ({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  variant = 'row',
}) => {
  if (variant === 'grid') {
    return (
      <View style={styles.gridContainer}>
        <View style={styles.calorieCenter}>
          <Text style={styles.calorieValue}>{calories}</Text>
          <Text style={styles.calorieLabel}>calories</Text>
        </View>
        <View style={styles.macrosGrid}>
          <MacroItem label="Protein" value={protein} unit="g" color={Colors.primary} />
          <MacroItem label="Carbs" value={carbs} unit="g" color={Colors.accent} />
          <MacroItem label="Fat" value={fat} unit="g" color={Colors.secondary} />
          {fiber !== undefined && (
            <MacroItem label="Fiber" value={fiber} unit="g" color="#8B5CF6" />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rowContainer}>
      <View style={styles.caloriePill}>
        <Text style={styles.calorieValueSm}>{calories}</Text>
        <Text style={styles.calorieLabelSm}>kcal</Text>
      </View>
      <View style={styles.macroDivider} />
      <View style={styles.macroRow}>
        <Text style={styles.macroRowItem}>
          <Text style={[styles.macroRowValue, { color: Colors.primary }]}>{protein}g</Text>
          <Text style={styles.macroRowLabel}> P</Text>
        </Text>
        <Text style={styles.macroRowItem}>
          <Text style={[styles.macroRowValue, { color: Colors.accent }]}>{carbs}g</Text>
          <Text style={styles.macroRowLabel}> C</Text>
        </Text>
        <Text style={styles.macroRowItem}>
          <Text style={[styles.macroRowValue, { color: Colors.secondary }]}>{fat}g</Text>
          <Text style={styles.macroRowLabel}> F</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.md,
    padding: 12,
    gap: 12,
  },
  caloriePill: {
    alignItems: 'center',
  },
  calorieValueSm: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  calorieLabelSm: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  macroDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  macroRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroRowItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroRowValue: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  macroRowLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Grid variant
  gridContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  calorieCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  calorieValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  calorieLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macrosGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroItem: {
    minWidth: 60,
    gap: 4,
  },
  macroBar: {
    height: 3,
    width: 32,
    borderRadius: 2,
    marginBottom: 2,
  },
  macroValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  macroLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
