import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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

  // Finde alle Imposter, die noch nicht geraten haben
  const impostersWhoCanGuess = offlineSettings.assignedRoles
    ?.filter(role => role.isImposter) || [];

  const currentImposter = impostersWhoCanGuess[currentImposterIndex];

  // Wenn der Timer 0 erreicht, Behandle als falsche Antwort und zeige Ergebnis
  useEffect(() => {
    if (timer === 0 && currentImposter) {
      // Falscher Versuch durch Timeout
      guessWordInLastChance(currentImposter.playerName, '');
      setCurrentPhase('wordGuessResults');
    }
  }, [timer, currentImposter, guessWordInLastChance, setCurrentPhase]);

  // Wenn keine Imposter mehr raten können, gehe direkt zu den Ergebnissen
  if (!currentImposter || impostersWhoCanGuess.length === 0) {
    setCurrentPhase('votingResults');
    return null;
  }

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
    const correctWord = offlineSettings.gameWordPair?.word.trim().toLowerCase();
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
    // Imposter verzichtet -> Behandle als falsche Antwort
    guessWordInLastChance(currentImposter.playerName, '');
    setCurrentPhase('wordGuessResults');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🎯 Letzte Chance!</Text>
            <Text style={styles.subtitle}>
              {currentImposter.playerName}, du wurdest als Imposter entlarvt!
            </Text>
          </View>

          {/* Timer Card */}
          <View style={styles.timerCard}>
            <View style={styles.timerIconContainer}>
              <Text style={styles.timerIcon}>⏱️</Text>
            </View>
            <View style={styles.timerTextContainer}>
              <Text style={styles.timerTitle}>Verbleibende Zeit</Text>
              <Text style={styles.timerText}>{timer} Sekunden</Text>
            </View>
          </View>

          {/* Current Imposter Info */}
          <View style={[
            styles.currentImposterContainer,
            { borderColor: getPlayerColor(currentImposter.playerName) }
          ]}>
            <View style={styles.imposterIconContainer}>
              <Text style={styles.imposterIcon}>🕵️</Text>
            </View>
            <View style={styles.imposterTextContainer}>
              <Text style={styles.currentImposterTitle}>Du bist dran:</Text>
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
          </View>

          {/* Imposter Hint */}
          <View style={styles.hintContainer}>
            <View style={styles.hintIconContainer}>
              <Text style={styles.hintIconText}>💭</Text>
            </View>
            <View style={styles.hintTextContainer}>
              <Text style={styles.hintLabel}>Dein Hinweis war:</Text>
              <Text style={styles.hintText}>
                &quot;{offlineSettings.gameWordPair?.imposterHint}&quot;
              </Text>
            </View>
          </View>

          {/* Word Guess Input */}
          <View style={styles.inputCard}>
            <View style={styles.inputIconContainer}>
              <Text style={styles.inputIcon}>✏️</Text>
            </View>
            <View style={styles.inputTextContainer}>
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
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🎯</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.guessButtonText}>Wort raten</Text>
                <Text style={styles.buttonSubText}>Lösungswort eingeben</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>❌</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.skipButtonText}>Verzichten</Text>
                <Text style={styles.buttonSubText}>Chance aufgeben</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Übersicht der Antworten (Alle Hinweise) */}
          <View style={styles.allCluesCard}>
            <View style={styles.cluesHeaderContainer}>
              <View style={styles.cluesIconContainer}>
                <Text style={styles.cluesIcon}>💭</Text>
              </View>
              <View style={styles.cluesHeaderTextContainer}>
                <Text style={styles.allCluesTitle}>Alle Hinweise</Text>
                <Text style={styles.allCluesSubtitle}>Übersicht aller gegebenen Hinweise</Text>
              </View>
            </View>
            <View style={styles.cluesContent}>
              {offlineSettings.allClues?.map((clue, idx) => (
                <View key={idx} style={styles.clueItem}>
                  <Text style={[styles.cluePlayerName, { color: getPlayerColor(clue.playerName) }]}>
                    {clue.playerName} (R{clue.roundNumber}):
                  </Text>
                  <Text style={styles.clueText}>{clue.clue}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Progress indicator */}
          {impostersWhoCanGuess.length > 1 && (
            <View style={styles.progressCard}>
              <View style={styles.progressIconContainer}>
                <Text style={styles.progressIcon}>📊</Text>
              </View>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressTitle}>Fortschritt</Text>
                <Text style={styles.progressText}>
                  Imposter {currentImposterIndex + 1} von {impostersWhoCanGuess.length}
                </Text>
              </View>
            </View>
          )}

          {/* Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIconText}>💡</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Spielregeln</Text>
              <Text style={styles.infoText}>
                • Richtig geraten = Du gewinnst das Spiel!{'\n'}
                • Falsch geraten = Die anderen Spieler gewinnen!
              </Text>
            </View>
          </View>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(233, 69, 96, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 22,
  },
  timerCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timerIcon: {
    fontSize: 18,
  },
  timerTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  timerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  timerText: {
    fontSize: 18,
    color: 'rgba(255, 193, 7, 0.9)',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  currentImposterContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imposterIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(233, 69, 96, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  imposterIcon: {
    fontSize: 18,
  },
  imposterTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  currentImposterTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  currentImposterName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  hintContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hintIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 236, 196, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  hintIconText: {
    fontSize: 18,
  },
  hintTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  hintLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  hintText: {
    fontSize: 17,
    color: '#4ECDC4',
    fontStyle: 'italic',
    textAlign: 'left',
  },
  inputCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(69, 183, 209, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 8,
  },
  inputIcon: {
    fontSize: 18,
  },
  inputTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#1a4a6b',
    width: '100%',
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 10,
  },
  guessButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 10,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 3,
    borderColor: '#7ED6D1',
  },
  guessButtonDisabled: {
    backgroundColor: '#2a4a4a',
    shadowColor: '#2a4a4a',
    borderColor: '#3a5a5a',
  },
  skipButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 8,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#ec7063',
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  guessButtonText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  skipButtonText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonSubText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'left',
    fontWeight: '500',
  },
  allCluesCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  cluesHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cluesIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(150, 206, 180, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cluesIcon: {
    fontSize: 18,
  },
  cluesHeaderTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  allCluesTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  allCluesSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  cluesContent: {
    gap: 6,
  },
  clueItem: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 8,
  },
  cluePlayerName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  clueText: {
    fontSize: 13,
    color: '#ccc',
    textAlign: 'left',
  },
  progressCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(187, 143, 206, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  progressIcon: {
    fontSize: 18,
  },
  progressTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  infoCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoIconText: {
    fontSize: 18,
  },
  infoTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    lineHeight: 18,
  },
});
