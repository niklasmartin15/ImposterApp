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
            <Text style={styles.progressText}>
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
  votesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  votesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e94560',
    marginBottom: 12,
    textAlign: 'center',
  },
  voteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  voterName: {
    fontSize: 16,
    fontWeight: '600',
  },
  voteArrow: {
    fontSize: 16,
    color: '#bbb',
    marginHorizontal: 12,
  },
  targetName: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentVoterContainer: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  currentVoterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bbb',
    marginBottom: 8,
  },
  currentVoterName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
  },
  playersContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 16,
    textAlign: 'center',
  },
  playerButton: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  playerButtonTextSelected: {
    fontWeight: 'bold',
  },
  currentChoiceBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  currentChoiceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  voteCountBadge: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  voteCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
});
