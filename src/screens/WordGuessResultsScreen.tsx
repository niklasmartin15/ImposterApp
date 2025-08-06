import React from 'react';
import {
  View,
  Text,
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

export const WordGuessResultsScreen: React.FC = () => {
  const { 
    offlineSettings,
    setCurrentPhase,
    resetOfflineSettings,
    resetGameKeepPlayers
  } = useGameStore();

  // Animation value für Entrance-Effekt
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
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

  const getPlayerColor = (playerName: string): string => {
    if (!offlineSettings.currentRound) return PLAYER_COLORS[0];
    const playerIndex = offlineSettings.currentRound.playerOrder.indexOf(playerName);
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  };

  if (!offlineSettings.wordGuessResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#eee', fontSize: 18, textAlign: 'center' }}>
            Fehler: Kein Wort-Raten-Ergebnis gefunden.
          </Text>
          <TouchableOpacity 
            style={styles.newGameButton}
            onPress={() => setCurrentPhase('gameRounds')}
          >
            <Text style={styles.newGameButtonText}>
              🔄 Zurück zum Spiel
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { isWin, guessedWord, isLastChance, targetWord: word, targetHint: imposterHint } = offlineSettings.wordGuessResult;

  const imposters = offlineSettings.assignedRoles
    ?.filter(role => role.isImposter)
    .map(role => role.playerName) || [];

  const handleNewGame = () => {
    resetOfflineSettings();
    setCurrentPhase('offlineSetup');
  };

  const handleNewGameWithSamePlayers = () => {
    resetGameKeepPlayers();
  };

  const handleBackToLobby = () => {
    setCurrentPhase('mainLobby');
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
            <Text style={styles.title}>
              {isLastChance ? '🎯 Letzte Chance Ergebnis' : '🎯 Wort-Raten Ergebnis'}
            </Text>
          </View>

          {/* Hauptergebnis */}
          <View style={[
            styles.resultContainer,
            isWin ? styles.successResult : styles.failureResult
          ]}>
            <Text style={styles.resultEmoji}>
              {isWin ? '🎉' : '❌'}
            </Text>
            <Text style={styles.resultTitle}>
              {isWin ? 'Imposter gewinnt!' : 'Imposter verliert!'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {isWin 
                ? (isLastChance 
                    ? 'Der Imposter hat das Wort erraten!' 
                    : 'Das Wort wurde richtig erraten!')
                : (isLastChance 
                    ? 'Der Imposter konnte das Wort nicht erraten!'
                    : 'Das Wort wurde falsch erraten!')
              }
            </Text>
          </View>

          {/* Wort-Vergleich */}
          <View style={styles.wordComparisonContainer}>
            <Text style={styles.sectionTitle}>💭 Wort-Vergleich</Text>
            
            <View style={styles.wordComparisonRow}>
              <View style={styles.wordBox}>
                <Text style={styles.wordLabel}>Geratenes Wort:</Text>
                <Text style={[
                  styles.wordText,
                  { color: isWin ? '#4CAF50' : '#F44336' }
                ]}>
                  {guessedWord}
                </Text>
              </View>
              
              <View style={styles.wordBox}>
                <Text style={styles.wordLabel}>Echtes Wort:</Text>
                <Text style={[styles.wordText, { color: '#2196F3' }]}>
                  {word}
                </Text>
              </View>
            </View>
            
            <View style={styles.hintBox}>
              <Text style={styles.hintLabel}>Imposter Hinweis war:</Text>
              <Text style={styles.hintText}>&quot;{imposterHint}&quot;</Text>
            </View>
          </View>

          {/* Imposter anzeigen */}
          <View style={styles.impostersContainer}>
            <Text style={styles.sectionTitle}>🕵️ Die Imposter waren:</Text>
            {imposters.map((imposter) => (
              <View key={imposter} style={styles.imposterItem}>
                <Text style={[
                  styles.imposterName,
                  { color: getPlayerColor(imposter) }
                ]}>
                  {imposter}
                </Text>
                <Text style={styles.imposterScore}>
                  {isWin ? '+10 Punkte' : '+0 Punkte'}
                </Text>
              </View>
            ))}
          </View>

          {/* Alle Hinweise aus allen Runden */}
          {offlineSettings.allClues && offlineSettings.allClues.length > 0 && (
            <View style={styles.allCluesContainer}>
              <Text style={styles.sectionTitle}>📝 Alle Hinweise</Text>
              {offlineSettings.allClues.map((clue, index) => (
                <View key={`${clue.playerName}-${clue.roundNumber}-${index}`} style={styles.clueItem}>
                  <Text style={[
                    styles.cluePlayerName, 
                    { color: getPlayerColor(clue.playerName) }
                  ]}>
                    {clue.playerName} (R{clue.roundNumber}):
                  </Text>
                  <Text style={styles.clueText}>{clue.clue}</Text>
                  {imposters.includes(clue.playerName) && (
                    <Text style={styles.imposterClueLabel}>IMPOSTER</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.newGameWithSamePlayersButton}
              onPress={handleNewGameWithSamePlayers}
            >
              <Text style={styles.newGameWithSamePlayersButtonText}>
                🔄 Neues Spiel mit gleichen Spielern
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.newGameButton}
              onPress={handleNewGame}
            >
              <Text style={styles.newGameButtonText}>
                🎮 Neues Spiel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToLobby}
            >
              <Text style={styles.backButtonText}>
                🏠 Zurück zur Lobby
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
  },
  successResult: {
    borderColor: '#4CAF50',
  },
  failureResult: {
    borderColor: '#F44336',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
  wordComparisonContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 16,
    textAlign: 'center',
  },
  wordComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  wordBox: {
    flex: 1,
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  wordLabel: {
    fontSize: 12,
    color: '#bbb',
    marginBottom: 4,
    textAlign: 'center',
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hintBox: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  hintLabel: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 16,
    color: '#FFA726',
    fontWeight: '600',
    textAlign: 'center',
  },
  impostersContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  imposterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  imposterName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imposterScore: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  allCluesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  clueItem: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cluePlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  clueText: {
    fontSize: 14,
    color: '#eee',
    flex: 1,
  },
  imposterClueLabel: {
    fontSize: 10,
    backgroundColor: '#e94560',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  newGameButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  newGameButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  newGameWithSamePlayersButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  newGameWithSamePlayersButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0f3460',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#bbb',
  },
});
