import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';

const { width } = Dimensions.get('window');

export const OfflineGameScreen: React.FC = () => {
  const { 
    offlineSettings, 
    togglePlayerCardSeen,
    setCurrentPhase,
    generateNewWordPair
  } = useGameStore();

  const handleBack = () => {
    setCurrentPhase('offlineSetup');
  };

  const renderPlayerCard = (role: any, index: number) => {
    const isFlipped = role.hasSeenCard;
    
    return (
      <TouchableOpacity
        key={index}
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
                  <Text style={styles.imposterText}>🕵️ IMPOSTER</Text>
                  <Text style={styles.imposterSubtext}>Hinweis: {offlineSettings.currentWordPair?.imposterHint}</Text>
                </View>
              ) : (
                <View style={styles.wordContent}>
                  <Text style={styles.wordLabel}>Dein Wort:</Text>
                  <Text style={styles.wordText}>{offlineSettings.currentWordPair?.realWord}</Text>
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>🃏 Rollenkarten</Text>
            <Text style={styles.subtitle}>Jeder Spieler schaut sich heimlich seine Karte an</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              🎯 {offlineSettings.imposterCount} von {offlineSettings.playerCount} Spielern sind Imposter
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            {offlineSettings.assignedRoles?.map((role, index) => 
              renderPlayerCard(role, index)
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.newWordButton}
              onPress={() => {
                generateNewWordPair();
                console.log('Neues Wort generiert');
              }}
            >
              <Text style={styles.newWordButtonText}>🎲 Neues Wort</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => {
                // TODO: Continue to game phase
                console.log('Weiter zum Spiel');
              }}
            >
              <Text style={styles.continueButtonText}>🎮 Spiel beginnen</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>← Zurück zur Einrichtung</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  infoText: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    fontWeight: '500',
  },
  currentWordText: {
    fontSize: 14,
    color: '#e94560',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    width: (width - 60) / 2,
    aspectRatio: 0.7,
    marginBottom: 16,
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 16,
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
    borderColor: '#16213e',
  },
  cardFront: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardPlayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardPlayerNameSmall: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardHint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  cardHintSmall: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  imposterContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  imposterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  imposterSubtext: {
    fontSize: 16,
    color: '#e94560',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  wordContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  wordLabel: {
    fontSize: 18,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 8,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  newWordButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  newWordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  continueButton: {
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
  continueButtonText: {
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
