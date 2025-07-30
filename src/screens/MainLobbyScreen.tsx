import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

export const MainLobbyScreen: React.FC = () => {
  const { playerName } = useGameStore();

  const handleStartGame = () => {
    // TODO: Implement game start logic
    console.log('Spiel starten geklickt!');
  };

  const handleBack = () => {
    const { setCurrentPhase } = useGameStore.getState();
    setCurrentPhase('nameInput');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>Willkommen,</Text>
          <Text style={styles.playerName}>{playerName}! 👋</Text>
        </View>

        <View style={styles.gameInfoContainer}>
          <Text style={styles.gameTitle}>🕵️ Imposter</Text>
          <Text style={styles.gameDescription}>
            Bereit für eine Runde voller Geheimnisse und Täuschung?
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartGame}
          >
            <Text style={styles.startButtonText}>🎮 Spiel starten</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>← Namen ändern</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonText}>
            Weitere Features kommen bald:
          </Text>
          <Text style={styles.featureText}>• Online Multiplayer</Text>
          <Text style={styles.featureText}>• Raum beitreten/erstellen</Text>
          <Text style={styles.featureText}>• Offline Pass-and-Play</Text>
          <Text style={styles.featureText}>• Verschiedene Wortlisten</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
  },
  gameInfoContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  gameTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 16,
  },
  gameDescription: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#e94560',
    paddingVertical: 18,
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
  startButtonText: {
    fontSize: 20,
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
  comingSoonContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 4,
    textAlign: 'center',
  },
});
