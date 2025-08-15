import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import OnlineService from '../services/OnlineService';
import { useGameStore } from '../stores/gameStore';

export const CreateLobbyScreen: React.FC = () => {
  const [lobbyName, setLobbyName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [gameMode, setGameMode] = useState('Standard');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [wordDifficulty, setWordDifficulty] = useState('medium');
  const [maxRounds, setMaxRounds] = useState(3);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);

  const gameModeOptions = ['Standard', 'Hard Mode', 'Fun Mode', 'Speed Game'];
  const difficultyOptions = [
    { value: 'easy', label: 'Einfach' },
    { value: 'medium', label: 'Mittel' },
    { value: 'hard', label: 'Schwer' },
  ];

  const handleBackToMenu = () => {
    const { setCurrentPhase } = useGameStore.getState();
    setCurrentPhase('mainLobby');
  };

  const handleCreateLobby = async () => {
    if (!lobbyName.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Lobby-Namen ein.');
      return;
    }

    if (isPasswordProtected && !password.trim()) {
      Alert.alert('Fehler', 'Bitte gib ein Passwort ein oder deaktiviere den Passwort-Schutz.');
      return;
    }

    try {
      const { playerName } = useGameStore.getState();
      
      const lobbyData = {
        name: lobbyName,
        maxPlayers,
        gameMode,
        isPasswordProtected,
        password: isPasswordProtected ? password : undefined,
        wordDifficulty,
        maxRounds,
        timerEnabled,
        timerDuration: timerEnabled ? timerDuration : undefined,
        hostName: playerName,
      };

      const result = await OnlineService.getInstance().createLobby(lobbyData);
      
      if (result.success) {
        // Store the created lobby in the game store
        const { setCurrentLobby, setCurrentPhase } = useGameStore.getState();
        setCurrentLobby(result.lobby);
        setCurrentPhase('gameRoom');
      } else {
        Alert.alert('Fehler', 'Konnte Lobby nicht erstellen. Versuche es erneut.');
      }
    } catch (error) {
      console.error('Failed to create lobby:', error);
      Alert.alert('Fehler', 'Fehler beim Erstellen der Lobby.');
    }
  };

  const renderOptionButton = (
    options: string[] | { value: string; label: string }[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    return (
      <View style={styles.optionRow}>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          const isSelected = selectedValue === value;
          
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected
              ]}
              onPress={() => onSelect(value)}
            >
              <Text style={[
                styles.optionButtonText,
                isSelected && styles.optionButtonTextSelected
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderNumberSelector = (
    value: number,
    onDecrease: () => void,
    onIncrease: () => void,
    min: number,
    max: number
  ) => (
    <View style={styles.numberSelector}>
      <TouchableOpacity
        style={[styles.numberButton, value <= min && styles.numberButtonDisabled]}
        onPress={onDecrease}
        disabled={value <= min}
      >
        <Text style={[styles.numberButtonText, value <= min && styles.numberButtonTextDisabled]}>-</Text>
      </TouchableOpacity>
      <Text style={styles.numberValue}>{value}</Text>
      <TouchableOpacity
        style={[styles.numberButton, value >= max && styles.numberButtonDisabled]}
        onPress={onIncrease}
        disabled={value >= max}
      >
        <Text style={[styles.numberButtonText, value >= max && styles.numberButtonTextDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToMenu}
        >
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lobby erstellen</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lobby-Name</Text>
          <TextInput
            style={styles.textInput}
            value={lobbyName}
            onChangeText={setLobbyName}
            placeholder="Gib deinen Lobby-Namen ein..."
            placeholderTextColor="#666"
            maxLength={30}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Max. Spieler</Text>
          <Text style={styles.sectionDescription}>Wähle die maximale Anzahl an Spielern (4-12)</Text>
          {renderNumberSelector(
            maxPlayers,
            () => setMaxPlayers(Math.max(4, maxPlayers - 1)),
            () => setMaxPlayers(Math.min(12, maxPlayers + 1)),
            4,
            12
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spielmodus</Text>
          {renderOptionButton(gameModeOptions, gameMode, setGameMode)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wort-Schwierigkeit</Text>
          {renderOptionButton(difficultyOptions, wordDifficulty, setWordDifficulty)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Max. Runden</Text>
          <Text style={styles.sectionDescription}>Anzahl der Spielrunden (1-5)</Text>
          {renderNumberSelector(
            maxRounds,
            () => setMaxRounds(Math.max(1, maxRounds - 1)),
            () => setMaxRounds(Math.min(5, maxRounds + 1)),
            1,
            5
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.sectionTitle}>Timer pro Zug</Text>
              <Text style={styles.sectionDescription}>
                Zeitlimit für Hinweise setzen
              </Text>
            </View>
            <Switch
              value={timerEnabled}
              onValueChange={setTimerEnabled}
              trackColor={{ false: '#3a3a4e', true: '#e94560' }}
              thumbColor={timerEnabled ? '#fff' : '#bbb'}
            />
          </View>
          
          {timerEnabled && (
            <View style={styles.timerSettings}>
              <Text style={styles.subSectionTitle}>Timer-Dauer (Sekunden)</Text>
              {renderNumberSelector(
                timerDuration,
                () => setTimerDuration(Math.max(30, timerDuration - 10)),
                () => setTimerDuration(Math.min(180, timerDuration + 10)),
                30,
                180
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.sectionTitle}>Passwort-Schutz</Text>
              <Text style={styles.sectionDescription}>
                Lobby mit Passwort schützen
              </Text>
            </View>
            <Switch
              value={isPasswordProtected}
              onValueChange={setIsPasswordProtected}
              trackColor={{ false: '#3a3a4e', true: '#e94560' }}
              thumbColor={isPasswordProtected ? '#fff' : '#bbb'}
            />
          </View>

          {isPasswordProtected && (
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Passwort eingeben..."
              placeholderTextColor="#666"
              secureTextEntry={true}
              maxLength={20}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateLobby}
        >
          <Text style={styles.createButtonText}>🚀 Lobby erstellen</Text>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  optionButtonSelected: {
    backgroundColor: '#e94560',
    borderColor: '#ff6b8a',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bbb',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  numberSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  numberButton: {
    backgroundColor: '#e94560',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonDisabled: {
    backgroundColor: '#666',
  },
  numberButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  numberButtonTextDisabled: {
    color: '#ccc',
  },
  numberValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 40,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchInfo: {
    flex: 1,
  },
  timerSettings: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  bottomActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  createButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
