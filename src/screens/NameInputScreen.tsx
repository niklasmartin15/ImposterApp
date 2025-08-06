import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

export const NameInputScreen: React.FC = () => {
  const [inputName, setInputName] = useState('');
  const { setPlayerName, setCurrentPhase, generatePlayerId } = useGameStore();

  const handleContinue = () => {
    const trimmedName = inputName.trim();
    
    if (trimmedName.length < 2) {
      Alert.alert('Ungültiger Name', 'Bitte gib einen Namen mit mindestens 2 Zeichen ein.');
      return;
    }
    
    if (trimmedName.length > 20) {
      Alert.alert('Name zu lang', 'Der Name darf maximal 20 Zeichen lang sein.');
      return;
    }

    // Set player name and generate ID
    setPlayerName(trimmedName);
    generatePlayerId();
    
    // Navigate to main lobby
    setCurrentPhase('mainLobby');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🕵️ Imposter</Text>
            <Text style={styles.subtitle}>Willkommen beim Spiel!</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Wie ist dein Name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Gib deinen Namen ein..."
              placeholderTextColor="#999"
              value={inputName}
              onChangeText={setInputName}
              maxLength={20}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <Text style={styles.hint}>2-20 Zeichen</Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.continueButton, 
              inputName.trim().length < 2 && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={inputName.trim().length < 2}
          >
            <Text style={[
              styles.continueButtonText,
              inputName.trim().length < 2 && styles.disabledButtonText
            ]}>
              Weiter
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#bbb',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 20,
    color: '#eee',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#0f3460',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: '#eee',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabledButtonText: {
    color: '#aaa',
  },
});
