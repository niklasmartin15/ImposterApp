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
    resetOfflineSettings,
    resetGameKeepPlayers
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

      if (isImposterEliminated && !offlineSettings.wordGuessAttempted) {
        // Ein Imposter wurde gefangen und hat noch nicht geraten -> Letzte Chance
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

  // Finde den Spieler mit den meisten Stimmen (mit Unentschieden-Logik)
  let eliminatedPlayer = sortedPlayers[0]?.[0];
  
  // Überprüfe auf Unentschieden bei den meisten Stimmen
  if (sortedPlayers.length > 1) {
    const highestVoteCount = sortedPlayers[0][1];
    const playersWithHighestVotes = sortedPlayers.filter(([, votes]) => votes === highestVoteCount);
    
    // Wenn es ein Unentschieden gibt und der Imposter dabei ist, wähle einen Nicht-Imposter aus
    if (playersWithHighestVotes.length > 1) {
      const imposterInTie = playersWithHighestVotes.find(([playerName]) => imposters.includes(playerName));
      const nonImpostersInTie = playersWithHighestVotes.filter(([playerName]) => !imposters.includes(playerName));
      
      // Wenn Imposter im Unentschieden ist und es Nicht-Imposter gibt, wähle einen Nicht-Imposter
      if (imposterInTie && nonImpostersInTie.length > 0) {
        eliminatedPlayer = nonImpostersInTie[0][0]; // Nimm den ersten Nicht-Imposter
      }
      // Ansonsten bleibt die ursprüngliche Wahl (erster Spieler mit meisten Stimmen)
    }
  }
  
  const isImposterEliminated = imposters.includes(eliminatedPlayer);

  const handleNewGame = () => {
    // Vollständiges Zurücksetzen der Spiel-Einstellungen und Neustart in Setup
    resetOfflineSettings();
    setCurrentPhase('offlineSetup');
  };

  const handleBackToLobby = () => {
    setCurrentPhase('mainLobby');
  };

  const handleNewGameWithSamePlayers = () => {
    resetGameKeepPlayers();
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
                  Hinweis: &quot;{
                    // Verwende das Wort aus wordGuessResult falls vorhanden, ansonsten gameWordPair
                    offlineSettings.wordGuessResult?.targetHint || 
                    offlineSettings.gameWordPair?.imposterHint || 
                    ''
                  }&quot;
                </Text>
              </View>
            ))}
          </View>

          {/* Das echte Wort - nur anzeigen wenn kein Imposter Last Chance bekommt */}
          {!(isImposterEliminated && !offlineSettings.wordGuessAttempted) && (
            <View style={styles.wordContainer}>
              <Text style={styles.wordTitle}>💡 Das Wort war:</Text>
              <Text style={styles.wordText}>
                {
                  // Verwende das Wort aus wordGuessResult falls vorhanden, ansonsten gameWordPair
                  offlineSettings.wordGuessResult?.targetWord || 
                  offlineSettings.gameWordPair?.word || 
                  ''
                }
              </Text>
            </View>
          )}

          {/* Hinweis für Last Chance */}
          {isImposterEliminated && !offlineSettings.wordGuessAttempted && (
            <View style={styles.lastChanceHintContainer}>
              <Text style={styles.lastChanceHintTitle}>⏳ Noch nicht vorbei!</Text>
              <Text style={styles.lastChanceHintText}>
                Der Imposter bekommt eine letzte Chance, das Wort zu erraten...
              </Text>
            </View>
          )}

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
              style={styles.newGameWithSamePlayersButton}
              onPress={handleNewGameWithSamePlayers}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🔄</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.newGameWithSamePlayersButtonText}>Neues Spiel mit gleichen Spielern</Text>
                <Text style={styles.buttonSubText}>Behalte alle Spielernamen bei</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.newGameButton}
              onPress={handleNewGame}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🎮</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.newGameButtonText}>Neues Spiel</Text>
                <Text style={styles.buttonSubText}>Vollständiger Neustart</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToLobby}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🏠</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.backButtonText}>Zurück zur Lobby</Text>
                <Text style={styles.buttonSubText}>Hauptmenü öffnen</Text>
              </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingTop: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(233, 69, 96, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  resultContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
  },
  successResult: {
    backgroundColor: '#16213e',
    borderColor: '#4CAF50',
  },
  failureResult: {
    backgroundColor: '#16213e',
    borderColor: '#e94560',
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultPlayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  votingDetailsContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  votingDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  voteResultItem: {
    marginBottom: 12,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  imposterBadge: {
    backgroundColor: '#e94560',
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  voteBar: {
    backgroundColor: '#0f3460',
    borderRadius: 6,
    height: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  voteBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 6,
  },
  voteCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  impostersContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#e94560',
  },
  impostersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
    textAlign: 'center',
  },
  imposterItem: {
    alignItems: 'center',
    marginBottom: 6,
  },
  imposterName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  imposterHint: {
    fontSize: 12,
    color: '#e94560',
    fontStyle: 'italic',
  },
  wordContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  wordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  wordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  allCluesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  allCluesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  clueItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cluePlayerName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  clueText: {
    fontSize: 12,
    color: '#eee',
    flex: 1,
    marginRight: 6,
  },
  imposterClueLabel: {
    backgroundColor: '#e94560',
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 12,
  },
  newGameButton: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 8,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b8a',
  },
  newGameButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  newGameWithSamePlayersButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#64B5F6',
  },
  newGameWithSamePlayersButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  backButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#1e4a73',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  buttonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  buttonSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  lastChanceHintContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  lastChanceHintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 6,
    textAlign: 'center',
  },
  lastChanceHintText: {
    fontSize: 12,
    color: '#eee',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
