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
    setCurrentPhase 
  } = useGameStore();
  
  const [currentClue, setCurrentClue] = useState('');

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

  const handleSubmitClue = () => {
    if (currentClue.trim() === '') {
      return;
    }

    submitPlayerClue(currentClue.trim());
    setCurrentClue('');
    nextPlayer();
  };

  const handleBackToCards = () => {
    setCurrentPhase('offlineGame');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header mit Fortschritt */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🎯 Runde 1</Text>
            <Text style={styles.progressText}>
              Spieler {currentRound.currentPlayerIndex + 1} von {currentRound.playerOrder.length}
            </Text>
          </View>

          {/* Bisherige Hinweise */}
          {currentRound.clues.length > 0 && (
            <View style={styles.cluesContainer}>
              <Text style={styles.cluesTitle}>💭 Bisherige Hinweise:</Text>
              {currentRound.clues.map((clue, index) => (
                <View key={index} style={styles.clueItem}>
                  <Text style={[
                    styles.cluePlayerName, 
                    { color: getPlayerColor(clue.playerName) }
                  ]}>
                    {clue.playerName}:
                  </Text>
                  <Text style={styles.clueText}>{clue.clue}</Text>
                </View>
              ))}
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
                {isLastPlayer ? '🏁 Runde beenden' : '➡️ Weiter'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToCards}
            >
              <Text style={styles.backButtonText}>← Zurück zu den Karten</Text>
            </TouchableOpacity>
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
});
