import { create } from 'zustand';
import { GamePhase, OfflineGameSettings, OfflinePlayerRole } from '../types/game';
import { getRandomWordPair } from '../data/wordPairs';

interface GameState {
  // Player info
  playerName: string;
  playerId: string;
  
  // Game state
  currentPhase: GamePhase;
  
  // Offline game settings
  offlineSettings: OfflineGameSettings;
  
  // Actions
  setPlayerName: (name: string) => void;
  setCurrentPhase: (phase: GamePhase) => void;
  generatePlayerId: () => void;
  setOfflinePlayerCount: (count: number) => void;
  setOfflineImposterCount: (count: number) => void;
  setOfflinePlayerName: (index: number, name: string) => void;
  resetOfflineSettings: () => void;
  startOfflineGame: () => void;
  togglePlayerCardSeen: (playerName: string) => void;
  generateNewWordPair: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  playerName: '',
  playerId: '',
  currentPhase: 'nameInput',
  offlineSettings: {
    playerCount: 4,
    imposterCount: 1,
    playerNames: ['', '', '', ''],
    assignedRoles: [],
    currentWordPair: getRandomWordPair(),
  },
  
  // Actions
  setPlayerName: (name: string) => set({ playerName: name }),
  setCurrentPhase: (phase: GamePhase) => set({ currentPhase: phase }),
  generatePlayerId: () => set({ playerId: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }),
  
  // Offline game actions
  setOfflinePlayerCount: (count: number) => set((state) => {
    const newPlayerNames = Array(count).fill('').map((_, index) => 
      state.offlineSettings.playerNames[index] || ''
    );
    return {
      offlineSettings: {
        ...state.offlineSettings,
        playerCount: count,
        playerNames: newPlayerNames,
        imposterCount: Math.min(state.offlineSettings.imposterCount, Math.max(1, count - 1))
      }
    };
  }),
  
  setOfflineImposterCount: (count: number) => set((state) => ({
    offlineSettings: {
      ...state.offlineSettings,
      imposterCount: count
    }
  })),
  
  setOfflinePlayerName: (index: number, name: string) => set((state) => {
    const newPlayerNames = [...state.offlineSettings.playerNames];
    newPlayerNames[index] = name;
    return {
      offlineSettings: {
        ...state.offlineSettings,
        playerNames: newPlayerNames
      }
    };
  }),
  
  resetOfflineSettings: () => set({
    offlineSettings: {
      playerCount: 4,
      imposterCount: 1,
      playerNames: ['', '', '', ''],
      assignedRoles: [],
      currentWordPair: getRandomWordPair(),
    }
  }),

  startOfflineGame: () => set((state) => {
    // Assign roles randomly
    const playerNames = state.offlineSettings.playerNames.filter(name => name.trim() !== '');
    const shuffledPlayers = [...playerNames].sort(() => Math.random() - 0.5);
    
    const assignedRoles = shuffledPlayers.map((playerName, index) => ({
      playerName,
      isImposter: index < state.offlineSettings.imposterCount,
      hasSeenCard: false
    }));

    return {
      offlineSettings: {
        ...state.offlineSettings,
        assignedRoles
      },
      currentPhase: 'offlineGame' as GamePhase
    };
  }),

  togglePlayerCardSeen: (playerName: string) => set((state) => {
    const newRoles = state.offlineSettings.assignedRoles?.map(role => 
      role.playerName === playerName 
        ? { ...role, hasSeenCard: !role.hasSeenCard }
        : role
    ) || [];

    return {
      offlineSettings: {
        ...state.offlineSettings,
        assignedRoles: newRoles
      }
    };
  }),

  generateNewWordPair: () => set((state) => ({
    offlineSettings: {
      ...state.offlineSettings,
      currentWordPair: getRandomWordPair()
    }
  })),
}));
