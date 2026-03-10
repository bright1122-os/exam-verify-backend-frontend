import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius } from '../constants/spacing';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  style?: object;
  variant?: 'default' | 'dark' | 'minimal';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search meals...',
  onFocus,
  onBlur,
  onSubmit,
  onClear,
  autoFocus = false,
  style,
  variant = 'default',
}) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const containerStyle = [
    styles.container,
    variant === 'dark' && styles.containerDark,
    variant === 'minimal' && styles.containerMinimal,
    focused && styles.containerFocused,
    focused && variant === 'dark' && styles.containerDarkFocused,
    Shadows.sm,
    style,
  ];

  return (
    <View style={containerStyle}>
      <Ionicons
        name="search"
        size={20}
        color={focused ? Colors.primary : Colors.textTertiary}
        style={styles.searchIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={variant === 'dark' ? 'rgba(255,251,247,0.4)' : Colors.textMuted}
        style={[styles.input, variant === 'dark' && styles.inputDark]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={variant === 'dark' ? 'rgba(255,251,247,0.5)' : Colors.textTertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  containerDark: {
    backgroundColor: 'rgba(255,251,247,0.10)',
    borderColor: 'rgba(255,251,247,0.12)',
  },
  containerMinimal: {
    backgroundColor: Colors.backgroundDark,
    borderColor: 'transparent',
    borderWidth: 0,
  },
  containerFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  containerDarkFocused: {
    borderColor: 'rgba(255,140,90,0.60)',
    backgroundColor: 'rgba(255,251,247,0.14)',
  },
  searchIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  inputDark: {
    color: Colors.textInverse,
  },
});
