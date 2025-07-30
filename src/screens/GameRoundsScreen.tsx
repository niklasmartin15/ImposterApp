import React, { useState } from 'react';
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

// Farbschema für Spieler (ohne Rot)
const PLAYER_COLORS = [
  '#4CAF50', // Grün
  '#2196F3', // Blau
  '#FF9800', // Orange
  '#9C27B0', // Lila
  '#00BCD4', // Cyan
  '#8BC34A', // Hellgrün
  '#3F51B5', // Indigo
  '#FFC107', // Gelb
  '#607D8B', // Blaugrau
  '#795548', // Braun
  '#E91E63', // Pink
  '#009688', // Teal
];

export const GameRoundsScreen: React.FC = () => {
  const { 
    offlineSettings, 
    submitPlayerClue, 
    nextPlayer, 
    setCurrentPhase,
    isPlayerImposter,
    guessWord
  } = useGameStore();
  
  const [currentClue, setCurrentClue] = useState('');
  const [showAllClues, setShowAllClues] = useState(false);
  const [showWordGuessDropdown, setShowWordGuessDropdown] = useState(false);
  const [guessedWord, setGuessedWord] = useState('');

  // Funktion um Spielerfarbe zu bekommen
  const getPlayerColor = (playerName: string): string => {
    if (!offlineSettings.currentRound) return PLAYER_COLORS[0];
    const playerIndex = offlineSettings.currentRound.playerOrder.indexOf(playerName);
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  };

  const currentRound = offlineSettings.currentRound;
  if (!currentRound) {
    return null;
  }

  const currentPlayer = currentRound.playerOrder[currentRound.currentPlayerIndex];
  const isLastPlayer = currentRound.currentPlayerIndex === currentRound.playerOrder.length - 1;

  // Bestimme welche Hinweise angezeigt werden sollen (alle aus allen Runden)
  const allCluesFromAllRounds = offlineSettings.allClues || [];
  const cluestoShow = showAllClues 
    ? allCluesFromAllRounds 
    : allCluesFromAllRounds.slice(-2); // Nur die letzten 2 Hinweise

  const handleSubmitClue = () => {
    if (currentClue.trim() === '') {
      return;
    }

    submitPlayerClue(currentClue.trim());
    setCurrentClue('');
    nextPlayer();
  };

  const handleWordGuess = () => {
    if (guessedWord.trim() === '') {
      return;
    }

    const result = guessWord(currentPlayer, guessedWord.trim());
    
    if (result === 'correct') {
      // Imposter hat gewonnen
      alert(`🎉 Richtig geraten! "${guessedWord}" ist korrekt. Der Imposter ${currentPlayer} gewinnt das Spiel!`);
    } else {
      // Imposter hat verloren
      alert(`❌ Falsch geraten! "${guessedWord}" ist nicht korrekt. Der Imposter ${currentPlayer} verliert das Spiel!`);
    }
    
    // Spiel beenden oder zu den Ergebnissen
    setCurrentPhase('votingResults'); // Zeige Ergebnisse an
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header mit Fortschritt */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🎯 Runde {offlineSettings.currentRoundNumber} von {offlineSettings.maxRounds}</Text>
            <Text style={styles.progressText}>
              Spieler {currentRound.currentPlayerIndex + 1} von {currentRound.playerOrder.length}
            </Text>
          </View>

          {/* Bisherige Hinweise */}
          {allCluesFromAllRounds.length > 0 && (
            <View style={styles.cluesContainer}>
              <View style={styles.cluesHeader}>
                <Text style={styles.cluesTitle}>💭 Bisherige Hinweise:</Text>
                {allCluesFromAllRounds.length > 2 && (
                  <TouchableOpacity 
                    style={styles.showAllButton}
                    onPress={() => setShowAllClues(!showAllClues)}
                  >
                    <Text style={styles.showAllButtonText}>
                      {showAllClues ? 'Weniger' : 'Alle anzeigen'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {cluestoShow.map((clue, index) => (
                <View key={index} style={styles.clueItem}>
                  <Text style={[
                    styles.cluePlayerName, 
                    { color: getPlayerColor(clue.playerName) }
                  ]}>
                    {clue.playerName} (R{clue.roundNumber}):
                  </Text>
                  <Text style={styles.clueText}>{clue.clue}</Text>
                </View>
              ))}
              {!showAllClues && allCluesFromAllRounds.length > 2 && (
                <Text style={styles.hiddenCluesText}>
                  ... und {allCluesFromAllRounds.length - 2} weitere Hinweise
                </Text>
              )}
            </View>
          )}

          {/* Aktueller Spieler */}
          <View style={[
            styles.currentPlayerContainer,
            { borderColor: getPlayerColor(currentPlayer) }
          ]}>
            <Text style={styles.currentPlayerTitle}>🎮 Du bist dran:</Text>
            <Text style={[
              styles.currentPlayerName, 
              { color: getPlayerColor(currentPlayer) }
            ]}>
              {currentPlayer}
            </Text>
            <Text style={styles.instructionText}>
              Gib einen Hinweis zu deinem Wort ab:
            </Text>
          </View>

          {/* Input für Hinweis */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={currentClue}
              onChangeText={setCurrentClue}
              placeholder="Dein Hinweis..."
              placeholderTextColor="#888"
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.submitButton,
                currentClue.trim() === '' && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitClue}
              disabled={currentClue.trim() === ''}
            >
              <Text style={styles.submitButtonText}>
                {isLastPlayer && offlineSettings.currentRoundNumber < offlineSettings.maxRounds 
                  ? `➡️ Weiter (Runde ${offlineSettings.currentRoundNumber + 1})` 
                  : isLastPlayer 
                  ? '🗳️ Zur Abstimmung' 
                  : '➡️ Weiter'}
              </Text>
            </TouchableOpacity>

            {/* Wort Raten Dropdown */}
            <TouchableOpacity 
              style={styles.wordGuessButton}
              onPress={() => setShowWordGuessDropdown(!showWordGuessDropdown)}
            >
              <Text style={styles.wordGuessButtonText}>
                🎯 Wort Raten {showWordGuessDropdown ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showWordGuessDropdown && (
              <View style={styles.wordGuessContainer}>
                {isPlayerImposter(currentPlayer) ? (
                  <View style={styles.imposterGuessContainer}>
                    <Text style={styles.imposterGuessTitle}>🕵️ Du bist der Imposter!</Text>
                    <Text style={styles.imposterGuessHint}>
                      Rate das Lösungswort. Richtig = Du gewinnst! Falsch = Du verlierst!
                    </Text>
                    <TextInput
                      style={styles.wordGuessInput}
                      value={guessedWord}
                      onChangeText={setGuessedWord}
                      placeholder="Dein Wort-Tipp..."
                      placeholderTextColor="#888"
                      autoCapitalize="words"
                    />
                    <TouchableOpacity 
                      style={[
                        styles.wordGuessSubmitButton,
                        guessedWord.trim() === '' && styles.wordGuessSubmitButtonDisabled
                      ]}
                      onPress={handleWordGuess}
                      disabled={guessedWord.trim() === ''}
                    >
                      <Text style={styles.wordGuessSubmitButtonText}>
                        🎯 Wort raten
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.nonImposterContainer}>
                    <Text style={styles.nonImposterText}>
                      ✋ Diese Funktion ist nur für Imposter verfügbar
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Spielregeln */}
          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>📋 Regeln:</Text>
            <Text style={styles.rulesText}>
              • Gib einen Hinweis, der zeigt, dass du das Wort kennst
            </Text>
            <Text style={styles.rulesText}>
              • Vermeide es, das Wort direkt zu nennen
            </Text>
            <Text style={styles.rulesText}>
              • Als Imposter: Versuche zu erraten und mitzuspielen
            </Text>
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
  cluesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  cluesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 12,
  },
  cluesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  showAllButton: {
    backgroundColor: '#0f3460',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  showAllButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  clueItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  cluePlayerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  clueText: {
    fontSize: 16,
    color: '#eee',
    flex: 1,
  },
  hiddenCluesText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  currentPlayerContainer: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  currentPlayerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bbb',
    marginBottom: 8,
  },
  currentPlayerName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f3460',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#eee',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#bbb',
  },
  rulesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 4,
  },
  roundCompleteContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
  },
  roundCompleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  roundCompleteSubtitle: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
  wordGuessButton: {
    backgroundColor: '#0f3460',
    borderWidth: 2,
    borderColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  wordGuessButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  wordGuessContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  imposterGuessContainer: {
    alignItems: 'center',
  },
  imposterGuessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  imposterGuessHint: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 16,
  },
  wordGuessInput: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#eee',
    width: '100%',
    marginBottom: 16,
    textAlign: 'center',
  },
  wordGuessSubmitButton: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  wordGuessSubmitButtonDisabled: {
    backgroundColor: '#666',
  },
  wordGuessSubmitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  nonImposterContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  nonImposterText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
