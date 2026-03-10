import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { BorderRadius, Spacing } from '../constants/spacing';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=85';

const FEATURE_CARDS = [
  {
    icon: 'sparkles' as const,
    title: 'AI-Curated',
    desc: 'Personalized to your taste',
    color: Colors.primary,
  },
  {
    icon: 'leaf' as const,
    title: 'Fresh Ideas',
    desc: 'New inspiration daily',
    color: Colors.secondary,
  },
  {
    icon: 'flash' as const,
    title: 'Quick & Easy',
    desc: 'Ready in 30 minutes',
    color: Colors.accent,
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 9,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero Image */}
      <Animated.View style={[styles.heroContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(26,18,7,0.15)', 'rgba(26,18,7,0.45)', 'rgba(26,18,7,0.88)', '#1A1207']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.heroGradient}
        />
      </Animated.View>

      {/* Top badge */}
      <SafeAreaView style={styles.topSafe} edges={['top']}>
        <Animated.View style={[styles.topBadge, { opacity: fadeAnim }]}>
          <View style={styles.aiBadgeDot} />
          <Text style={styles.aiBadgeText}>AI-Powered Meal Discovery</Text>
        </Animated.View>
      </SafeAreaView>

      {/* Bottom content */}
      <SafeAreaView style={styles.bottomSafe} edges={['bottom']}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons name="restaurant" size={18} color={Colors.textInverse} />
            </View>
            <Text style={styles.brandName}>SavorAI</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            Discover meals{'\n'}you'll love
          </Text>
          <Text style={styles.subheadline}>
            Tell us what's in your kitchen — we'll create a personalized menu crafted for your taste, mood, and lifestyle.
          </Text>

          {/* Feature Pills */}
          <View style={styles.featureRow}>
            {FEATURE_CARDS.map((f, i) => (
              <View key={i} style={styles.featurePill}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '22' }]}>
                  <Ionicons name={f.icon} size={14} color={f.color} />
                </View>
                <Text style={styles.featurePillText}>{f.title}</Text>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Main')}
              activeOpacity={0.90}
              style={styles.primaryCTA}
            >
              <LinearGradient
                colors={Colors.gradientWarm as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryCTAInner}
              >
                <Text style={styles.primaryCTALabel}>Start Discovering</Text>
                <View style={styles.ctaArrow}>
                  <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Main')}
              activeOpacity={0.75}
              style={styles.ghostCTA}
            >
              <Text style={styles.ghostCTALabel}>Explore without signing in</Text>
            </TouchableOpacity>
          </View>

          {/* Trust line */}
          <View style={styles.trustRow}>
            <View style={styles.trustAvatars}>
              {['🧑🏻', '👩🏽', '👨🏿'].map((emoji, i) => (
                <View key={i} style={[styles.trustAvatar, { marginLeft: i === 0 ? 0 : -8 }]}>
                  <Text style={styles.trustAvatarEmoji}>{emoji}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.trustText}>
              <Text style={styles.trustHighlight}>120k+</Text> home cooks this month
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.68,
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
    height: '80%',
  },
  topSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,251,247,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,251,247,0.20)',
    gap: 6,
  },
  aiBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },
  aiBadgeText: {
    color: 'rgba(255,251,247,0.90)',
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  bottomSafe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: Colors.textInverse,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  headline: {
    color: Colors.textInverse,
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: FontSize['3xl'] * 1.12,
    marginBottom: 14,
  },
  subheadline: {
    color: 'rgba(255,251,247,0.72)',
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.6,
    marginBottom: 24,
    fontWeight: '400',
  },
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,251,247,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,251,247,0.14)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featurePillText: {
    color: 'rgba(255,251,247,0.88)',
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaSection: {
    gap: 12,
    marginBottom: 22,
  },
  primaryCTA: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  primaryCTAInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 12,
  },
  primaryCTALabel: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,251,247,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostCTA: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  ghostCTALabel: {
    color: 'rgba(255,251,247,0.55)',
    fontSize: FontSize.sm,
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(255,251,247,0.30)',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  trustAvatars: {
    flexDirection: 'row',
  },
  trustAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.darkCard,
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustAvatarEmoji: {
    fontSize: 14,
  },
  trustText: {
    color: 'rgba(255,251,247,0.55)',
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  trustHighlight: {
    color: 'rgba(255,251,247,0.88)',
    fontWeight: '700',
  },
});
