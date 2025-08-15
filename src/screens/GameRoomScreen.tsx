import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import OnlineService from '../services/OnlineService';
import { useGameStore } from '../stores/gameStore';

export const GameRoomScreen: React.FC = () => {
  const { currentLobby, playerName, setCurrentPhase, setCurrentLobby } = useGameStore();
  
  // Ensure players is always an array
  const getPlayersArray = (lobby: any) => {
    if (!lobby) return [];
    if (Array.isArray(lobby.players)) return lobby.players;
    if (typeof lobby.players === 'number') {
      // If players is just a count, create mock players
      return Array.from({ length: lobby.players }, (_, i) => ({
        id: `player-${i}`,
        name: i === 0 ? (lobby.hostName || lobby.host) : `Player ${i + 1}`,
        isReady: false
      }));
    }
    return [];
  };
  
  const [players, setPlayers] = useState(getPlayersArray(currentLobby));

  useEffect(() => {
    if (!currentLobby) {
      Alert.alert('Fehler', 'Keine Lobby gefunden.');
      setCurrentPhase('mainLobby');
      return;
    }

    // Set initial players
    setPlayers(getPlayersArray(currentLobby));

    // Connect to lobby for real-time updates
    const disconnect = OnlineService.getInstance().connectToLobby(
      currentLobby.id,
      (data) => {
        if (data.type === 'LOBBY_UPDATE') {
          const newPlayers = getPlayersArray(data.data);
          setPlayers(newPlayers);
        }
      }
    );

    return disconnect;
  }, [currentLobby, setCurrentPhase]);

  const handleLeaveLobby = async () => {
    if (!currentLobby) return;

    try {
      await OnlineService.getInstance().leaveLobby(currentLobby.id);
      setCurrentLobby(null);
      setCurrentPhase('mainLobby');
    } catch (error) {
      console.error('Failed to leave lobby:', error);
      Alert.alert('Fehler', 'Fehler beim Verlassen der Lobby.');
    }
  };

  const handleStartGame = () => {
    Alert.alert('Info', 'Spiel starten wird in einer zukünftigen Version implementiert.');
  };

  const handleToggleReady = () => {
    Alert.alert('Info', 'Bereit-Status wird in einer zukünftigen Version implementiert.');
  };

  if (!currentLobby) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Keine Lobby gefunden</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentPhase('mainLobby')}
          >
            <Text style={styles.backButtonText}>Zurück zum Hauptmenü</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isHost = currentLobby.hostId === OnlineService.getInstance().getPlayerInfo().id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.leaveButton}
          onPress={handleLeaveLobby}
        >
          <Text style={styles.leaveButtonText}>← Verlassen</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{currentLobby.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.lobbyInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Host:</Text>
            <Text style={styles.infoValue}>{currentLobby.host}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Spielmodus:</Text>
            <Text style={styles.infoValue}>{currentLobby.gameMode}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Spieler:</Text>
            <Text style={styles.infoValue}>
              {players.length}/{currentLobby.maxPlayers}
            </Text>
          </View>
          {currentLobby.isPasswordProtected && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🔒</Text>
              <Text style={styles.infoValue}>Passwort-geschützt</Text>
            </View>
          )}
        </View>

        <View style={styles.playersSection}>
          <Text style={styles.sectionTitle}>Spieler in der Lobby</Text>
          <View style={styles.playersList}>
            {Array.isArray(players) && players.map((player, index) => (
              <View key={player.id || index} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {player.name}
                    {player.name === currentLobby?.host && ' 👑'}
                    {player.name === playerName && ' (Du)'}
                  </Text>
                  <Text style={styles.playerStatus}>
                    {player.isReady ? '✅ Bereit' : '⏳ Nicht bereit'}
                  </Text>
                </View>
              </View>
            ))}
            
            {/* Show empty slots */}
            {currentLobby && Array.from({ length: currentLobby.maxPlayers - (Array.isArray(players) ? players.length : 0) }).map((_, index) => (
              <View key={`empty-${index}`} style={[styles.playerCard, styles.emptySlot]}>
                <Text style={styles.emptySlotText}>Warten auf Spieler...</Text>
              </View>
            ))}
          </View>
        </View>

        {currentLobby.settings && (
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Spiel-Einstellungen</Text>
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Wort-Schwierigkeit:</Text>
                <Text style={styles.settingValue}>{currentLobby.settings.wordDifficulty}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Max. Runden:</Text>
                <Text style={styles.settingValue}>{currentLobby.settings.maxRounds}</Text>
              </View>
              {currentLobby.settings.timerEnabled && (
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Timer:</Text>
                  <Text style={styles.settingValue}>
                    {currentLobby.settings.timerDuration}s pro Zug
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.readyButton}
          onPress={handleToggleReady}
        >
          <Text style={styles.readyButtonText}>⏱️ Bereit</Text>
        </TouchableOpacity>

        {isHost && (
          <TouchableOpacity
            style={[
              styles.startButton,
              players.length < 3 && styles.startButtonDisabled
            ]}
            onPress={handleStartGame}
            disabled={players.length < 3}
          >
            <Text style={[
              styles.startButtonText,
              players.length < 3 && styles.startButtonTextDisabled
            ]}>
              🚀 Spiel starten
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  leaveButton: {
    padding: 8,
  },
  leaveButtonText: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lobbyInfo: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#bbb',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  playersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  playersList: {
    gap: 8,
  },
  playerCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  emptySlot: {
    backgroundColor: '#1a1a2e',
    borderStyle: 'dashed',
    borderColor: '#666',
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  playerStatus: {
    fontSize: 14,
    color: '#bbb',
  },
  emptySlotText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsList: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#bbb',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bottomActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    gap: 12,
  },
  readyButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  readyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#666',
    elevation: 0,
    shadowOpacity: 0,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  startButtonTextDisabled: {
    color: '#ccc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#e94560',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
