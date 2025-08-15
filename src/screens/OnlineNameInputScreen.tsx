import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import OnlineService from '../services/OnlineService';
import { useGameStore } from '../stores/gameStore';

interface OnlineNameInputScreenProps {
  mode: 'join' | 'create';
}

export const OnlineNameInputScreen: React.FC<OnlineNameInputScreenProps> = ({ mode }) => {
  const [playerName, setPlayerName] = useState('');
  const { setPlayerName: setStoreName, setCurrentPhase, generatePlayerId, setOnlineMode } = useGameStore();

  const handleContinue = () => {
    if (!playerName.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Namen ein.');
      return;
    }

    if (playerName.trim().length < 2) {
      Alert.alert('Fehler', 'Der Name muss mindestens 2 Zeichen lang sein.');
      return;
    }

    if (playerName.trim().length > 20) {
      Alert.alert('Fehler', 'Der Name darf maximal 20 Zeichen lang sein.');
      return;
    }

    // Generate unique player ID and store player info
    generatePlayerId();
    setStoreName(playerName.trim());
    setOnlineMode(true);

    // Set player info in online service
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    OnlineService.getInstance().setPlayerInfo(playerId, playerName.trim());

    // Navigate based on mode
    if (mode === 'join') {
      setCurrentPhase('lobbyBrowser');
    } else {
      setCurrentPhase('createLobby');
    }
  };

  const handleBack = () => {
    setCurrentPhase('mainLobby');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {mode === 'join' ? 'Lobby beitreten' : 'Lobby erstellen'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {mode === 'join' ? '🔍' : '➕'}
          </Text>
        </View>

        <Text style={styles.welcomeText}>
          {mode === 'join' 
            ? 'Willkommen! Gib deinen Namen ein, um einer Lobby beizutreten.'
            : 'Willkommen! Gib deinen Namen ein, um eine neue Lobby zu erstellen.'
          }
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Dein Name</Text>
          <TextInput
            style={styles.textInput}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Gib deinen Spielernamen ein..."
            placeholderTextColor="#666"
            maxLength={20}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
          <Text style={styles.inputHint}>
            2-20 Zeichen • Wird anderen Spielern angezeigt
          </Text>
        </View>

        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>Beispiele:</Text>
          <View style={styles.exampleTags}>
            {['Alex', 'MisterX', 'Player1', 'Sarah'].map((example) => (
              <TouchableOpacity
                key={example}
                style={styles.exampleTag}
                onPress={() => setPlayerName(example)}
              >
                <Text style={styles.exampleTagText}>{example}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !playerName.trim() && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!playerName.trim()}
        >
          <Text style={[
            styles.continueButtonText,
            !playerName.trim() && styles.continueButtonTextDisabled
          ]}>
            {mode === 'join' ? '🔍 Lobbies durchsuchen' : '➕ Lobby erstellen'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Du kannst deinen Namen später nicht mehr ändern
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#fff',
    borderWidth: 2,
    borderColor: '#3a3a4e',
    textAlign: 'center',
  },
  inputHint: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 8,
  },
  exampleContainer: {
    marginBottom: 40,
  },
  exampleTitle: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 12,
    textAlign: 'center',
  },
  exampleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  exampleTag: {
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  exampleTagText: {
    fontSize: 14,
    color: '#bbb',
  },
  continueButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#666',
    elevation: 0,
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  continueButtonTextDisabled: {
    color: '#ccc',
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
});
