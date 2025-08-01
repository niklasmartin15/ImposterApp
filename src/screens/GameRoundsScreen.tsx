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
    guessWord,
    canImposterGuessWord
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
  const currentPlayer = currentRound?.playerOrder[currentRound.currentPlayerIndex];
  
  // Schließe das Wort-Raten Dropdown wenn sich der aktuelle Spieler ändert
  React.useEffect(() => {
    setShowWordGuessDropdown(false);
    setGuessedWord('');
  }, [currentPlayer]);

  if (!currentRound || !currentPlayer) {
    return null;
  }

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
    // Schließe das Wort-Raten Dropdown beim Weitergehen
    setShowWordGuessDropdown(false);
    nextPlayer();
  };

  const handleWordGuess = () => {
    if (guessedWord.trim() === '') {
      return;
    }

    const trimmedGuess = guessedWord.trim();
    const correctWord = offlineSettings.gameWordPair?.word.trim().toLowerCase();
    const isWin = trimmedGuess.toLowerCase() === correctWord;
    // Speichere Ergebnis
    guessWord(currentPlayer, trimmedGuess);
    if (isWin) {
      // Direkt zum Endscreen
      setCurrentPhase('wordGuessResults');
    } else {
      // Falscher Versuch: Runde wird fortgesetzt
      setShowWordGuessDropdown(false);
      setGuessedWord('');
    }
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

            {/* Wort Raten Dropdown - für alle Spieler sichtbar */}
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
                      Rate das Lösung Wort! Du hast einen Versuch:{'\n'}✅Richtige Antwort = Spiel gewonnen{'\n'}❌Falsche Antwort = Spiel geht weiter, aber du kannst nicht mehr raten.
                    </Text>
                    {canImposterGuessWord(currentPlayer) ? (
                      <>
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
                      </>
                    ) : (
                      <View style={styles.disabledGuessContainer}>
                        <TextInput
                          style={[styles.wordGuessInput, styles.wordGuessInputDisabled]}
                          value=""
                          placeholder="Lösung falsch geraten!"
                          placeholderTextColor="#666"
                          editable={false}
                        />
                        <TouchableOpacity 
                          style={[styles.wordGuessSubmitButton, styles.wordGuessSubmitButtonDisabled]}
                          disabled={true}
                        >
                          <Text style={styles.wordGuessSubmitButtonText}>
                            ❌ Deaktiviert
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.nonImposterContainer}>
                    <Text style={styles.nonImposterText}>
                      🛡️ Du bist kein Imposter!
                    </Text>
                    <Text style={styles.nonImposterSubtext}>
                      Nur Imposters können das Wort raten.
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(233, 69, 96, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 18,
  },
  cluesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  cluesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cluesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  showAllButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b8a',
    elevation: 2,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  showAllButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  clueItem: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
    backgroundColor: 'rgba(15, 52, 96, 0.3)',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  cluePlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
  clueText: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  hiddenCluesText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
  },
  currentPlayerContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
  },
  currentPlayerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bbb',
    marginBottom: 6,
  },
  currentPlayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f3460',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    minHeight: 70,
    textAlignVertical: 'top',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#e94560',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b8a',
  },
  submitButtonDisabled: {
    backgroundColor: '#555',
    borderColor: '#666',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: 16,
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
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  rulesText: {
    fontSize: 12,
    color: '#bbb',
    marginBottom: 3,
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
    borderColor: '#1e4a73',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  wordGuessButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  wordGuessContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  imposterGuessContainer: {
    alignItems: 'center',
  },
  imposterGuessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(233, 69, 96, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imposterGuessHint: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  wordGuessInput: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1e4a73',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    width: '100%',
    marginBottom: 12,
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  wordGuessInputDisabled: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#666',
  },
  wordGuessSubmitButton: {
    backgroundColor: '#e94560',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ff6b8a',
  },
  wordGuessSubmitButtonDisabled: {
    backgroundColor: '#555',
    borderColor: '#666',
    elevation: 1,
    shadowOpacity: 0.1,
  },
  wordGuessSubmitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabledGuessContainer: {
    alignItems: 'center',
    opacity: 0.6,
  },
  nonImposterContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  nonImposterText: {
    fontSize: 16,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(33, 150, 243, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nonImposterSubtext: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
