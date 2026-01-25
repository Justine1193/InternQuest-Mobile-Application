import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';

type Props = {
  userEmail?: string | null;
};

const LaunchScreen: React.FC<Props> = ({ userEmail }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  const scale = useMemo(
    () =>
      pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.06],
      }),
    [pulse]
  );

  const translateY = useMemo(
    () =>
      float.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
      }),
    [float]
  );

  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnim.start();
    floatAnim.start();
    return () => {
      pulseAnim.stop();
      floatAnim.stop();
    };
  }, [float, pulse]);

  return (
    <View style={styles.bg}>
      <View style={styles.bgCircle1} pointerEvents="none" />
      <View style={styles.bgCircle2} pointerEvents="none" />

      <Screen style={styles.screen} contentContainerStyle={styles.container}>
        <Animated.View style={[styles.logoOuter, { transform: [{ scale }, { translateY }] }]}>
          <View style={styles.logoInner}>
            <Animated.Image
              source={require('../assets/ship.png')}
              style={[styles.logo, { transform: [{ translateY }] }]}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Text style={styles.title}>InterQuest</Text>
        <Text style={styles.subtitle}>{userEmail ? 'Signing you in…' : 'Loading…'}</Text>
      </Screen>
    </View>
  );
};

export default LaunchScreen;

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#2B7FFF' },
  screen: { backgroundColor: 'transparent' },
  bgCircle1: {
    position: 'absolute',
    top: -90,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -170,
    left: -180,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  logoInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 54, height: 54 },
  title: { fontSize: 30, fontWeight: '900', color: colors.white, marginTop: 2 },
  subtitle: { marginTop: 6, fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
});
