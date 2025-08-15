import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import OnlineService from '../services/OnlineService';
import { useGameStore } from '../stores/gameStore';

interface OnlineLobby {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  host: string;
  gameMode: string;
  isPasswordProtected: boolean;
}

export const LobbyBrowserScreen: React.FC = () => {
  const [lobbies, setLobbies] = useState<OnlineLobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchLobbiesData = async () => {
      setIsLoading(true);
      try {
        const fetchedLobbies = await OnlineService.getInstance().getLobbies();
        setLobbies(fetchedLobbies);
      } catch (error) {
        console.error('Failed to fetch lobbies:', error);
        Alert.alert('Fehler', 'Konnte Lobbies nicht laden. Versuche es später erneut.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLobbiesData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fetchedLobbies = await OnlineService.getInstance().getLobbies();
      setLobbies(fetchedLobbies);
    } catch (error) {
      console.error('Failed to refresh lobbies:', error);
      Alert.alert('Fehler', 'Konnte Lobbies nicht aktualisieren.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinLobby = async (lobbyId: string) => {
    try {
      setIsLoading(true);
      const result = await OnlineService.getInstance().joinLobby(lobbyId);
      
      if (result.success) {
        // Store the lobby in the game store
        const { setCurrentLobby, setCurrentPhase } = useGameStore.getState();
        setCurrentLobby(result.lobby);
        setCurrentPhase('gameRoom');
      } else {
        Alert.alert('Fehler', 'Konnte der Lobby nicht beitreten. Versuche es erneut.');
      }
    } catch (error) {
      console.error('Failed to join lobby:', error);
      Alert.alert('Fehler', 'Fehler beim Beitreten der Lobby.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMenu = () => {
    const { setCurrentPhase } = useGameStore.getState();
    setCurrentPhase('mainLobby');
  };

  const renderLobbyItem = (lobby: OnlineLobby) => (
    <View key={lobby.id} style={styles.lobbyCard}>
      <View style={styles.lobbyHeader}>
        <View style={styles.lobbyInfo}>
          <Text style={styles.lobbyName}>{lobby.name}</Text>
          <Text style={styles.lobbyHost}>Host: {lobby.host}</Text>
        </View>
        <View style={styles.lobbyMeta}>
          {lobby.isPasswordProtected && (
            <Text style={styles.passwordIcon}>🔒</Text>
          )}
          <Text style={styles.playerCount}>
            {lobby.players}/{lobby.maxPlayers}
          </Text>
        </View>
      </View>
      
      <View style={styles.lobbyDetails}>
        <Text style={styles.gameMode}>{lobby.gameMode}</Text>
        <TouchableOpacity
          style={[
            styles.joinButton,
            lobby.players >= lobby.maxPlayers && styles.joinButtonDisabled
          ]}
          onPress={() => handleJoinLobby(lobby.id)}
          disabled={lobby.players >= lobby.maxPlayers}
        >
          <Text style={[
            styles.joinButtonText,
            lobby.players >= lobby.maxPlayers && styles.joinButtonTextDisabled
          ]}>
            {lobby.players >= lobby.maxPlayers ? 'Voll' : 'Beitreten'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToMenu}
        >
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Offene Lobbies</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Lade Lobbies...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#e94560']}
              tintColor="#e94560"
            />
          }
        >
          {lobbies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Keine Lobbies gefunden</Text>
              <Text style={styles.emptyDescription}>
                Derzeit sind keine offenen Lobbies verfügbar.{'\n'}
                Ziehe nach unten zum Aktualisieren oder erstelle eine neue Lobby.
              </Text>
            </View>
          ) : (
            <View style={styles.lobbiesContainer}>
              {lobbies.map(renderLobbyItem)}
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.createLobbyButton}
          onPress={() => {
            const { setCurrentPhase } = useGameStore.getState();
            setCurrentPhase('createLobby');
          }}
        >
          <Text style={styles.createLobbyButtonText}>➕ Neue Lobby erstellen</Text>
        </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#bbb',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 20,
  },
  lobbiesContainer: {
    gap: 12,
  },
  lobbyCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  lobbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lobbyInfo: {
    flex: 1,
  },
  lobbyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  lobbyHost: {
    fontSize: 14,
    color: '#bbb',
  },
  lobbyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordIcon: {
    fontSize: 16,
  },
  playerCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e94560',
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lobbyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameMode: {
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#666',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  joinButtonTextDisabled: {
    color: '#ccc',
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  createLobbyButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createLobbyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
