import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

const { width } = Dimensions.get('window');

export default function RoundContinuationScreen() {
  const { 
    offlineSettings,
    continueToNextRound,
    endGameAndVote,
    resetGameKeepPlayers,
    resetOfflineSettings,
    setCurrentPhase
  } = useGameStore();

  const [showEarlyEndDropdown, setShowEarlyEndDropdown] = useState(false);

  const currentRound = offlineSettings.currentRoundNumber;
  const nextRound = currentRound + 1;

  const handleNewGame = () => {
    // Vollständiges Zurücksetzen der Spiel-Einstellungen und Neustart in Setup
    resetOfflineSettings();
    setCurrentPhase('offlineSetup');
  };

  const handleNewGameWithSamePlayers = () => {
    // Behalte die Spielernamen, aber setze alles andere zurück
    resetGameKeepPlayers();
    setCurrentPhase('offlineGame');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Runde {currentRound} beendet!</Text>
        
        <Text style={styles.subtitle}>
          Möchtet ihr eine weitere Runde spielen?
        </Text>
        
        <Text style={styles.roundInfo}>
          Nächste Runde wäre: Runde {nextRound}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.continueButton]}
            onPress={continueToNextRound}
          >
            <Text style={styles.continueButtonText}>
              Ja, Runde {nextRound} spielen!
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={endGameAndVote}
          >
            <Text style={styles.endButtonText}>
              Nein, mit dem Voting beginnen
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • Bei &quot;Ja&quot;: Neue Runde mit neuen Wörtern und neuen Impostern
          </Text>
          <Text style={styles.infoText}>
            • Bei &quot;Nein&quot;: Direkt zur Abstimmung mit allen bisherigen Hinweisen
          </Text>
        </View>

        {/* Early End Dropdown */}
        <View style={styles.earlyEndContainer}>
          <TouchableOpacity 
            style={styles.earlyEndToggle}
            onPress={() => setShowEarlyEndDropdown(!showEarlyEndDropdown)}
          >
            <Text style={styles.earlyEndToggleText}>
              ⚠️ Spiel vorzeitig beenden?
            </Text>
            <Text style={styles.earlyEndArrow}>
              {showEarlyEndDropdown ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showEarlyEndDropdown && (
            <View style={styles.earlyEndDropdown}>
              <TouchableOpacity 
                style={styles.newGameButton}
                onPress={handleNewGameWithSamePlayers}
              >
                <Text style={styles.newGameButtonText}>
                  🔄 Neues Spiel mit gleichen Spielern
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backToSetupButton}
                onPress={handleNewGame}
              >
                <Text style={styles.backToSetupButtonText}>
                  🏠 Zurück zum Setup
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  roundInfo: {
    fontSize: 16,
    color: '#f5f5f5',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 25,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButton: {
    backgroundColor: '#0f3460',
    borderWidth: 2,
    borderColor: '#e94560',
  },
  endButton: {
    backgroundColor: '#e94560',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  endButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 15,
  },
  infoText: {
    color: '#f5f5f5',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.9,
  },
  earlyEndContainer: {
    marginTop: 25,
    width: '100%',
  },
  earlyEndToggle: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earlyEndToggleText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
  },
  earlyEndArrow: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  earlyEndDropdown: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#555',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 12,
  },
  newGameButton: {
    backgroundColor: '#e94560',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  newGameButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  backToSetupButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  backToSetupButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
