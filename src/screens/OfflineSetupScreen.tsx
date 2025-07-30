import React from 'react';
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

  const handlePlayerCountChange = (increment: boolean) => {
    const newCount = increment 
      ? Math.min(offlineSettings.playerCount + 1, 12) 
      : Math.max(offlineSettings.playerCount - 1, 3);
    setOfflinePlayerCount(newCount);
  };

  const handleImposterCountChange = (increment: boolean) => {
    const maxImposters = Math.max(1, offlineSettings.playerCount - 1);
    const newCount = increment 
      ? Math.min(offlineSettings.imposterCount + 1, maxImposters) 
      : Math.max(offlineSettings.imposterCount - 1, 1);
    setOfflineImposterCount(newCount);
  };

  const handleStartGame = () => {
    // Check if all player names are filled
    const emptyNames = offlineSettings.playerNames.filter(name => name.trim() === '');
    if (emptyNames.length > 0) {
      Alert.alert(
        'Namen fehlen', 
        'Bitte gib für alle Spieler einen Namen ein.'
      );
      return;
    }

    // Check for duplicate names
    const names = offlineSettings.playerNames.map(name => name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      Alert.alert(
        'Doppelte Namen', 
        'Jeder Spieler muss einen einzigartigen Namen haben.'
      );
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🎮 Offline Spiel</Text>
            <Text style={styles.subtitle}>Einstellungen für das lokale Pass-and-Play</Text>
          </View>

          {/* Player Count Setting */}
          <View style={styles.settingContainer}>
            <Text style={styles.settingLabel}>Anzahl Spieler</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity 
                style={[styles.counterButton, offlineSettings.playerCount <= 3 && styles.counterButtonDisabled]}
                onPress={() => handlePlayerCountChange(false)}
                disabled={offlineSettings.playerCount <= 3}
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
              >
                <Text style={[styles.counterButtonText, offlineSettings.playerCount >= 12 && styles.counterButtonTextDisabled]}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.settingHint}>3-12 Spieler</Text>
          </View>

          {/* Imposter Count Setting */}
          <View style={styles.settingContainer}>
            <Text style={styles.settingLabel}>Anzahl Imposter</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity 
                style={[styles.counterButton, offlineSettings.imposterCount <= 1 && styles.counterButtonDisabled]}
                onPress={() => handleImposterCountChange(false)}
                disabled={offlineSettings.imposterCount <= 1}
              >
                <Text style={[styles.counterButtonText, offlineSettings.imposterCount <= 1 && styles.counterButtonTextDisabled]}>−</Text>
              </TouchableOpacity>
              
              <View style={styles.counterValue}>
                <Text style={styles.counterValueText}>{offlineSettings.imposterCount}</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.counterButton, offlineSettings.imposterCount >= Math.max(1, offlineSettings.playerCount - 1) && styles.counterButtonDisabled]}
                onPress={() => handleImposterCountChange(true)}
                disabled={offlineSettings.imposterCount >= Math.max(1, offlineSettings.playerCount - 1)}
              >
                <Text style={[styles.counterButtonText, offlineSettings.imposterCount >= Math.max(1, offlineSettings.playerCount - 1) && styles.counterButtonTextDisabled]}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.settingHint}>1-{Math.max(1, offlineSettings.playerCount - 1)} Imposter</Text>
          </View>

          {/* Player Names */}
          <View style={styles.playersContainer}>
            <Text style={styles.playersTitle}>Spielernamen</Text>
            
            {offlineSettings.playerNames.map((name, index) => (
              <View key={index} style={styles.playerInputContainer}>
                <Text style={styles.playerNumber}>#{index + 1}</Text>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Spieler ${index + 1}`}
                  placeholderTextColor="#666"
                  value={name}
                  onChangeText={(text) => setOfflinePlayerName(index, text)}
                  maxLength={20}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={handleStartGame}
            >
              <Text style={styles.startButtonText}>🕵️ Spiel starten</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>← Zurück</Text>
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
  settingContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  settingLabel: {
    fontSize: 18,
    color: '#eee',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  counterButton: {
    backgroundColor: '#e94560',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  counterButtonDisabled: {
    backgroundColor: '#555',
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  counterButtonTextDisabled: {
    color: '#888',
  },
  counterValue: {
    backgroundColor: '#0f3460',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  counterValueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee',
  },
  settingHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  playersContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  playersTitle: {
    fontSize: 18,
    color: '#eee',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  playerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerNumber: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  playerInput: {
    flex: 1,
    backgroundColor: '#0f3460',
    borderWidth: 1,
    borderColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#eee',
    marginLeft: 12,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
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
    fontSize: 18,
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
});
