import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

export const MainLobbyScreen: React.FC = () => {
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [showOnlineDropdown, setShowOnlineDropdown] = useState(false);

  const handleOfflineGame = () => {
    // Navigate to offline setup screen
    const { setCurrentPhase } = useGameStore.getState();
    setCurrentPhase('offlineSetup');
  };

  const handleOnlineGame = () => {
    // Toggle online dropdown
    setShowOnlineDropdown(!showOnlineDropdown);
  };

  const handleJoinLobby = () => {
    // Navigate to online name input for joining
    const { setCurrentPhase } = useGameStore.getState();
    setCurrentPhase('onlineNameInputJoin');
    setShowOnlineDropdown(false);
  };

  const handleCreateLobby = () => {
    // Navigate to online name input for creating
    const { setCurrentPhase } = useGameStore.getState();
    setCurrentPhase('onlineNameInputCreate');
    setShowOnlineDropdown(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconContainer}>
              <Text style={styles.buttonIcon}>🎮</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.offlineButtonText}>Offline spielen</Text>
              <Text style={styles.buttonSubText}>Pass-and-Play auf diesem Gerät</Text>
            </View>
          </TouchableOpacity>

          {/* Online Button with Dropdown */}
          <View style={styles.onlineButtonContainer}>
            <TouchableOpacity 
              style={[styles.onlineButton, showOnlineDropdown && styles.onlineButtonActive]}
              onPress={handleOnlineGame}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🌐</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.onlineButtonText}>Online spielen</Text>
                <Text style={styles.buttonSubText}>Mit Freunden über das Internet</Text>
              </View>
              <Text style={styles.dropdownArrow}>
                {showOnlineDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showOnlineDropdown && (
              <View style={styles.dropdown}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={handleJoinLobby}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownButtonText}>🔍 Join a Lobby</Text>
                  <Text style={styles.dropdownSubText}>Offene Lobbies anzeigen</Text>
                </TouchableOpacity>
                
                <View style={styles.dropdownSeparator} />
                
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={handleCreateLobby}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownButtonText}>➕ Create a Lobby</Text>
                  <Text style={styles.dropdownSubText}>Neue Lobby erstellen</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Game Info Dropdown */}
          <View style={styles.gameInfoButtonContainer}>
            <TouchableOpacity 
              style={[styles.gameInfoButton, showGameInfo && styles.gameInfoButtonActive]}
              onPress={() => setShowGameInfo(!showGameInfo)}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>📜</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.gameInfoButtonText}>Spielregeln</Text>
                <Text style={styles.buttonSubText}>Wie wird Imposter gespielt?</Text>
              </View>
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
                    • Über 800 Wortpaare{'\n'}
                    • Schneller Neustart{'\n'}
                    • 3 verschiedene Spielmodi{'\n'}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  gameInfoContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(233, 69, 96, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gameDescription: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 40,
    gap: 16,
  },
  
  // Button Styles
  offlineButton: {
    backgroundColor: '#e94560',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
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
  onlineButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 8,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#1e4a73',
    position: 'relative',
  },
  onlineButtonActive: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#1e4a73',
  },
  onlineButtonContainer: {
    marginBottom: 16,
  },
  onlineButtonDisabled: {
    backgroundColor: '#2a2a3e',
    opacity: 0.6,
  },
  gameInfoButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#1e4a73',
    position: 'relative',
  },
  gameInfoButtonActive: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#1e4a73',
  },
  
  // Button Content Styles
  buttonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonIconDisabled: {
    opacity: 0.5,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  offlineButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  onlineButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  onlineButtonTextDisabled: {
    color: '#999',
  },
  gameInfoButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  buttonSubTextDisabled: {
    color: '#666',
    opacity: 1,
  },
  
  // Dropdown Arrow
  dropdownArrow: {
    position: 'absolute',
    right: 20,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
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
