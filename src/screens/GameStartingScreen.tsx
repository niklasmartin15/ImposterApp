import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

export const GameStartingScreen: React.FC = () => {
  const { setCurrentPhase } = useGameStore();
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.5), []);

  useEffect(() => {
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to game rounds after animation
    const timer = setTimeout(() => {
      setCurrentPhase('gameRounds');
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, setCurrentPhase]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.animationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.title}>🎮</Text>
          <Text style={styles.subtitle}>Spiel beginnt!</Text>
          <Text style={styles.description}>
            Bereitet euch vor...
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#bbb',
    textAlign: 'center',
  },
});
