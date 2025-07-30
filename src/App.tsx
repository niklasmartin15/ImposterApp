import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from './stores/gameStore';
import { NameInputScreen } from './screens/NameInputScreen';
import { MainLobbyScreen } from './screens/MainLobbyScreen';
import { OfflineSetupScreen } from './screens/OfflineSetupScreen';
import { OfflineGameScreen } from './screens/OfflineGameScreen';
import { GameStartingScreen } from './screens/GameStartingScreen';
import { GameRoundsScreen } from './screens/GameRoundsScreen';
import { VotingScreen } from './screens/VotingScreen';
import { VotingStartScreen } from './screens/VotingStartScreen';
import { VotingAnimationScreen } from './screens/VotingAnimationScreen';
import { VotingResultsScreen } from './screens/VotingResultsScreen';

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
