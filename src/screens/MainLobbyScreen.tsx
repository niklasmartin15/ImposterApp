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

export const MainLobbyScreen: React.FC = () => {
  const [showGameInfo, setShowGameInfo] = useState(false);

  const handleOfflineGame = () => {
    // Navigate to offline setup screen
    const { setCurrentPhase } = useGameStore.getState();
    setCurrentPhase('offlineSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        <View style={styles.gameInfoContainer}>
          <Text style={styles.gameTitle}>🕵️ Imposter</Text>
          <Text style={styles.gameDescription}>
            Version 1.0.0
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.offlineButton}
            onPress={handleOfflineGame}
          >
            <Text style={styles.offlineButtonText}>🎮 Offline spielen</Text>
            <Text style={styles.buttonSubText}>Pass-and-Play auf diesem Gerät</Text>
          </TouchableOpacity>

          <View style={styles.onlineButtonContainer}>
            <TouchableOpacity 
              style={[styles.onlineButton, styles.onlineButtonDisabled]}
              disabled={true}
            >
              <Text style={[styles.onlineButtonText, styles.onlineButtonTextDisabled]}>🌐 Online spielen</Text>
              <Text style={[styles.buttonSubText, styles.buttonSubTextDisabled]}>Coming soon...</Text>
            </TouchableOpacity>
          </View>

          {/* Game Info Dropdown */}
          <View style={styles.gameInfoButtonContainer}>
            <TouchableOpacity 
              style={[styles.gameInfoButton, showGameInfo && styles.gameInfoButtonActive]}
              onPress={() => setShowGameInfo(!showGameInfo)}
            >
              <Text style={styles.gameInfoButtonText}> 📜Spielregeln</Text>
              <Text style={styles.dropdownArrow}>
                {showGameInfo ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showGameInfo && (
              <View style={styles.gameInfoDropdown}>
                <View style={styles.gameInfoSection}>
                  <Text style={styles.gameInfoTitle}>🎯 Spielziel</Text>
                  <Text style={styles.gameInfoText}>
                    Die Imposter müssen unentdeckt bleiben, während die anderen Spieler versuchen, sie zu identifizieren!
                  </Text>
                </View>

                <View style={styles.gameInfoDivider} />

                <View style={styles.gameInfoSection}>
                  <Text style={styles.gameInfoTitle}>🎮 Spielablauf</Text>
                  <Text style={styles.gameInfoText}>
                    1. Jeder Spieler erhält heimlich eine Rolle{'\n'}
                    2. Alle außer den Impostern bekommen dasselbe Wort{'\n'}
                    3. Imposter erhalten nur einen Hinweis{'\n'}
                    4. Reihum gibt jeder einen Hinweis zu seinem &quot;Wort&quot;{'\n'}
                    5. Nach den Hinweisen wird abgestimmt{'\n'}
                    6. Imposter können versuchen, das Wort zu erraten
                  </Text>
                </View>

                <View style={styles.gameInfoDivider} />

                <View style={styles.gameInfoSection}>
                  <Text style={styles.gameInfoTitle}>🏆 Sieg-Bedingungen</Text>
                  <Text style={styles.gameInfoText}>
                    <Text style={styles.gameInfoHighlight}>Imposter gewinnen wenn:</Text>{'\n'}
                    • Sie nicht identifiziert werden{'\n'}
                    • Sie das Lösungswort erraten{'\n\n'}
                    <Text style={styles.gameInfoHighlight}>Andere Spieler gewinnen wenn:</Text>{'\n'}
                    • Sie alle Imposter identifizieren{'\n'}
                    • Imposter das Wort falsch raten
                  </Text>
                </View>

                <View style={styles.gameInfoDivider} />

                <View style={styles.gameInfoSection}>
                  <Text style={styles.gameInfoTitle}>⚡ App-Features</Text>
                  <Text style={styles.gameInfoText}>
                    • 3-12 Spieler auf einem Gerät{'\n'}
                    • Bis zu 5 Runden pro Spiel{'\n'}
                    • Automatische Rollenvergabe{'\n'}
                    • Integrierte Abstimmung{'\n'}
                    • Letzte-Chance Wortraten{'\n'}
                    • Über 100 Wortpaare{'\n'}
                    • Schneller Neustart
                  </Text>
                </View>
              </View>
            )}
          </View>
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
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 20,
    justifyContent: 'center',
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
  offlineButton: {
    backgroundColor: '#e94560',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  offlineButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  buttonSubTextDisabled: {
    color: '#666',
    opacity: 1,
  },
  onlineButtonContainer: {
    marginBottom: 16,
  },
  onlineButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  onlineButtonDisabled: {
    backgroundColor: '#2a2a3e',
    opacity: 0.6,
  },
  onlineButtonActive: {
    backgroundColor: '#16213e',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  onlineButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  onlineButtonTextDisabled: {
    color: '#999',
  },
  dropdownArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -8,
    fontSize: 16,
    color: '#fff',
  },
  dropdown: {
    backgroundColor: '#16213e',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  dropdownSubText: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#0f3460',
    marginHorizontal: 24,
    marginVertical: 4,
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
  // Game Info Dropdown Styles
  gameInfoButtonContainer: {
    marginBottom: 16,
  },
  gameInfoButton: {
    backgroundColor: '#12305eff',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  gameInfoButtonActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  gameInfoButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gameInfoDropdown: {
    backgroundColor: '#16213e',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gameInfoSection: {
    paddingVertical: 12,
  },
  gameInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
  },
  gameInfoText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  gameInfoHighlight: {
    color: '#fff',
    fontWeight: 'bold',
  },
  gameInfoDivider: {
    height: 1,
    backgroundColor: '#0f3460',
    marginVertical: 8,
  },
});
