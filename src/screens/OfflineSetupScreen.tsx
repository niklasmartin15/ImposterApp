import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

export const OfflineSetupScreen: React.FC = () => {
  const { 
    offlineSettings, 
    setOfflinePlayerCount, 
    setOfflineImposterCount, 
    setOfflinePlayerName,
    setCurrentPhase,
    startOfflineGame
  } = useGameStore();

  // Berechne die maximale Anzahl der Imposter
  const getMaxImposters = () => {
    // Maximale Imposter: höchstens die Hälfte der Spieler
    const halfPlayers = Math.floor(offlineSettings.playerCount / 2);
    
    // Aber wenn Spieler/Imposter < 2 wäre, reduziere die maximale Anzahl
    let maxImposters = halfPlayers;
    while (maxImposters > 0 && offlineSettings.playerCount / maxImposters < 2) {
      maxImposters--;
    }
    
    // Mindestens 1 Imposter, höchstens playerCount - 1
    return Math.max(1, Math.min(maxImposters, offlineSettings.playerCount - 1));
  };

  const handlePlayerCountChange = (increment: boolean) => {
    const newCount = increment 
      ? Math.min(offlineSettings.playerCount + 1, 12) 
      : Math.max(offlineSettings.playerCount - 1, 3);
    setOfflinePlayerCount(newCount);
  };

  const handleImposterCountChange = (increment: boolean) => {
    const maxImposters = getMaxImposters();
    
    const newCount = increment 
      ? Math.min(offlineSettings.imposterCount + 1, maxImposters) 
      : Math.max(offlineSettings.imposterCount - 1, 1);
    setOfflineImposterCount(newCount);
  };

  // Zeige Fehler erst nach erstem Klick auf Start
  const [showNameErrors, setShowNameErrors] = useState(false);

  const handleStartGame = () => {
    setShowNameErrors(true);
    // Check if all player names are filled
    const emptyNames = offlineSettings.playerNames.filter(name => name.trim() === '');
    if (emptyNames.length > 0) {
      return;
    }

    // Check for duplicate names
    const names = offlineSettings.playerNames.map(name => name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      return;
    }

    // Start offline game
    startOfflineGame();
  };

  const handleBack = () => {
    setCurrentPhase('mainLobby');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🎮 Offline Spiel</Text>
            <Text style={styles.subtitle}>Einstellungen für das lokale Pass-and-Play</Text>
          </View>

          {/* Game Settings Container */}
          <View style={styles.gameSettingsContainer}>
            {/* Player Count Setting */}
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={styles.settingIconContainer}>
                  <Text style={styles.settingIcon}>👥</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Anzahl Spieler</Text>
                  <Text style={styles.settingDescription}>3-12 Spieler</Text>
                </View>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[styles.counterButton, offlineSettings.playerCount <= 3 && styles.counterButtonDisabled]}
                  onPress={() => handlePlayerCountChange(false)}
                  disabled={offlineSettings.playerCount <= 3}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.counterButtonText, offlineSettings.playerCount <= 3 && styles.counterButtonTextDisabled]}>−</Text>
                </TouchableOpacity>
                
                <View style={styles.counterValue}>
                  <Text style={styles.counterValueText}>{offlineSettings.playerCount}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.counterButton, offlineSettings.playerCount >= 12 && styles.counterButtonDisabled]}
                  onPress={() => handlePlayerCountChange(true)}
                  disabled={offlineSettings.playerCount >= 12}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.counterButtonText, offlineSettings.playerCount >= 12 && styles.counterButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Imposter Count Setting */}
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={styles.settingIconContainer}>
                  <Text style={styles.settingIcon}>🕵️</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Anzahl Imposter</Text>
                  <Text style={styles.settingDescription}>1-{getMaxImposters()} Imposter</Text>
                </View>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[styles.counterButton, offlineSettings.imposterCount <= 1 && styles.counterButtonDisabled]}
                  onPress={() => handleImposterCountChange(false)}
                  disabled={offlineSettings.imposterCount <= 1}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.counterButtonText, offlineSettings.imposterCount <= 1 && styles.counterButtonTextDisabled]}>−</Text>
                </TouchableOpacity>
                
                <View style={styles.counterValue}>
                  <Text style={styles.counterValueText}>{offlineSettings.imposterCount}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.counterButton, offlineSettings.imposterCount >= getMaxImposters() && styles.counterButtonDisabled]}
                  onPress={() => handleImposterCountChange(true)}
                  disabled={offlineSettings.imposterCount >= getMaxImposters()}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.counterButtonText, offlineSettings.imposterCount >= getMaxImposters() && styles.counterButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Player Names */}
          <View style={styles.playersContainer}>
            <View style={styles.playersHeader}>
              <View style={styles.settingIconContainer}>
                <Text style={styles.settingIcon}>📝</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Spielernamen</Text>
                <Text style={styles.settingDescription}>Gib die Namen aller Spieler ein</Text>
              </View>
            </View>
            
            <View style={styles.playersInputSection}>
              {offlineSettings.playerNames.map((name, index) => {
                // Fehler-Logik: leer oder doppelt
                const trimmed = name.trim();
                const isEmpty = trimmed === '';
                const lowerNames = offlineSettings.playerNames.map(n => n.trim().toLowerCase());
                const isDuplicate = lowerNames.filter(n => n === trimmed.toLowerCase()).length > 1 && !isEmpty;
                let errorMsg = '';
                let errorType: 'none' | 'empty' | 'duplicate' = 'none';
                if (isEmpty) {
                  errorMsg = 'Gebe einen Namen ein';
                  errorType = 'empty';
                } else if (isDuplicate) {
                  errorMsg = 'Name bereits vorhanden';
                  errorType = 'duplicate';
                }

                return (
                  <View key={index} style={styles.playerInputContainer}>
                    <View style={styles.playerNumberBadge}>
                      <Text style={styles.playerNumber}>#{index + 1}</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      {showNameErrors && errorMsg !== '' && (
                        <Text style={[
                          styles.inputErrorText,
                          errorType === 'empty' && styles.inputErrorTextYellow,
                          errorType === 'duplicate' && styles.inputErrorTextRed,
                        ]}>{errorMsg}</Text>
                      )}
                      <TextInput
                        style={[
                          styles.playerInput,
                          showNameErrors && errorType === 'empty' && styles.playerInputErrorYellow,
                          showNameErrors && errorType === 'duplicate' && styles.playerInputErrorRed,
                        ]}
                        placeholder={`Spieler ${index + 1}`}
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={(text) => setOfflinePlayerName(index, text)}
                        maxLength={12}
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={handleStartGame}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🕵️</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.startButtonText}>Spiel starten</Text>
                <Text style={styles.buttonSubText}>Karten verteilen und beginnen</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>←</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.backButtonText}>Zurück</Text>
                <Text style={styles.buttonSubText}>Zum Hauptmenü</Text>
              </View>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
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

  // Game Settings Container
  gameSettingsContainer: {
    marginBottom: 12,
    gap: 8,
  },

  // Setting Card Styles
  settingCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(233, 69, 96, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  settingDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },

  // Counter Styles
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    backgroundColor: '#e94560',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#ff6b8a',
  },
  counterButtonDisabled: {
    backgroundColor: '#555',
    borderColor: '#666',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  counterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  counterButtonTextDisabled: {
    color: '#888',
  },
  counterValue: {
    backgroundColor: '#0f3460',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 12,
    borderRadius: 10,
    minWidth: 44,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e4a73',
  },
  counterValueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Players Container
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
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playersInputSection: {
    gap: 6,
  },

  // Player Input Styles
  playerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  playerNumber: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  inputWrapper: {
    flex: 1,
  },
  playerInput: {
    backgroundColor: '#0f3460',
    borderWidth: 2,
    borderColor: '#1e4a73',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },

  // Error Styles
  inputErrorText: {
    fontSize: 10,
    marginBottom: 3,
    marginLeft: 3,
    fontWeight: 'bold',
  },
  inputErrorTextYellow: {
    color: '#ffd600',
  },
  inputErrorTextRed: {
    color: '#e94560',
  },
  playerInputErrorYellow: {
    borderColor: '#ffd600',
    borderWidth: 2,
  },
  playerInputErrorRed: {
    borderColor: '#e94560',
    borderWidth: 2,
  },

  // Button Container
  buttonContainer: {
    gap: 8,
  },

  // Button Styles
  startButton: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
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
  backButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#1e4a73',
  },

  // Button Content Styles
  buttonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  buttonSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
});
