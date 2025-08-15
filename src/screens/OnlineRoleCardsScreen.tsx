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
import { getRandomWordPairByDifficulty } from '../data/wordPairs';
import { useGameStore } from '../stores/gameStore';

interface OnlinePlayerRole {
  playerName: string;
  isImposter: boolean;
  hasSeenCard: boolean;
  isReady: boolean;
}

export const OnlineRoleCardsScreen: React.FC = () => {
  const { currentLobby, playerName, setCurrentPhase } = useGameStore();
  const [playerRoles, setPlayerRoles] = useState<OnlinePlayerRole[]>([]);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [imposterHint, setImposterHint] = useState<string>('');

  useEffect(() => {
    if (!currentLobby) {
      Alert.alert('Fehler', 'Keine Lobby gefunden.');
      setCurrentPhase('mainLobby');
      return;
    }

    // Generate roles for all players in the lobby
    const playerNames = currentLobby.players.map((player: any) => 
      typeof player === 'string' ? player : player.name
    );

    // Randomly assign imposter roles
    const shuffledIndices = Array.from({ length: playerNames.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5);
    
    // At least 1 imposter, but not more than half the players
    const imposterCount = Math.max(1, Math.floor(playerNames.length / 3));
    const imposterIndices = shuffledIndices.slice(0, imposterCount);

    const roles: OnlinePlayerRole[] = playerNames.map((name: string, index: number) => ({
      playerName: name,
      isImposter: imposterIndices.includes(index),
      hasSeenCard: false,
      isReady: false,
    }));

    setPlayerRoles(roles);

    // Generate word pair based on lobby settings
    const difficulty = currentLobby.settings?.wordDifficulty || 'medium';
    const wordPair = getRandomWordPairByDifficulty(difficulty);
    setCurrentWord(wordPair.word);
    setImposterHint(wordPair.imposterHint);
  }, [currentLobby, setCurrentPhase]);

  const handleCardPress = (targetPlayerName: string) => {
    if (targetPlayerName !== playerName) {
      Alert.alert('Hinweis', 'Du kannst nur deine eigene Karte ansehen.');
      return;
    }

    setPlayerRoles(prev => 
      prev.map(role => 
        role.playerName === targetPlayerName 
          ? { ...role, hasSeenCard: true }
          : role
      )
    );
  };

  const handleToggleReady = () => {
    const currentPlayerRole = playerRoles.find(role => role.playerName === playerName);
    if (!currentPlayerRole?.hasSeenCard) {
      Alert.alert('Hinweis', 'Du musst zuerst deine Rollenkarte ansehen.');
      return;
    }

    setPlayerRoles(prev => 
      prev.map(role => 
        role.playerName === playerName 
          ? { ...role, isReady: !role.isReady }
          : role
      )
    );
  };

  const handleContinueToGame = () => {
    // Check if all players are ready
    const allPlayersReady = playerRoles.every(role => role.isReady);
    if (!allPlayersReady) {
      Alert.alert('Hinweis', 'Alle Spieler müssen bereit sein bevor das Spiel startet.');
      return;
    }

    // In a real implementation, this would navigate to the online game rounds
    Alert.alert(
      'Spiel startet!', 
      'Das Online-Spiel würde jetzt beginnen. Dies wird in einer zukünftigen Version implementiert.',
      [
        { text: 'Zurück zur Lobby', onPress: () => setCurrentPhase('gameRoom') }
      ]
    );
  };

  const getCurrentPlayerRole = () => {
    return playerRoles.find(role => role.playerName === playerName);
  };

  const getOtherPlayers = () => {
    return playerRoles.filter(role => role.playerName !== playerName);
  };

  const renderMyCard = () => {
    const myRole = getCurrentPlayerRole();
    if (!myRole) return null;

    if (!myRole.hasSeenCard) {
      return (
        <TouchableOpacity 
          style={[styles.myCard, styles.cardClosed]}
          onPress={() => handleCardPress(myRole.playerName)}
        >
          <Text style={styles.cardTitle}>Deine Rollenkarte</Text>
          <View style={styles.cardBack}>
            <Text style={styles.cardBackText}>🎭</Text>
            <Text style={styles.cardBackLabel}>Tippen zum Aufdecken</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.myCard, styles.cardOpen]}>
        <Text style={styles.cardTitle}>Deine Rolle</Text>
        <View style={styles.cardFront}>
          {myRole.isImposter ? (
            <>
              <Text style={styles.roleTitle}>🕵️ IMPOSTER</Text>
              <Text style={styles.wordText}>Dein Hinweis:</Text>
              <Text style={styles.word}>{imposterHint}</Text>
              <Text style={styles.instruction}>
                Du kennst das echte Wort nicht! Versuche es herauszufinden, ohne aufzufallen.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.roleTitle}>👤 ZIVILIST</Text>
              <Text style={styles.wordText}>Dein Wort:</Text>
              <Text style={styles.word}>{currentWord}</Text>
              <Text style={styles.instruction}>
                Finde den Imposter! Gib Hinweise zu deinem Wort.
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rollenkarten</Text>
        <Text style={styles.subtitle}>
          {currentLobby?.name} - Online Spiel
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Deine Rollenkarte</Text>
        <Text style={styles.instruction}>
          Tippe auf deine Karte um deine Rolle zu sehen.
        </Text>

        {renderMyCard()}

        {getCurrentPlayerRole()?.hasSeenCard && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Andere Spieler</Text>
            <View style={styles.playersContainer}>
              {getOtherPlayers().map((player, index) => (
                <View key={index} style={styles.playerItem}>
                  <Text style={styles.playerItemName}>{player.playerName}</Text>
                  <Text style={styles.playerStatus}>
                    {player.isReady ? '✅ Bereit' : '⏳ Nicht bereit'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameInfoTitle}>📋 Spiel-Informationen</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Spieler bereit:</Text>
                <Text style={styles.infoValue}>
                  {playerRoles.filter(r => r.isReady).length} von {playerRoles.length}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Spielmodus:</Text>
                <Text style={styles.infoValue}>{currentLobby?.gameMode || 'Standard'}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        {getCurrentPlayerRole()?.hasSeenCard ? (
          <>
            <TouchableOpacity
              style={[
                styles.readyButton,
                getCurrentPlayerRole()?.isReady && styles.readyButtonActive
              ]}
              onPress={handleToggleReady}
            >
              <Text style={[
                styles.readyButtonText,
                getCurrentPlayerRole()?.isReady && styles.readyButtonTextActive
              ]}>
                {getCurrentPlayerRole()?.isReady ? '✅ Bereit' : '⏱️ Bereit'}
              </Text>
            </TouchableOpacity>

            {playerRoles.every(role => role.isReady) && (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinueToGame}
              >
                <Text style={styles.continueButtonText}>▶️ Spiel starten</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Tippe auf deine Karte um zu beginnen
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentPhase('gameRoom')}
        >
          <Text style={styles.backButtonText}>← Zurück zur Lobby</Text>
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
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbb',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 20,
    lineHeight: 20,
  },
  // My Card Styles
  myCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  cardClosed: {
    borderColor: '#e94560',
  },
  cardOpen: {
    borderColor: '#2ecc71',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardBack: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardBackText: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardBackLabel: {
    fontSize: 14,
    color: '#bbb',
  },
  cardFront: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 12,
  },
  wordText: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 8,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  // Players List Styles
  playersContainer: {
    gap: 8,
    marginBottom: 20,
  },
  playerItem: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  playerStatus: {
    fontSize: 14,
    color: '#bbb',
  },
  // Game Info
  gameInfo: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  gameInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#bbb',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Bottom Actions
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
  readyButtonActive: {
    backgroundColor: '#2ecc71',
  },
  readyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  readyButtonTextActive: {
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  waitingContainer: {
    backgroundColor: '#2a2a3e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
