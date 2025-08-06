import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GameModeSettingsScreen } from './screens/GameModeSettingsScreen';
import { GameRoundsScreen } from './screens/GameRoundsScreen';
import { GameStartingScreen } from './screens/GameStartingScreen';
import { ImposterLastChanceScreen } from './screens/ImposterLastChanceScreen';
import { MainLobbyScreen } from './screens/MainLobbyScreen';
import { NameInputScreen } from './screens/NameInputScreen';
import { OfflineGameScreen } from './screens/OfflineGameScreen';
import { OfflineSetupScreen } from './screens/OfflineSetupScreen';
import RoundContinuationScreen from './screens/RoundContinuationScreen';
import { VotingAnimationScreen } from './screens/VotingAnimationScreen';
import { VotingResultsScreen } from './screens/VotingResultsScreen';
import { VotingScreen } from './screens/VotingScreen';
import { VotingStartScreen } from './screens/VotingStartScreen';
import { WordGuessResultsScreen } from './screens/WordGuessResultsScreen';
import { useGameStore } from './stores/gameStore';

export const App: React.FC = () => {
  const { currentPhase } = useGameStore();

  const renderCurrentScreen = () => {
    switch (currentPhase) {
      case 'nameInput':
        return <NameInputScreen />;
      case 'mainLobby':
        return <MainLobbyScreen />;
      case 'offlineSetup':
        return <OfflineSetupScreen />;
      case 'gameModeSettings':
        return <GameModeSettingsScreen />;
      case 'offlineGame':
        return <OfflineGameScreen />;
      case 'gameStarting':
        return <GameStartingScreen />;
      case 'gameRounds':
        return <GameRoundsScreen />;
      case 'votingStart':
        return <VotingStartScreen />;
      case 'voting':
        return <VotingScreen />;
      case 'votingAnimation':
        return <VotingAnimationScreen />;
      case 'votingResults':
        return <VotingResultsScreen />;
      case 'imposterLastChance':
        return <ImposterLastChanceScreen />;
      case 'wordGuessResults':
        return <WordGuessResultsScreen />;
      case 'roundContinuation':
        return <RoundContinuationScreen />;
      default:
        return <NameInputScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
