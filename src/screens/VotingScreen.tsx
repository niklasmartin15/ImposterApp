import React, { useState } from 'react';
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

export const VotingScreen: React.FC = () => {
  const { 
    offlineSettings, 
    submitVote, 
    nextVoter, 
    startVoting 
  } = useGameStore();
  
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [showAllClues, setShowAllClues] = useState(false);

  // Funktion um Spielerfarbe zu bekommen
  const getPlayerColor = (playerName: string): string => {
    if (!offlineSettings.votingState) return PLAYER_COLORS[0];
    const playerIndex = offlineSettings.votingState.playerOrder.indexOf(playerName);
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  };

  // Starte Voting wenn noch nicht gestartet
  React.useEffect(() => {
    if (!offlineSettings.votingState) {
      startVoting();
    }
  }, [offlineSettings.votingState, startVoting]);

  if (!offlineSettings.votingState) {
    return null;
  }

  const votingState = offlineSettings.votingState;
  const currentVoter = votingState.playerOrder[votingState.currentVoterIndex];
  const otherPlayers = votingState.playerOrder.filter(player => player !== currentVoter);
  
  // Alle Hinweise aus allen Runden anzeigen
  const allClues = offlineSettings.allClues;
  const cluestoShow = showAllClues ? allClues : allClues.slice(-2);

  const handleSubmitVote = () => {
    if (selectedPlayer) {
      submitVote(selectedPlayer);
      nextVoter();
      setSelectedPlayer('');
    }
  };

  const getVoteCount = (playerName: string): number => {
    return votingState.votes.filter(vote => vote.targetName === playerName).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🗳️ Abstimmung</Text>
            <Text style={styles.subtitle}>
              {votingState.votes.length} von {votingState.playerOrder.length} Stimmen abgegeben
            </Text>
          </View>

          {/* Alle Hinweise anzeigen */}
          <View style={styles.cluesContainer}>
            <View style={styles.cluesHeader}>
              <Text style={styles.cluesTitle}>💡 Alle Hinweise</Text>
              {allClues.length > 2 && (
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
              <View key={`${clue.playerName}-${clue.roundNumber}-${index}`} style={styles.clueItem}>
                <Text style={[
                  styles.cluePlayerName, 
                  { color: getPlayerColor(clue.playerName) }
                ]}>
                  {clue.playerName} (R{clue.roundNumber}):
                </Text>
                <Text style={styles.clueText}>{clue.clue}</Text>
              </View>
            ))}
            {!showAllClues && allClues.length > 2 && (
              <Text style={styles.hiddenCluesText}>
                ... und {allClues.length - 2} weitere Hinweise
              </Text>
            )}
          </View>

          {/* Aktueller Wähler */}
          <View style={[
            styles.currentVoterContainer,
            { borderColor: getPlayerColor(currentVoter) }
          ]}>
            <Text style={styles.currentVoterTitle}>🗳️ Du bist dran:</Text>
            <Text style={[
              styles.currentVoterName, 
              { color: getPlayerColor(currentVoter) }
            ]}>
              {currentVoter}
            </Text>
            <Text style={styles.instructionText}>
              Wer ist deiner Meinung nach der Imposter?
            </Text>
          </View>

          {/* Spieler zur Auswahl */}
          <View style={styles.playersContainer}>
            <Text style={styles.playersTitle}>Spieler auswählen:</Text>
            {otherPlayers.map((player) => {
              const playerColor = getPlayerColor(player);
              const isSelected = selectedPlayer === player;
              
              return (
                <TouchableOpacity
                  key={player}
                  style={[
                    styles.playerButton,
                    { borderColor: playerColor },
                    isSelected && {
                      backgroundColor: `${playerColor}30`, // 30% Transparenz der Spielerfarbe
                      borderWidth: 3,
                      transform: [{ scale: 1.05 }], // Etwas größer machen
                    }
                  ]}
                  onPress={() => setSelectedPlayer(player)}
                >
                  <View style={styles.playerButtonContent}>
                    <Text style={[
                      styles.playerButtonText,
                      isSelected && styles.playerButtonTextSelected,
                      { color: playerColor }
                    ]}>
                      {player}
                    </Text>
                    {isSelected && (
                      <View style={styles.currentChoiceBadge}>
                        <Text style={styles.currentChoiceText}>aktuelle Wahl</Text>
                      </View>
                    )}
                  </View>
                  {getVoteCount(player) > 0 && (
                    <View style={styles.voteCountBadge}>
                      <Text style={styles.voteCountText}>{getVoteCount(player)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.submitButton,
                !selectedPlayer && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitVote}
              disabled={!selectedPlayer}
            >
              <Text style={styles.submitButtonText}>
                🗳️ Stimme abgeben
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bisherige Votes anzeigen */}
          {votingState.votes.length > 0 && (
            <View style={styles.votesContainer}>
              <Text style={styles.votesTitle}>📊 Bisherige Stimmen</Text>
              {votingState.votes.map((vote, index) => (
                <View key={index} style={styles.voteItem}>
                  <Text style={[
                    styles.voterName, 
                    { color: getPlayerColor(vote.voterName) }
                  ]}>
                    {vote.voterName}
                  </Text>
                  <Text style={styles.voteArrow}>→</Text>
                  <Text style={[
                    styles.targetName, 
                    { color: getPlayerColor(vote.targetName) }
                  ]}>
                    {vote.targetName}
                  </Text>
                </View>
              ))}
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
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 20,
  },
  cluesContainer: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ff6b8a',
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
  },
  cluePlayerName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 6,
  },
  clueText: {
    fontSize: 13,
    color: '#eee',
    flex: 1,
  },
  hiddenCluesText: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
  },
  votesContainer: {
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
  votesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
    textAlign: 'center',
  },
  voteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'center',
  },
  voterName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  voteArrow: {
    fontSize: 14,
    color: '#bbb',
    marginHorizontal: 8,
  },
  targetName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  currentVoterContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
  },
  currentVoterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#bbb',
    marginBottom: 6,
  },
  currentVoterName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 13,
    color: '#eee',
    textAlign: 'center',
  },
  playersContainer: {
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
  playersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  playerButton: {
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
  playerButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  playerButtonTextSelected: {
    fontWeight: 'bold',
  },
  currentChoiceBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  currentChoiceText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  voteCountBadge: {
    backgroundColor: '#e94560',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  voteCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
});
