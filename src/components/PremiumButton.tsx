import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius } from '../constants/spacing';

interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark' | 'green';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: object;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const sizeStyle = {
    sm: { paddingVertical: 10, paddingHorizontal: 18, iconSize: 16 },
    md: { paddingVertical: 15, paddingHorizontal: 24, iconSize: 18 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, iconSize: 20 },
  }[size];

  const fontSize = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.md }[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.88}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={disabled ? ['#C4B5A8', '#A89080'] : Colors.gradientWarm as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.buttonBase,
            { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal },
            Shadows.xl,
            fullWidth && styles.fullWidth,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.textInverse} />
              )}
              <Text style={[styles.primaryLabel, { fontSize }]}>{label}</Text>
              {icon && iconPosition === 'right' && (
                <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.textInverse} />
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'green') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.88}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={Colors.gradientGreen as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.buttonBase,
            { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal },
            Shadows.xl,
            fullWidth && styles.fullWidth,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.textInverse} />
              )}
              <Text style={[styles.primaryLabel, { fontSize }]}>{label}</Text>
              {icon && iconPosition === 'right' && (
                <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.textInverse} />
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.82}
        style={[
          styles.buttonBase,
          styles.secondaryButton,
          { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.primary} />
        )}
        <Text style={[styles.secondaryLabel, { fontSize }]}>{label}</Text>
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.primary} />
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'dark') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.82}
        style={[
          styles.buttonBase,
          styles.darkButton,
          { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal },
          Shadows.md,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.textInverse} />
        )}
        <Text style={[styles.darkLabel, { fontSize }]}>{label}</Text>
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.textInverse} />
        )}
      </TouchableOpacity>
    );
  }

  // Ghost
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.buttonBase,
        styles.ghostButton,
        { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {icon && iconPosition === 'left' && (
        <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.textSecondary} />
      )}
      <Text style={[styles.ghostLabel, { fontSize }]}>{label}</Text>
      {icon && iconPosition === 'right' && (
        <Ionicons name={icon} size={sizeStyle.iconSize} color={Colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  primaryLabel: {
    color: Colors.textInverse,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  secondaryLabel: {
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  darkButton: {
    backgroundColor: Colors.dark,
  },
  darkLabel: {
    color: Colors.textInverse,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostLabel: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
