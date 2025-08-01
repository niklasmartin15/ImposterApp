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
    generateNewWordPair,
    startGameRounds
  } = useGameStore();

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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 4,
  },
  imposterSubtext: {
    fontSize: 11,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  wordTextLong: {
    fontSize: 16,
    lineHeight: 20,
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
  buttonSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
});
