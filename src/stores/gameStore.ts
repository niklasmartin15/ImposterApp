import { create } from 'zustand';
import { GamePhase, OfflineGameSettings, OfflinePlayerRole, GameRound, PlayerClue, Vote, VotingState } from '../types/game';
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
  startGameRounds: () => void;
  submitPlayerClue: (clue: string) => void;
  nextPlayer: () => void;
  startNextRound: () => void;
  startVoting: () => void;
  submitVote: (targetName: string) => void;
  nextVoter: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  playerName: '',
  playerId: '',
  currentPhase: 'mainLobby',
  offlineSettings: {
    playerCount: 4,
    imposterCount: 1,
    playerNames: ['', '', '', ''],
    assignedRoles: [],
    currentWordPair: getRandomWordPair(),
    currentRoundNumber: 1,
    maxRounds: 2,
    allClues: [],
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
      currentRoundNumber: 1,
      maxRounds: 2,
      allClues: [],
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

  startGameRounds: () => set((state) => {
    // Zufällige Spielerreihenfolge generieren
    const playerNames = state.offlineSettings.assignedRoles?.map(role => role.playerName) || [];
    const shuffledPlayerOrder = [...playerNames].sort(() => Math.random() - 0.5);
    
    const newRound: GameRound = {
      playerOrder: shuffledPlayerOrder,
      currentPlayerIndex: 0,
      clues: [],
      isComplete: false
    };

    return {
      offlineSettings: {
        ...state.offlineSettings,
        currentRound: newRound
      },
      currentPhase: 'gameStarting' as GamePhase
    };
  }),

  submitPlayerClue: (clue: string) => set((state) => {
    if (!state.offlineSettings.currentRound) return state;

    const currentPlayer = state.offlineSettings.currentRound.playerOrder[state.offlineSettings.currentRound.currentPlayerIndex];
    const newClue: PlayerClue = {
      playerName: currentPlayer,
      clue: clue,
      roundNumber: state.offlineSettings.currentRoundNumber
    };

    const updatedClues = [...state.offlineSettings.currentRound.clues, newClue];
    const allClues = [...state.offlineSettings.allClues, newClue];

    return {
      offlineSettings: {
        ...state.offlineSettings,
        allClues: allClues,
        currentRound: {
          ...state.offlineSettings.currentRound,
          clues: updatedClues
        }
      }
    };
  }),

  nextPlayer: () => set((state) => {
    if (!state.offlineSettings.currentRound) return state;

    const nextIndex = state.offlineSettings.currentRound.currentPlayerIndex + 1;
    const isRoundComplete = nextIndex >= state.offlineSettings.currentRound.playerOrder.length;

    if (isRoundComplete) {
      // Prüfe ob es weitere Runden gibt
      const isLastRound = state.offlineSettings.currentRoundNumber >= state.offlineSettings.maxRounds;
      
      if (isLastRound) {
        // Letzte Runde beendet - zur Voting-Start Animation
        return {
          offlineSettings: {
            ...state.offlineSettings,
            currentRound: {
              ...state.offlineSettings.currentRound,
              isComplete: true
            }
          },
          currentPhase: 'votingStart' as GamePhase
        };
      } else {
        // Runde beendet, aber noch weitere Runden - erhöhe Rundennummer und gehe zu gameStarting
        const currentPlayerOrder = state.offlineSettings.currentRound.playerOrder;
        
        return {
          offlineSettings: {
            ...state.offlineSettings,
            currentRoundNumber: state.offlineSettings.currentRoundNumber + 1,
            currentWordPair: getRandomWordPair(),
            currentRound: {
              playerOrder: currentPlayerOrder, // Gleiche Reihenfolge beibehalten
              currentPlayerIndex: 0,
              clues: [],
              isComplete: false
            }
          },
          currentPhase: 'gameStarting' as GamePhase
        };
      }
    }

    return {
      offlineSettings: {
        ...state.offlineSettings,
        currentRound: {
          ...state.offlineSettings.currentRound,
          currentPlayerIndex: nextIndex
        }
      }
    };
  }),

  startNextRound: () => set((state) => {
    // Diese Funktion wird nicht mehr verwendet, da nextPlayer() alles übernimmt
    return state;
  }),

  startVoting: () => set((state) => {
    if (!state.offlineSettings.currentRound) return state;

    const votingState: VotingState = {
      votes: [],
      currentVoterIndex: 0,
      isComplete: false,
      playerOrder: state.offlineSettings.currentRound.playerOrder
    };

    return {
      offlineSettings: {
        ...state.offlineSettings,
        votingState: votingState
      },
      currentPhase: 'voting' as GamePhase
    };
  }),

  submitVote: (targetName: string) => set((state) => {
    if (!state.offlineSettings.votingState) return state;

    const currentVoter = state.offlineSettings.votingState.playerOrder[state.offlineSettings.votingState.currentVoterIndex];
    const newVote: Vote = {
      voterName: currentVoter,
      targetName: targetName
    };

    const updatedVotes = [...state.offlineSettings.votingState.votes, newVote];

    return {
      offlineSettings: {
        ...state.offlineSettings,
        votingState: {
          ...state.offlineSettings.votingState,
          votes: updatedVotes
        }
      }
    };
  }),

  nextVoter: () => set((state) => {
    if (!state.offlineSettings.votingState) return state;

    const nextIndex = state.offlineSettings.votingState.currentVoterIndex + 1;
    const isVotingComplete = nextIndex >= state.offlineSettings.votingState.playerOrder.length;

    if (isVotingComplete) {
      return {
        offlineSettings: {
          ...state.offlineSettings,
          votingState: {
            ...state.offlineSettings.votingState,
            isComplete: true
          }
        },
        currentPhase: 'votingAnimation' as GamePhase
      };
    }

    return {
      offlineSettings: {
        ...state.offlineSettings,
        votingState: {
          ...state.offlineSettings.votingState,
          currentVoterIndex: nextIndex
        }
      }
    };
  }),
}));
