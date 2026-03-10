import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius } from '../constants/spacing';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MealSearchScreen } from '../screens/MealSearchScreen';
import { IngredientInputScreen } from '../screens/IngredientInputScreen';
import { RecommendationResultsScreen } from '../screens/RecommendationResultsScreen';
import { MealDetailScreen } from '../screens/MealDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={tabStyles.container}>
      <BlurView intensity={85} tint="light" style={tabStyles.blur}>
        <View style={tabStyles.tabRow}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const iconMap: Record<string, [string, string]> = {
              Home: ['home', 'home-outline'],
              Search: ['search', 'search-outline'],
              Ingredients: ['leaf', 'leaf-outline'],
              Saved: ['bookmark', 'bookmark-outline'],
            };

            const [activeIcon, inactiveIcon] = iconMap[route.name] || ['ellipse', 'ellipse-outline'];
            const label = route.name;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => {
                  if (!isFocused) {
                    navigation.navigate(route.name);
                  }
                }}
                style={tabStyles.tabItem}
                activeOpacity={0.75}
              >
                <View style={[tabStyles.tabIconWrap, isFocused && tabStyles.tabIconWrapActive]}>
                  <Ionicons
                    name={(isFocused ? activeIcon : inactiveIcon) as any}
                    size={22}
                    color={isFocused ? Colors.primary : Colors.textTertiary}
                  />
                </View>
                <Text style={[tabStyles.tabLabel, isFocused && tabStyles.tabLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// Saved Placeholder Screen
function SavedScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 56 }}>🔖</Text>
      <Text style={{ color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800', letterSpacing: -0.5 }}>
        Your Collection
      </Text>
      <Text style={{ color: Colors.textTertiary, fontSize: FontSize.base, textAlign: 'center', paddingHorizontal: 40, lineHeight: FontSize.base * 1.6 }}>
        Save your favorite meals and access them here anytime
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Search')}
        style={{ marginTop: 8, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: Colors.primary, borderRadius: BorderRadius.full }}
        activeOpacity={0.85}
      >
        <Text style={{ color: Colors.textInverse, fontSize: FontSize.base, fontWeight: '700' }}>
          Discover Meals
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={MealSearchScreen} />
      <Tab.Screen name="Ingredients" component={IngredientInputScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
    </Tab.Navigator>
  );
}

// Root Navigator
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'ios' }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="MealDetail"
          component={MealDetailScreen}
          options={{ animation: 'ios', presentation: 'card' }}
        />
        <Stack.Screen
          name="Recommendations"
          component={RecommendationResultsScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blur: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(26,18,7,0.07)',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabIconWrap: {
    width: 46,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: Colors.primaryMuted,
  },
  tabLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
