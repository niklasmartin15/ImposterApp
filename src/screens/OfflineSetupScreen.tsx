import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useGameStore } from '../stores/gameStore';
import { GameMode, WordDifficulty } from '../types/game';

export const OfflineSetupScreen: React.FC = () => {
  const { 
    offlineSettings, 
    setOfflinePlayerCount, 
    setOfflineImposterCount, 
    setOfflinePlayerName,
    setCurrentPhase,
    startOfflineGame,
    getGameModeDisplayName,
    setGameMode,
    setWordDifficulty,
    getWordDifficultyDisplayName
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

  const handleWordDifficultyChange = (increment: boolean) => {
    const difficulties: WordDifficulty[] = ['easy', 'medium', 'hard', 'random'];
    const currentIndex = difficulties.indexOf(offlineSettings.wordDifficulty);
    
    if (increment && currentIndex < difficulties.length - 1) {
      setWordDifficulty(difficulties[currentIndex + 1]);
    } else if (!increment && currentIndex > 0) {
      setWordDifficulty(difficulties[currentIndex - 1]);
    }
  };

  // Hilfsfunktion für die Hintergrundfarbe basierend auf Schwierigkeit
  const getDifficultyBackgroundColor = () => {
    switch (offlineSettings.wordDifficulty) {
      case 'easy':
        return '#1a2e25'; // Sehr blasses Grün
      case 'medium':
        return '#2e2a1a'; // Sehr blasses Gelb
      case 'hard':
        return '#2e1a1a'; // Sehr blasses Rot
      case 'random':
        return '#2a2a2a'; // Sehr blasses Grau/Weiß
      default:
        return '#16213e'; // Standard-Blau
    }
  };

  // Hilfsfunktion für die Counter-Value Farbe basierend auf Schwierigkeit
  const getDifficultyCounterColor = () => {
    switch (offlineSettings.wordDifficulty) {
      case 'easy':
        return '#2d5a41'; // Kräftiges Grün
      case 'medium':
        return '#5a5a2d'; // Kräftiges Gelb
      case 'hard':
        return '#5a2d2d'; // Kräftiges Rot
      case 'random':
        return '#4a4a4a'; // Kräftiges Grau/Weiß
      default:
        return '#0f3460'; // Standard-Blau
    }
  };

  // Hilfsfunktion für die Beschreibung basierend auf Schwierigkeit
  const getDifficultyDescription = () => {
    switch (offlineSettings.wordDifficulty) {
      case 'easy':
        return 'Kurze, simple Wörter aus dem Alltag';
      case 'medium':
        return 'Die perfekte Mitte zwischen leicht und schwer';
      case 'hard':
        return 'Fachbegriffe und komplexe, lange Wörter';
      case 'random':
        return 'Wörter aus allen Schwierigkeitsgraden';
      default:
        return 'Wähle den Schwierigkeitsgrad der Wörter';
    }
  };

  // Zeige Fehler erst nach erstem Klick auf Start
  const [showNameErrors, setShowNameErrors] = useState(false);
  const [showGameModeSettings, setShowGameModeSettings] = useState(false);

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

          {/* Player Names with Count Control */}
          <View style={styles.playersContainer}>
            <View style={styles.playersHeader}>
              <View style={styles.settingIconContainer}>
                <Text style={styles.settingIcon}>📝</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Spielernamen</Text>
                <Text style={styles.settingDescription}>Gib die Namen aller Spieler ein</Text>
              </View>
              
              {/* Player Count Control */}
              <View style={styles.playerCountControl}>
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

          {/* Game Settings Container */}
          <View style={styles.gameSettingsContainer}>
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

            {/* Word Difficulty Setting */}
            <View style={[styles.settingCard, { backgroundColor: getDifficultyBackgroundColor() }]}>
              <View style={styles.settingHeader}>
                <View style={styles.settingIconContainer}>
                  <Text style={styles.settingIcon}>🎯</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Wort-Schwierigkeit</Text>
                  <Text style={styles.settingDescription}>Wähle den Schwierigkeitsgrad der Wörter</Text>
                </View>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[styles.counterButton, offlineSettings.wordDifficulty === 'easy' && styles.counterButtonDisabled]}
                  onPress={() => handleWordDifficultyChange(false)}
                  disabled={offlineSettings.wordDifficulty === 'easy'}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.counterButtonText, offlineSettings.wordDifficulty === 'easy' && styles.counterButtonTextDisabled]}>−</Text>
                </TouchableOpacity>
                
                <View style={[styles.counterValue, { backgroundColor: getDifficultyCounterColor() }]}>
                  <Text style={styles.counterValueText}>
                    {offlineSettings.wordDifficulty === 'random' ? 'Zufällig' : getWordDifficultyDisplayName(offlineSettings.wordDifficulty)}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.counterButton, offlineSettings.wordDifficulty === 'random' && styles.counterButtonDisabled]}
                  onPress={() => handleWordDifficultyChange(true)}
                  disabled={offlineSettings.wordDifficulty === 'random'}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.counterButtonText, offlineSettings.wordDifficulty === 'random' && styles.counterButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
              
              {/* Difficulty Description */}
              <View style={styles.difficultyDescriptionContainer}>
                <Text style={styles.difficultyDescriptionText}>
                  {getDifficultyDescription()}
                </Text>
              </View>
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
                <Text style={styles.buttonIcon}>🎮</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.startButtonText}>Spiel starten</Text>
                <Text style={styles.buttonSubText}>Karten verteilen und beginnen</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setShowGameModeSettings(true)}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>⚙️</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.settingsButtonText}>
                  Spieleinstellungen (aktuell: {getGameModeDisplayName(offlineSettings.gameMode)})
                </Text>
                <Text style={styles.buttonSubText}>Spielmodus ändern</Text>
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

      {/* Game Mode Settings Modal */}
      <Modal
        visible={showGameModeSettings}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalSafeArea}>
              <ScrollView 
                style={styles.modalScrollView} 
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeaderContainer}>
                    <Text style={styles.modalTitle}>⚙️ Spieleinstellungen</Text>
                    <Text style={styles.modalSubtitle}>Wähle deinen bevorzugten Spielmodus</Text>
                  </View>

                  {/* Spielmodi */}
                  <View style={styles.modalModesContainer}>
                    {[
                      {
                        mode: 'wordInput_playerAdvance' as GameMode,
                        title: 'Wörter eingeben, Spieler weiterklicken',
                        description: 'Standard Modus: Spieler geben Hinweise ein und klicken weiter'
                      },
                      {
                        mode: 'playerAdvance_only' as GameMode,
                        title: 'Nur Spieler weiterklicken',
                        description: 'Spieler klicken nur weiter, ohne Hinweise einzugeben'
                      },
                      {
                        mode: 'open_mode' as GameMode,
                        title: 'Offener Modus',
                        description: 'Freier Spielmodus ohne Einschränkungen'
                      }
                    ].map((gameMode) => (
                      <TouchableOpacity
                        key={gameMode.mode}
                        style={[
                          styles.modalModeCard,
                          offlineSettings.gameMode === gameMode.mode && styles.modalSelectedModeCard
                        ]}
                        onPress={() => {
                          setGameMode(gameMode.mode);
                          setShowGameModeSettings(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.modalModeHeader}>
                          <View style={[
                            styles.modalRadioButton,
                            offlineSettings.gameMode === gameMode.mode && styles.modalRadioButtonSelected
                          ]}>
                            {offlineSettings.gameMode === gameMode.mode && (
                              <View style={styles.modalRadioButtonInner} />
                            )}
                          </View>
                          <View style={styles.modalModeTextContainer}>
                            <Text style={[
                              styles.modalModeTitle,
                              offlineSettings.gameMode === gameMode.mode && styles.modalSelectedModeTitle
                            ]}>
                              {gameMode.title}
                            </Text>
                            <Text style={[
                              styles.modalModeDescription,
                              offlineSettings.gameMode === gameMode.mode && styles.modalSelectedModeDescription
                            ]}>
                              {gameMode.description}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Buttons */}
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity 
                      style={styles.modalBackButton}
                      onPress={() => setShowGameModeSettings(false)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.modalButtonIconContainer}>
                        <Text style={styles.modalButtonIcon}>←</Text>
                      </View>
                      <View style={styles.modalButtonTextContainer}>
                        <Text style={styles.modalBackButtonText}>Zurück</Text>
                        <Text style={styles.modalButtonSubText}>Zu den Spieleinstellungen</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
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
    paddingTop: 20,
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
  playerCountControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
  settingsButton: {
    backgroundColor: '#16213e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#16213e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
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
  settingsButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
    flexWrap: 'wrap',
  },
  buttonSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalHeaderContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(233, 69, 96, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalModesContainer: {
    marginBottom: 16,
    gap: 8,
  },
  modalModeCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  modalSelectedModeCard: {
    backgroundColor: '#1e4a73',
    borderColor: '#e94560',
    elevation: 8,
    shadowColor: '#e94560',
    shadowOpacity: 0.3,
  },
  modalModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalRadioButtonSelected: {
    borderColor: '#e94560',
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
  },
  modalRadioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94560',
  },
  modalModeTextContainer: {
    flex: 1,
  },
  modalModeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  modalSelectedModeTitle: {
    color: '#e94560',
  },
  modalModeDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  modalSelectedModeDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalButtonContainer: {
    marginTop: 8,
  },
  modalBackButton: {
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
  modalButtonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalButtonIcon: {
    fontSize: 16,
    color: '#fff',
  },
  modalButtonTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  modalBackButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  modalButtonSubText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },

  // Difficulty Description Styles
  difficultyDescriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  difficultyDescriptionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 14,
    fontStyle: 'italic',
  },
});
