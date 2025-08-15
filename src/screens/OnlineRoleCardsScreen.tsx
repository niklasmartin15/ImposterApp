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

  const handleContinueToGame = () => {
    // Check if current player has seen their card
    const currentPlayerRole = playerRoles.find(role => role.playerName === playerName);
    if (!currentPlayerRole?.hasSeenCard) {
      Alert.alert('Hinweis', 'Du musst zuerst deine Rollenkarte ansehen.');
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

  const getPlayerCard = (role: OnlinePlayerRole) => {
    const isCurrentPlayer = role.playerName === playerName;
    
    if (!isCurrentPlayer) {
      return (
        <View style={[styles.playerCard, styles.otherPlayerCard]}>
          <Text style={styles.playerName}>{role.playerName}</Text>
          <View style={styles.cardBack}>
            <Text style={styles.cardBackText}>🎭</Text>
            <Text style={styles.cardBackLabel}>Rollenkarte</Text>
          </View>
        </View>
      );
    }

    if (!role.hasSeenCard) {
      return (
        <TouchableOpacity 
          style={[styles.playerCard, styles.currentPlayerCard]}
          onPress={() => handleCardPress(role.playerName)}
        >
          <Text style={styles.playerName}>{role.playerName} (Du)</Text>
          <View style={styles.cardBack}>
            <Text style={styles.cardBackText}>🎭</Text>
            <Text style={styles.cardBackLabel}>Tippen zum Aufdecken</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.playerCard, styles.currentPlayerCard, styles.cardRevealed]}>
        <Text style={styles.playerName}>{role.playerName} (Du)</Text>
        <View style={styles.cardFront}>
          {role.isImposter ? (
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

  const allPlayersSeenCards = playerRoles.every(role => 
    role.playerName === playerName ? role.hasSeenCard : true
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rollenkarten</Text>
        <Text style={styles.subtitle}>
          {currentLobby?.name} - Online Spiel
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Spieler Rollen</Text>
        <Text style={styles.instruction}>
          Tippe auf deine Karte um deine Rolle zu sehen. Die anderen Karten bleiben verdeckt.
        </Text>

        <View style={styles.cardsContainer}>
          {playerRoles.map((role, index) => (
            <View key={index} style={styles.cardWrapper}>
              {getPlayerCard(role)}
            </View>
          ))}
        </View>

        {getCurrentPlayerRole()?.hasSeenCard && (
          <View style={styles.gameInfo}>
            <Text style={styles.gameInfoTitle}>📋 Spiel-Informationen</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Imposter:</Text>
              <Text style={styles.infoValue}>
                {playerRoles.filter(r => r.isImposter).length} von {playerRoles.length}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Spielmodus:</Text>
              <Text style={styles.infoValue}>{currentLobby?.gameMode || 'Standard'}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        {allPlayersSeenCards ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinueToGame}
          >
            <Text style={styles.continueButtonText}>▶️ Spiel fortsetzen</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              {getCurrentPlayerRole()?.hasSeenCard 
                ? 'Warten auf andere Spieler...'
                : 'Tippe auf deine Karte um zu beginnen'
              }
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
  cardsContainer: {
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  playerCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3a3a4e',
  },
  otherPlayerCard: {
    opacity: 0.7,
  },
  currentPlayerCard: {
    borderColor: '#e94560',
  },
  cardRevealed: {
    borderColor: '#2ecc71',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
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
  bottomActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#2ecc71',
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
