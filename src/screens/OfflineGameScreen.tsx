import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

const { width } = Dimensions.get('window');

export const OfflineGameScreen: React.FC = () => {
  const { 
    offlineSettings, 
    togglePlayerCardSeen,
    setCurrentPhase,
    generateNewWordPair,
    startGameRounds,
    getGameModeDisplayName
  } = useGameStore();

  const [showGameModeSettings, setShowGameModeSettings] = useState(false);

  const handleBack = () => {
    setCurrentPhase('offlineSetup');
  };

  // Hilfsfunktion: Karten in 2er-Gruppen aufteilen
  const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const renderPlayerCard = (role: any, index: number) => {
    const isFlipped = role.hasSeenCard;
    return (
      <TouchableOpacity
        key={role.playerName}
        style={styles.card}
        onPress={() => togglePlayerCardSeen(role.playerName)}
        activeOpacity={0.8}
      >
        <View style={[styles.cardInner, isFlipped && styles.cardFlipped]}>
          {!isFlipped ? (
            // Front of card - Player name
            <View style={styles.cardFront}>
              <Text style={styles.cardPlayerName}>{role.playerName}</Text>
              <Text style={styles.cardHint}>👆 Tippen zum Umdrehen</Text>
            </View>
          ) : (
            // Back of card - Role reveal
            <View style={styles.cardBack}>
              <Text style={styles.cardPlayerNameSmall}>{role.playerName}</Text>
              {role.isImposter ? (
                <View style={styles.imposterContent}>
                  <Text style={styles.imposterEmoji}></Text>
                  <Text style={styles.imposterText}>IMPOSTER</Text>
                  <Text style={styles.imposterSubtext}>Hinweis: {offlineSettings.currentWordPair?.imposterHint}</Text>
                </View>
              ) : (
                <View style={styles.wordContent}>
                  <Text style={styles.wordLabel}>Dein Wort:</Text>
                  <Text style={[
                    styles.wordText,
                    (offlineSettings.currentWordPair?.word?.length || 0) > 8 && styles.wordTextLong
                  ]}>{offlineSettings.currentWordPair?.word}</Text>
                </View>
              )}
              <Text style={styles.cardHintSmall}>👆 Zum Verstecken</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
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
            <Text style={styles.title}>🃏 Rollenkarten</Text>
            <Text style={styles.subtitle}>Jeder Spieler schaut sich heimlich seine Karte an</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>🎯</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Imposter Verteilung</Text>
              <Text style={styles.infoText}>
                {offlineSettings.imposterCount} von {offlineSettings.playerCount} Spielern sind Imposter
              </Text>
            </View>
          </View>

  {/* Karten in 2er-Reihen, responsive und mit gleichem Abstand */}
  <View style={styles.cardsContainer}>
    {chunkArray(offlineSettings.assignedRoles || [], 2).map((row, rowIdx) => (
      <View key={rowIdx} style={styles.cardRow}>
        {row.map((role, idx) => (
          <View
            key={role.playerName}
            style={[
              styles.cardWrapper,
              idx === 0 ? styles.cardWrapperLeft : styles.cardWrapperRight,
              row.length === 1 && styles.cardWrapperSingle
            ]}
          >
            {renderPlayerCard(role, rowIdx * 2 + idx)}
          </View>
        ))}
        {row.length < 2 && (
          <View style={[styles.cardWrapper, styles.cardWrapperRight]} />
        )}
      </View>
    ))}
  </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.newWordButton}
              onPress={() => {
                generateNewWordPair();
                console.log('Neues Wort generiert');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🎲</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.newWordButtonText}>Neues Wort</Text>
                <Text style={styles.buttonSubText}>Andere Begriffe generieren</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => {
                startGameRounds();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🎮</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.continueButtonText}>Spiel beginnen</Text>
                <Text style={styles.buttonSubText}>Alle haben ihre Rollen gesehen</Text>
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
                <Text style={styles.backButtonText}>Zurück zur Einrichtung</Text>
                <Text style={styles.buttonSubText}>Spieleinstellungen ändern</Text>
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
                        mode: 'wordInput_playerAdvance' as const,
                        title: 'Wörter eingeben, Spieler weiterklicken',
                        description: 'Standard Modus: Spieler geben Hinweise ein und klicken weiter'
                      },
                      {
                        mode: 'playerAdvance_only' as const,
                        title: 'Nur Spieler weiterklicken',
                        description: 'Spieler klicken nur weiter, ohne Hinweise einzugeben'
                      },
                      {
                        mode: 'open_mode' as const,
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
                          const { setGameMode } = useGameStore.getState();
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

                  {/* Back Button */}
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
                        <Text style={styles.modalButtonSubText}>Zu den Rollenkarten</Text>
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
    paddingBottom: 20,
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
  infoCard: {
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(233, 69, 96, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  infoText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  cardsContainer: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    width: '100%',
    maxWidth: width - 32,
    alignSelf: 'center',
  },
  cardWrapper: {
    flex: 1,
    minWidth: 0,
    maxWidth: '50%',
  },
  cardWrapperLeft: {
    marginRight: 4,
  },
  cardWrapperRight: {
    marginLeft: 4,
  },
  cardWrapperSingle: {
    marginLeft: 4,
    marginRight: 4,
  },
  card: {
    width: '100%',
    aspectRatio: 0.75,
    alignSelf: 'center',
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f3460',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardFlipped: {
    backgroundColor: '#0f3460',
    borderColor: '#1e4a73',
  },
  cardFront: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  cardPlayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardPlayerNameSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardHint: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  cardHintSmall: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
  },
  imposterContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  imposterEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  imposterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 4,
  },
  imposterSubtext: {
    fontSize: 14,
    color: '#e94560',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },
  wordContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  wordLabel: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 4,
  },
  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  wordTextLong: {
    fontSize: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 8,
  },
  newWordButton: {
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
  continueButton: {
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
    backgroundColor: '#16213e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#0f3460',
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
  newWordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  continueButtonText: {
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
});
