import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export const ImposterLastChanceScreen: React.FC = () => {
  const { 
    offlineSettings,
    setCurrentPhase,
    guessWordInLastChance
  } = useGameStore();

  const [guessedWord, setGuessedWord] = useState('');
  const [currentImposterIndex, setCurrentImposterIndex] = useState(0);
  // Countdown timer for last chance (60 seconds)
  const [timer, setTimer] = useState(60);

  // Decrease timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Finde alle Imposter, die noch nicht geraten haben
  const impostersWhoCanGuess = offlineSettings.assignedRoles
    ?.filter(role => role.isImposter) || [];

  const currentImposter = impostersWhoCanGuess[currentImposterIndex];

  // Wenn keine Imposter mehr raten können, gehe direkt zu den Ergebnissen
  if (!currentImposter || impostersWhoCanGuess.length === 0) {
    setCurrentPhase('votingResults');
    return null;
  }

  // Wenn der Timer 0 erreicht, überspringe diesen Imposter oder beende die letzte Chance
  useEffect(() => {
    if (timer === 0) {
      if (currentImposterIndex < impostersWhoCanGuess.length - 1) {
        setCurrentImposterIndex(ci => ci + 1);
        setGuessedWord('');
        setTimer(60);
      } else {
        setCurrentPhase('votingResults');
      }
    }
  }, [timer, currentImposterIndex, impostersWhoCanGuess.length, setCurrentPhase]);

  const getPlayerColor = (playerName: string): string => {
    if (!offlineSettings.currentRound) return PLAYER_COLORS[0];
    const playerIndex = offlineSettings.currentRound.playerOrder.indexOf(playerName);
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  };

  const handleWordGuess = () => {
    if (guessedWord.trim() === '') {
      return;
    }

    const trimmedGuess = guessedWord.trim();
    const correctWord = offlineSettings.currentWordPair?.word.trim().toLowerCase();
    const isWin = trimmedGuess.toLowerCase() === correctWord;
    
    // Speichere Ergebnis
    guessWordInLastChance(currentImposter.playerName, trimmedGuess);
    
    if (isWin) {
      // Imposter gewinnt - direkt zum Endscreen
      setCurrentPhase('wordGuessResults');
    } else {
      // Falscher Versuch - nächster Imposter oder zurück zu Voting Results
      if (currentImposterIndex < impostersWhoCanGuess.length - 1) {
        setCurrentImposterIndex(currentImposterIndex + 1);
        setGuessedWord('');
      } else {
        // Alle Imposter haben geraten, zurück zu den Voting Results
        setCurrentPhase('votingResults');
      }
    }
  };

  const handleSkip = () => {
    // Imposter verzichtet auf das Raten
    if (currentImposterIndex < impostersWhoCanGuess.length - 1) {
      setCurrentImposterIndex(currentImposterIndex + 1);
      setGuessedWord('');
    } else {
      setCurrentPhase('votingResults');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🎯 Letzte Chance!</Text>
            <Text style={styles.subtitle}>
              {currentImposter.playerName}, du wurdest als Imposter entlarvt!
            </Text>
            {/* Countdown Timer */}
            <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
              ⏱ Verbleibende Zeit: {timer}s
            </Text>
          </View>


          {/* Current Imposter Info */}
          <View style={[
            styles.currentImposterContainer,
            { borderColor: getPlayerColor(currentImposter.playerName) }
          ]}>
            <Text style={styles.currentImposterTitle}>🕵️ Du bist dran:</Text>
            <Text style={[
              styles.currentImposterName, 
              { color: getPlayerColor(currentImposter.playerName) }
            ]}>
              {currentImposter.playerName}
            </Text>
            <Text style={styles.instructionText}>
              Rate das Lösungswort und rette dich vor der Niederlage!
            </Text>
          </View>

          {/* Imposter Hint */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>💭 Dein Hinweis war:</Text>
            <Text style={styles.hintText}>
              &quot;{offlineSettings.currentWordPair?.imposterHint}&quot;
            </Text>
          </View>

          {/* Word Guess Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Dein Wort-Tipp:</Text>
            <TextInput
              style={styles.textInput}
              value={guessedWord}
              onChangeText={setGuessedWord}
              placeholder="Rate das Lösungswort..."
              placeholderTextColor="#888"
              autoCapitalize="words"
              autoFocus={true}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.guessButton,
                guessedWord.trim() === '' && styles.guessButtonDisabled
              ]}
              onPress={handleWordGuess}
              disabled={guessedWord.trim() === ''}
            >
              <Text style={styles.guessButtonText}>
                🎯 Wort raten
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>
                ❌ Verzichten
              </Text>
            </TouchableOpacity>
          </View>
          {/* Übersicht der Antworten (Alle Hinweise) */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
              💭 Alle Hinweise:
            </Text>
            {offlineSettings.allClues?.map((clue, idx) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                <Text style={{ color: getPlayerColor(clue.playerName), fontWeight: 'bold' }}>
                  {clue.playerName} (R{clue.roundNumber}):
                </Text>
                <Text style={{ color: '#ccc' }}>{clue.clue}</Text>
              </View>
            ))}
          </View>

          {/* Progress indicator */}
          {impostersWhoCanGuess.length > 1 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Imposter {currentImposterIndex + 1} von {impostersWhoCanGuess.length}
              </Text>
            </View>
          )}

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Richtig geraten = Du gewinnst das Spiel!
            </Text>
            <Text style={styles.infoText}>
              ❌ Falsch geraten = Die anderen Spieler gewinnen!
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  currentImposterContainer: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  currentImposterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  currentImposterName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  hintContainer: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  hintLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 18,
    color: '#4ECDC4',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 20,
  },
  guessButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  guessButtonDisabled: {
    backgroundColor: '#2a4a4a',
  },
  guessButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#888',
  },
  infoContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 5,
  },
});
