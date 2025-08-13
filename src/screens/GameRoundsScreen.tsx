import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
    simulateVotingForOpenMode,
    canImposterGuessWord,
    guessWord,
    setCurrentPhase
  } = useGameStore();
  
  const [currentClue, setCurrentClue] = useState('');
  const [showAllClues, setShowAllClues] = useState(false);
  const [selectedImposter, setSelectedImposter] = useState<string>('');
  const [showImposterSelection, setShowImposterSelection] = useState(false);
  const [showWordGuess, setShowWordGuess] = useState(false);
  const [guessedWord, setGuessedWord] = useState('');

  // Funktion um Spielerfarbe zu bekommen
  const getPlayerColor = (playerName: string): string => {
    if (!offlineSettings.currentRound) return PLAYER_COLORS[0];
    const playerIndex = offlineSettings.currentRound.playerOrder.indexOf(playerName);
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  };

  const currentRound = offlineSettings.currentRound;
  const currentPlayer = currentRound?.playerOrder[currentRound.currentPlayerIndex];

  if (!currentRound || !currentPlayer) {
    return null;
  }

  const isLastPlayer = currentRound.currentPlayerIndex === currentRound.playerOrder.length - 1;

  // Prüfe den aktuellen Spielmodus
  const gameMode = offlineSettings.gameMode;
  const showInputFields = gameMode === 'wordInput_playerAdvance' || gameMode === 'open_mode';
  const showClues = gameMode === 'wordInput_playerAdvance' || gameMode === 'open_mode';
  const isOpenMode = gameMode === 'open_mode';

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
    
    // Schließe das Wort-Rate-Dropdown beim Weiterklicken
    setShowWordGuess(false);
    setGuessedWord('');
    
    nextPlayer();
  };

  // Neue Funktion für "Nur Spieler weiterklicken" Modus
  const handlePlayerAdvanceOnly = () => {
    // Schließe das Wort-Rate-Dropdown beim Weiterklicken
    setShowWordGuess(false);
    setGuessedWord('');
    
    nextPlayer();
  };

  // Funktionen für offenen Modus
  const handleImposterSelect = () => {
    setShowImposterSelection(true);
  };

  const handleImposterConfirm = () => {
    if (selectedImposter) {
      // Im offenen Modus direkt zu den VotingResults mit simulierter Abstimmung
      simulateVotingForOpenMode(selectedImposter);
    }
  };

  const handleImposterCancel = () => {
    setShowImposterSelection(false);
    setSelectedImposter('');
  };

  // Funktionen für Wort-Raten
  const toggleWordGuess = () => {
    setShowWordGuess(!showWordGuess);
    setGuessedWord('');
  };

  const handleWordGuess = () => {
    if (guessedWord.trim() === '' || !currentPlayer) {
      return;
    }

    // Verwende die Store-Funktion zum Raten
    guessWord(currentPlayer, guessedWord.trim());
    
    // Gehe zu den Wort-Rate-Ergebnissen
    setCurrentPhase('wordGuessResults');
  };

  // Prüfe ob der aktuelle Spieler ein Imposter ist und raten kann
  const currentPlayerIsImposter = currentPlayer ? canImposterGuessWord(currentPlayer) : false;

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
            <View style={{ height: 25 }} />
          </View>

          {/* Für Input-Modi: normale Reihenfolge */}
          {showInputFields && !isOpenMode && (
            <>
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
                  returnKeyType="done"
                  onSubmitEditing={handleSubmitClue}
                  blurOnSubmit={true}
                />
              </View>

              {/* Button für Input-Modi */}
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

                {/* Imposter Wort-Rate Dropdown - für alle sichtbar */}
                <View style={styles.wordGuessContainer}>
                  <TouchableOpacity 
                    style={styles.wordGuessToggleButton}
                    onPress={toggleWordGuess}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.wordGuessToggleText}>
                      {showWordGuess ? '🔼 Wort-Raten schließen' : '🔽 Wort raten (Imposter)'}
                    </Text>
                    {!showWordGuess && (
                      <Text style={styles.wordGuessToggleSubtext}>
                        klicke zum öffnen
                      </Text>
                    )}
                  </TouchableOpacity>

                  {showWordGuess && (
                    <View style={styles.wordGuessInputContainer}>
                      {currentPlayerIsImposter ? (
                        <>
                          <Text style={styles.wordGuessHint}>
                            💡 Dein Hinweis: &quot;{offlineSettings.gameWordPair?.imposterHint}&quot;
                          </Text>
                          <TextInput
                            style={styles.wordGuessInput}
                            value={guessedWord}
                            onChangeText={setGuessedWord}
                            placeholder="Rate das Lösungswort..."
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
                            activeOpacity={0.8}
                          >
                            <Text style={styles.wordGuessSubmitButtonText}>
                              🎯 Wort raten
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <Text style={styles.wordGuessNotImposterText}>
                            ❌ Du bist kein Imposter
                          </Text>
                          <Text style={styles.wordGuessNotImposterSubtext}>
                            Nur Imposter können das Wort raten.
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Für offenen Modus */}
          {isOpenMode && (
            <>
              {/* Spacer für mehr Abstand */}
              <View style={{ height: 60 }} />

              {/* Zufällige Spielerreihenfolge */}
              <View style={styles.openModeContainer}>
                <Text style={styles.openModeTitle}>🎲 Zufällige Reihenfolge-Empfehlung:</Text>
                <Text style={styles.openModeSubtitle}>
                  Die Spieler können in dieser Reihenfolge ihre Hinweise geben:
                </Text>
                
                {/* Alle Spieler anzeigen */}
                <View style={styles.playersListContainer}>
                  {currentRound.playerOrder.map((playerName, index) => (
                    <View key={playerName} style={[
                      styles.playerListItem,
                      { borderColor: getPlayerColor(playerName) }
                    ]}>
                      <Text style={styles.playerNumber}>{index + 1}.</Text>
                      <Text style={[
                        styles.playerListName,
                        { color: getPlayerColor(playerName) }
                      ]}>
                        {playerName}
                      </Text>
                    </View>
                  ))}
                </View>

                {!showImposterSelection && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={styles.imposterSelectButton}
                      onPress={handleImposterSelect}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.imposterSelectButtonText}>
                        🎯 Imposter wählen
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Imposter Auswahl */}
                {showImposterSelection && (
                  <View style={styles.imposterSelectionContainer}>
                    <Text style={styles.imposterSelectionTitle}>
                      🔍 Wer ist der Imposter?
                    </Text>
                    <Text style={styles.imposterSelectionSubtitle}>
                      Wähle den Spieler aus, der deiner Meinung nach der Imposter ist:
                    </Text>

                    <View style={styles.imposterPlayersContainer}>
                      {currentRound.playerOrder.map((playerName) => (
                        <TouchableOpacity
                          key={playerName}
                          style={[
                            styles.imposterPlayerButton,
                            { borderColor: getPlayerColor(playerName) },
                            selectedImposter === playerName && {
                              backgroundColor: `${getPlayerColor(playerName)}30`,
                              borderWidth: 3,
                              transform: [{ scale: 1.02 }],
                            }
                          ]}
                          onPress={() => setSelectedImposter(playerName)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.imposterPlayerText,
                            { color: getPlayerColor(playerName) },
                            selectedImposter === playerName && styles.imposterPlayerTextSelected
                          ]}>
                            {playerName}
                          </Text>
                          {selectedImposter === playerName && (
                            <View style={styles.selectedBadge}>
                              <Text style={styles.selectedBadgeText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.imposterButtonContainer}>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={handleImposterCancel}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cancelButtonText}>❌ Abbrechen</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[
                          styles.confirmButton,
                          !selectedImposter && styles.confirmButtonDisabled
                        ]}
                        onPress={handleImposterConfirm}
                        disabled={!selectedImposter}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.confirmButtonText}>
                          ✅ Bestätigen
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Für "Nur Weiterklicken" Modus: Spielregeln zuerst, dann "Du bist dran" */}
          {!showInputFields && !isOpenMode && (
            <>
              {/* Spacer für mehr Abstand */}
              <View style={{ height: 55 }} />



              {/* Zusätzlicher Spacer zwischen Regeln und Du bist dran */}
              <View style={{ height: 40 }} />

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
                  Sage einen Hinweis zu deinem Wort an und klicke dann weiter:
                </Text>
              </View>

              {/* Button für "Nur Weiterklicken" Modus */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handlePlayerAdvanceOnly}
                >
                  <Text style={styles.submitButtonText}>
                    {isLastPlayer && offlineSettings.currentRoundNumber < offlineSettings.maxRounds 
                      ? `➡️ Weiter (Runde ${offlineSettings.currentRoundNumber + 1})` 
                      : isLastPlayer 
                      ? '🗳️ Zur Abstimmung' 
                      : '➡️ Weiter'}
                  </Text>
                </TouchableOpacity>

                {/* Imposter Wort-Rate Dropdown - für alle sichtbar */}
                <View style={styles.wordGuessContainer}>
                  <TouchableOpacity 
                    style={styles.wordGuessToggleButton}
                    onPress={toggleWordGuess}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.wordGuessToggleText}>
                      {showWordGuess ? '🔼 Wort-Raten schließen' : '🔽 Wort raten (Imposter)'}
                    </Text>
                    {!showWordGuess && (
                      <Text style={styles.wordGuessToggleSubtext}>
                        klicke zum öffnen
                      </Text>
                    )}
                  </TouchableOpacity>

                  {showWordGuess && (
                    <View style={styles.wordGuessInputContainer}>
                      {currentPlayerIsImposter ? (
                        <>
                          <Text style={styles.wordGuessHint}>
                            💡 Dein Hinweis: &quot;{offlineSettings.gameWordPair?.imposterHint}&quot;
                          </Text>
                          <TextInput
                            style={styles.wordGuessInput}
                            value={guessedWord}
                            onChangeText={setGuessedWord}
                            placeholder="Rate das Lösungswort..."
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
                            activeOpacity={0.8}
                          >
                            <Text style={styles.wordGuessSubmitButtonText}>
                              🎯 Wort raten
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <Text style={styles.wordGuessNotImposterText}>
                            ❌ Du bist kein Imposter
                          </Text>
                          <Text style={styles.wordGuessNotImposterSubtext}>
                            Nur Imposter können das Wort raten.
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>
                            {/* Spielregeln */}
              <View style={styles.rulesContainer}>
                <Text style={styles.rulesTitle}>📋 Regeln:</Text>
                <Text style={styles.rulesText}>
                  • Schau dir dein Wort/deine Rolle genau an
                </Text>
                <Text style={styles.rulesText}>
                  • Merke dir die Information für die Abstimmung
                </Text>
                <Text style={styles.rulesText}>
                  • Versuche Hinweise zu geben, die nicht zu offensichtlich sind
                </Text>
                <Text style={styles.rulesText}>
                  • Als Imposter: Du kannst das Wort raten!
                  
                </Text>
              </View>
            </>
          )}

          {/* Bisherige Hinweise - nur bei entsprechenden Spielmodi */}
          {showClues && allCluesFromAllRounds.length > 0 && (
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

          {/* Spielregeln für Input-Modi */}
          {showInputFields && (
            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>📋 Regeln:</Text>
              <Text style={styles.rulesText}>
                • Gib einen Hinweis, der zeigt, dass du das Wort kennst
              </Text>
              <Text style={styles.rulesText}>
                • Vermeide es, das Wort direkt zu nennen
              </Text>
              <Text style={styles.rulesText}>
                • Als Imposter: Versuche zu raten und mitzuspielen
              </Text>
            </View>
          )}
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
    paddingTop: 30,
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
  // Styles für offenen Modus
  openModeContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  openModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  openModeSubtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 16,
  },
  playersListContainer: {
    marginBottom: 16,
  },
  playerListItem: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
    minWidth: 20,
  },
  playerListName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  imposterSelectButton: {
    backgroundColor: '#e94560',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b8a',
  },
  imposterSelectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  imposterSelectionContainer: {
    backgroundColor: '#0f1f3d',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#e94560',
  },
  imposterSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  imposterSelectionSubtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 16,
  },
  imposterPlayersContainer: {
    marginBottom: 16,
  },
  imposterPlayerButton: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  imposterPlayerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  imposterPlayerTextSelected: {
    fontWeight: 'bold',
  },
  selectedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imposterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#888',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  confirmButtonDisabled: {
    backgroundColor: '#555',
    borderColor: '#666',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Wort-Rate Styles
  wordGuessContainer: {
    marginTop: 12,
  },
  wordGuessToggleButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA726',
  },
  wordGuessToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFA726',
  },
  wordGuessToggleSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  wordGuessInputContainer: {
    backgroundColor: '#0f1f3d',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFA726',
  },
  wordGuessHint: {
    fontSize: 13,
    color: '#FFA726',
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  wordGuessInput: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f3460',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#fff',
    marginBottom: 12,
  },
  wordGuessSubmitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  wordGuessSubmitButtonDisabled: {
    backgroundColor: '#555',
    borderColor: '#666',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  wordGuessSubmitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  wordGuessNotImposterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 4,
  },
  wordGuessNotImposterSubtext: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
  },
});
