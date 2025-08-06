import React from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';
import { GameMode } from '../types/game';

export const GameModeSettingsScreen: React.FC = () => {
  const { 
    offlineSettings,
    setGameMode,
    setCurrentPhase
  } = useGameStore();

  const gameModes: {mode: GameMode, title: string, description: string}[] = [
    {
      mode: 'wordInput_playerAdvance',
      title: 'Wörter eingeben, Spieler weiterklicken',
      description: 'Standard Modus: Spieler geben Hinweise ein und klicken weiter'
    },
    {
      mode: 'playerAdvance_only',
      title: 'Nur Spieler weiterklicken',
      description: 'Spieler klicken nur weiter, ohne Hinweise einzugeben'
    },
    {
      mode: 'open_mode',
      title: 'Offener Modus',
      description: 'Freier Spielmodus ohne Einschränkungen'
    }
  ];

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    // Prüfe, ob bereits Rollen zugewiesen wurden (dann vom OfflineGameScreen)
    const hasAssignedRoles = offlineSettings.assignedRoles && offlineSettings.assignedRoles.length > 0;
    setCurrentPhase(hasAssignedRoles ? 'offlineGame' : 'offlineSetup');
  };

  const handleBack = () => {
    // Prüfe, ob bereits Rollen zugewiesen wurden (dann vom OfflineGameScreen)
    const hasAssignedRoles = offlineSettings.assignedRoles && offlineSettings.assignedRoles.length > 0;
    setCurrentPhase(hasAssignedRoles ? 'offlineGame' : 'offlineSetup');
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>⚙️ Spieleinstellungen</Text>
                  <Text style={styles.subtitle}>Wähle deinen bevorzugten Spielmodus</Text>
                </View>

                {/* Spielmodi */}
                <View style={styles.modesContainer}>
                  {gameModes.map((gameMode) => (
                    <TouchableOpacity
                      key={gameMode.mode}
                      style={[
                        styles.modeCard,
                        offlineSettings.gameMode === gameMode.mode && styles.selectedModeCard
                      ]}
                      onPress={() => handleModeSelect(gameMode.mode)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.modeHeader}>
                        <View style={[
                          styles.radioButton,
                          offlineSettings.gameMode === gameMode.mode && styles.radioButtonSelected
                        ]}>
                          {offlineSettings.gameMode === gameMode.mode && (
                            <View style={styles.radioButtonInner} />
                          )}
                        </View>
                        <View style={styles.modeTextContainer}>
                          <Text style={[
                            styles.modeTitle,
                            offlineSettings.gameMode === gameMode.mode && styles.selectedModeTitle
                          ]}>
                            {gameMode.title}
                          </Text>
                          <Text style={[
                            styles.modeDescription,
                            offlineSettings.gameMode === gameMode.mode && styles.selectedModeDescription
                          ]}>
                            {gameMode.description}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
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
                      <Text style={styles.buttonSubText}>Zu den Spieleinstellungen</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(233, 69, 96, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Spielmodi Container
  modesContainer: {
    marginBottom: 16,
    gap: 8,
  },

  // Modus Card Styles
  modeCard: {
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
  selectedModeCard: {
    backgroundColor: '#1e4a73',
    borderColor: '#e94560',
    elevation: 8,
    shadowColor: '#e94560',
    shadowOpacity: 0.3,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
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
  radioButtonSelected: {
    borderColor: '#e94560',
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94560',
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  selectedModeTitle: {
    color: '#e94560',
  },
  modeDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  selectedModeDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Button Container
  buttonContainer: {
    marginTop: 8,
  },

  // Button Styles
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  buttonIcon: {
    fontSize: 16,
    color: '#fff',
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  buttonSubText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
});
