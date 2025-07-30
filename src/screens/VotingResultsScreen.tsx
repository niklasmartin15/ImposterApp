import React from 'react';
import {
  View,
  Text,
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

export const VotingResultsScreen: React.FC = () => {
  const { 
    offlineSettings, 
    setCurrentPhase,
    resetOfflineSettings
  } = useGameStore();

  // Funktion um Spielerfarbe zu bekommen
  const getPlayerColor = (playerName: string): string => {
    if (!offlineSettings.votingState) return PLAYER_COLORS[0];
    const playerIndex = offlineSettings.votingState.playerOrder.indexOf(playerName);
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  };

  // Berechne Voting-Ergebnisse
  const votingState = offlineSettings.votingState;
  const assignedRoles = offlineSettings.assignedRoles;

  // Prüfe ob Imposter "letzte Chance" bekommen soll
  React.useEffect(() => {
    if (votingState && assignedRoles) {
      // Stimmen zählen
      const voteCount: { [playerName: string]: number } = {};
      votingState.playerOrder.forEach(player => {
        voteCount[player] = 0;
      });
      
      votingState.votes.forEach(vote => {
        voteCount[vote.targetName]++;
      });

      // Spieler nach Stimmenanzahl sortieren
      const sortedPlayers = Object.entries(voteCount)
        .sort(([,a], [,b]) => b - a);

      // Überprüfe wer die Imposter sind
      const imposters = assignedRoles
        .filter(role => role.isImposter)
        .map(role => role.playerName);

      // Finde den Spieler mit den meisten Stimmen
      const eliminatedPlayer = sortedPlayers[0]?.[0];
      const isImposterEliminated = imposters.includes(eliminatedPlayer);

      if (!isImposterEliminated && !offlineSettings.wordGuessAttempted) {
        // Imposter wurde nicht gefangen und hat noch nicht geraten -> Letzte Chance
        const timer = setTimeout(() => {
          setCurrentPhase('imposterLastChance');
        }, 3000); // 3 Sekunden anzeigen, dann zur letzten Chance
        
        return () => clearTimeout(timer);
      }
    }
  }, [votingState, assignedRoles, offlineSettings.wordGuessAttempted, setCurrentPhase]);

  if (!votingState || !assignedRoles) {
    return null;
  }
  
  // Stimmen zählen
  const voteCount: { [playerName: string]: number } = {};
  votingState.playerOrder.forEach(player => {
    voteCount[player] = 0;
  });
  
  votingState.votes.forEach(vote => {
    voteCount[vote.targetName]++;
  });

  // Spieler nach Stimmenanzahl sortieren
  const sortedPlayers = Object.entries(voteCount)
    .sort(([,a], [,b]) => b - a);

  // Überprüfe wer die Imposter sind
  const imposters = assignedRoles
    .filter(role => role.isImposter)
    .map(role => role.playerName);

  // Finde den Spieler mit den meisten Stimmen
  const eliminatedPlayer = sortedPlayers[0]?.[0];
  const isImposterEliminated = imposters.includes(eliminatedPlayer);

  const handleNewGame = () => {
    resetOfflineSettings();
    setCurrentPhase('mainLobby');
  };

  const handleBackToLobby = () => {
    setCurrentPhase('mainLobby');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>📊 Abstimmungsergebnis</Text>
          </View>

          {/* Ergebnis */}
          <View style={[
            styles.resultContainer,
            isImposterEliminated ? styles.successResult : styles.failureResult
          ]}>
            <Text style={styles.resultEmoji}>
              {isImposterEliminated ? '🎉' : '😈'}
            </Text>
            <Text style={styles.resultTitle}>
              {isImposterEliminated ? 'Imposter gefunden!' : 'Imposter entkommen!'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {eliminatedPlayer} wurde eliminiert
            </Text>
            <Text style={[
              styles.resultPlayerName,
              { color: getPlayerColor(eliminatedPlayer) }
            ]}>
              {eliminatedPlayer} {isImposterEliminated ? 'war der Imposter' : 'war unschuldig'}
            </Text>
          </View>

          {/* Voting Details */}
          <View style={styles.votingDetailsContainer}>
            <Text style={styles.votingDetailsTitle}>🗳️ Stimmenverteilung</Text>
            {sortedPlayers.map(([playerName, votes]) => (
              <View key={playerName} style={styles.voteResultItem}>
                <View style={styles.playerInfo}>
                  <Text style={[
                    styles.playerName, 
                    { color: getPlayerColor(playerName) }
                  ]}>
                    {playerName}
                  </Text>
                  {imposters.includes(playerName) && (
                    <Text style={styles.imposterBadge}>IMPOSTER</Text>
                  )}
                </View>
                <View style={styles.voteBar}>
                  <View 
                    style={[
                      styles.voteBarFill, 
                      { 
                        width: `${Math.max(10, (votes / votingState.playerOrder.length) * 100)}%`,
                        backgroundColor: playerName === eliminatedPlayer ? '#e94560' : getPlayerColor(playerName)
                      }
                    ]} 
                  />
                  <Text style={styles.voteCount}>{votes} Stimme(n)</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Alle Imposter anzeigen */}
          <View style={styles.impostersContainer}>
            <Text style={styles.impostersTitle}>🕵️ Die Imposter waren:</Text>
            {imposters.map((imposter) => (
              <View key={imposter} style={styles.imposterItem}>
                <Text style={[
                  styles.imposterName,
                  { color: getPlayerColor(imposter) }
                ]}>
                  {imposter}
                </Text>
                <Text style={styles.imposterHint}>
                  Hinweis: &quot;{offlineSettings.currentWordPair?.imposterHint}&quot;
                </Text>
              </View>
            ))}
          </View>

          {/* Das echte Wort */}
          <View style={styles.wordContainer}>
            <Text style={styles.wordTitle}>💡 Das Wort war:</Text>
            <Text style={styles.wordText}>
              {offlineSettings.currentWordPair?.word}
            </Text>
          </View>

          {/* Alle Hinweise */}
          <View style={styles.allCluesContainer}>
            <Text style={styles.allCluesTitle}>📝 Alle Hinweise</Text>
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

          {/* Buttons */}
          <View style={styles.buttonContainer}>
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
  },
  resultContainer: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  successResult: {
    backgroundColor: '#1b2f1b',
    borderColor: '#4CAF50',
  },
  failureResult: {
    backgroundColor: '#2f1b1b',
    borderColor: '#e94560',
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
    marginBottom: 12,
  },
  resultPlayerName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  votingDetailsContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  votingDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 16,
    textAlign: 'center',
  },
  voteResultItem: {
    marginBottom: 16,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  imposterBadge: {
    backgroundColor: '#e94560',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  voteBar: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    height: 24,
    position: 'relative',
    justifyContent: 'center',
  },
  voteBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 8,
  },
  voteCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  impostersContainer: {
    backgroundColor: '#2f1b1b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  impostersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e94560',
    marginBottom: 12,
    textAlign: 'center',
  },
  imposterItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  imposterName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  imposterHint: {
    fontSize: 14,
    color: '#e94560',
    fontStyle: 'italic',
  },
  wordContainer: {
    backgroundColor: '#1b2f1b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  wordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
  },
  allCluesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  allCluesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 12,
    textAlign: 'center',
  },
  clueItem: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cluePlayerName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  clueText: {
    fontSize: 14,
    color: '#eee',
    flex: 1,
    marginRight: 8,
  },
  imposterClueLabel: {
    backgroundColor: '#e94560',
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  newGameButton: {
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
  newGameButtonText: {
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
});
