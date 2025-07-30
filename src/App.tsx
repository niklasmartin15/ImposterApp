import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from './stores/gameStore';
import { NameInputScreen } from './screens/NameInputScreen';
import { MainLobbyScreen } from './screens/MainLobbyScreen';

export const App: React.FC = () => {
  const { currentPhase } = useGameStore();

  const renderCurrentScreen = () => {
    switch (currentPhase) {
      case 'nameInput':
        return <NameInputScreen />;
      case 'mainLobby':
        return <MainLobbyScreen />;
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
