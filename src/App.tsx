import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CreateLobbyScreen } from './screens/CreateLobbyScreen';
import { GameModeSettingsScreen } from './screens/GameModeSettingsScreen';
import { GameRoomScreen } from './screens/GameRoomScreen';
import { GameRoundsScreen } from './screens/GameRoundsScreen';
import { GameStartingScreen } from './screens/GameStartingScreen';
import { ImposterLastChanceScreen } from './screens/ImposterLastChanceScreen';
import { LobbyBrowserScreen } from './screens/LobbyBrowserScreen';
import { MainLobbyScreen } from './screens/MainLobbyScreen';
import { NameInputScreen } from './screens/NameInputScreen';
import { OfflineGameScreen } from './screens/OfflineGameScreen';
import { OfflineSetupScreen } from './screens/OfflineSetupScreen';
import { OnlineNameInputScreen } from './screens/OnlineNameInputScreen';
import { OnlineRoleCardsScreen } from './screens/OnlineRoleCardsScreen';
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
      case 'lobbyBrowser':
        return <LobbyBrowserScreen />;
      case 'createLobby':
        return <CreateLobbyScreen />;
      case 'onlineNameInputJoin':
        return <OnlineNameInputScreen mode="join" />;
      case 'onlineNameInputCreate':
        return <OnlineNameInputScreen mode="create" />;
      case 'gameRoom':
        return <GameRoomScreen />;
      case 'onlineRoleCards':
        return <OnlineRoleCardsScreen />;
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
