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
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🎊 Runde {currentRound} beendet!</Text>
            <Text style={styles.subtitle}>Möchtet ihr eine weitere Runde spielen?</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>🎯</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Nächste Runde</Text>
              <Text style={styles.infoText}>Runde {nextRound} warten auf euch</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={continueToNextRound}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🎮</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.continueButtonText}>Ja, Runde {nextRound} spielen!</Text>
                <Text style={styles.buttonSubText}>Jeder muss Spieler ein weiteres Wort sagen</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endButton}
              onPress={endGameAndVote}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🗳️</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.endButtonText}>Nein, mit dem Voting beginnen</Text>
                <Text style={styles.buttonSubText}>Zur Abstimmung wechseln</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Text style={styles.tipIcon}>💡</Text>
            </View>
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Spieltipps</Text>
              <Text style={styles.tipText}>
                • Bei &quot;Ja&quot;: Startet eine weitere Runde, in der jeder Spieler ein weiteres Wort sagen muss{'\n'}
                • Bei &quot;Nein&quot;: Direkt zur Abstimmung mit allen bisherigen Hinweisen
              </Text>
            </View>
          </View>

          <View style={styles.earlyEndContainer}>
            <TouchableOpacity 
              style={styles.earlyEndToggle}
              onPress={() => setShowEarlyEndDropdown(!showEarlyEndDropdown)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownIconContainer}>
                <Text style={styles.dropdownIcon}>⚠️</Text>
              </View>
              <View style={styles.dropdownTextContainer}>
                <Text style={styles.earlyEndToggleText}>Spiel vorzeitig beenden?</Text>
                <Text style={styles.dropdownSubText}>Weitere Optionen anzeigen</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.earlyEndArrow}>
                  {showEarlyEndDropdown ? '▲' : '▼'}
                </Text>
              </View>
            </TouchableOpacity>

            {showEarlyEndDropdown && (
              <View style={styles.earlyEndDropdown}>
                <TouchableOpacity 
                  style={styles.newGameButton}
                  onPress={handleNewGameWithSamePlayers}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonIconContainer}>
                    <Text style={styles.buttonIcon}>🔄</Text>
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.newGameButtonText}>Neues Spiel mit gleichen Spielern</Text>
                    <Text style={styles.buttonSubText}>Zurück zur Rollenkarten-Verteilung</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.backToSetupButton}
                  onPress={handleNewGame}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonIconContainer}>
                    <Text style={styles.buttonIcon}>🏠</Text>
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.backToSetupButtonText}>Zurück zum Setup</Text>
                    <Text style={styles.buttonSubText}>Spieleinstellungen ändern</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    marginBottom: 24,
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
  buttonContainer: {
    gap: 8,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 12,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    borderWidth: 3,
    borderColor: '#ff6b8a',
    transform: [{ scale: 1.02 }],
  },
  endButton: {
    backgroundColor: '#4682B4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 10,
    shadowColor: '#4682B4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 3,
    borderColor: '#5A9BD4',
    transform: [{ scale: 1.02 }],
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  endButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  buttonSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'left',
    fontWeight: '500',
  },
  tipCard: {
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
    alignItems: 'flex-start',
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipIcon: {
    fontSize: 18,
  },
  tipTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    lineHeight: 16,
  },
  earlyEndContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
    overflow: 'hidden',
  },
  earlyEndToggle: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dropdownIcon: {
    fontSize: 18,
  },
  dropdownTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  earlyEndToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  dropdownSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earlyEndArrow: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: 'bold',
  },
  earlyEndDropdown: {
    backgroundColor: '#0f3460',
    padding: 12,
    gap: 8,
  },
  newGameButton: {
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
  newGameButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  backToSetupButton: {
    backgroundColor: '#202040',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#333355',
  },
  backToSetupButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#bbb',
    marginBottom: 1,
  },
});
