import { create } from 'zustand';
import { GamePhase, OfflineGameSettings, GameRound, PlayerClue, Vote, VotingState } from '../types/game';
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
  isPlayerImposter: (playerName: string) => boolean;
  guessWord: (playerName: string, guessedWord: string) => void;
  guessWordInLastChance: (playerName: string, guessedWord: string) => void;
  canImposterGuessWord: (playerName: string) => boolean;
  startVoting: () => void;
  submitVote: (targetName: string) => void;
  nextVoter: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
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
    wordGuessAttempted: false,
    wordGuessingDisabled: false,
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
    
    // Berechne die maximale Anzahl der Imposter basierend auf der neuen Spieleranzahl
    const halfPlayers = Math.floor(count / 2);
    let maxImposters = halfPlayers;
    while (maxImposters > 0 && count / maxImposters < 2) {
      maxImposters--;
    }
    maxImposters = Math.max(1, Math.min(maxImposters, count - 1));
    
    return {
      offlineSettings: {
        ...state.offlineSettings,
        playerCount: count,
        playerNames: newPlayerNames,
        imposterCount: Math.min(state.offlineSettings.imposterCount, maxImposters)
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
      wordGuessAttempted: false,
      wordGuessingDisabled: false,
    }
  }),

  startOfflineGame: () => set((state) => {
    // Assign roles randomly
    const playerNames = state.offlineSettings.playerNames.filter(name => name.trim() !== '');
    
    // Erstelle ein Array mit allen Spieler-Indizes und mische es
    const playerIndices = Array.from({ length: playerNames.length }, (_, i) => i);
    const shuffledIndices = [...playerIndices].sort(() => Math.random() - 0.5);
    
    // Wähle zufällige Positionen für die Imposter aus
    const imposterIndices = shuffledIndices.slice(0, state.offlineSettings.imposterCount);
    
    const assignedRoles = playerNames.map((playerName, index) => ({
      playerName,
      isImposter: imposterIndices.includes(index),
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

  generateNewWordPair: () => set((state) => {
    // Neue Wortpaar und zufälligen Imposter neu zuweisen
    const playerNames = state.offlineSettings.playerNames.filter(name => name.trim() !== '');
    const impCount = state.offlineSettings.imposterCount;
    // Imposter-Positionen zufällig wählen
    const playerCount = playerNames.length;
    const indices = Array.from({ length: playerCount }, (_, i) => i);
    const shuffledIndices = indices.sort(() => Math.random() - 0.5);
    const imposterIndices = shuffledIndices.slice(0, impCount);
    const assignedRoles = playerNames.map((playerName, idx) => ({
      playerName,
      isImposter: imposterIndices.includes(idx),
      hasSeenCard: false
    }));
    return {
      offlineSettings: {
        ...state.offlineSettings,
        currentWordPair: getRandomWordPair(),
        assignedRoles
      }
    };
  }),

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
        // Runde beendet, aber noch weitere Runden - erhöhe Rundennummer, neues Wort & neue Imposter
        const nextRoundNumber = state.offlineSettings.currentRoundNumber + 1;
        const playerNames = state.offlineSettings.playerNames.filter(name => name.trim() !== '');
        const impCount = state.offlineSettings.imposterCount;
        // Neue Imposter zufällig auswählen
        const indices = playerNames.map((_, i) => i);
        const shuffled = indices.sort(() => Math.random() - 0.5);
        const imposterIndices = shuffled.slice(0, impCount);
        const newAssignedRoles = playerNames.map((playerName, idx) => ({
          playerName,
          isImposter: imposterIndices.includes(idx),
          hasSeenCard: false
        }));
        return {
          offlineSettings: {
            ...state.offlineSettings,
            currentRoundNumber: nextRoundNumber,
            currentWordPair: getRandomWordPair(),
            assignedRoles: newAssignedRoles,
            wordGuessAttempted: false,
            wordGuessingDisabled: false,
            currentRound: {
              playerOrder: state.offlineSettings.currentRound.playerOrder,
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

  isPlayerImposter: (playerName: string) => get().offlineSettings.assignedRoles?.find(role => role.playerName === playerName)?.isImposter || false,

  canImposterGuessWord: (playerName: string) => {
    const state = get();
    const isImposter = state.offlineSettings.assignedRoles?.find(role => role.playerName === playerName)?.isImposter || false;
    
    // Nur Imposter können raten
    if (!isImposter) return false;
    
    // Wenn Wort-Raten deaktiviert ist, kann nicht geraten werden
    if (state.offlineSettings.wordGuessingDisabled) return false;
    
    // Imposter kann raten, solange noch kein Versuch gemacht wurde oder nur 1 Versuch erlaubt ist
    return !state.offlineSettings.wordGuessAttempted;
  },

  guessWord: (playerName: string, guessedWord: string) => set((state) => {
    // Evaluate guess and store result, do not change phase here
    const correctWord = state.offlineSettings.currentWordPair?.word?.toLowerCase().trim();
    const guess = guessedWord.toLowerCase().trim();
    const isWin = correctWord === guess;
    
    return {
      offlineSettings: {
        ...state.offlineSettings,
        wordGuessResult: { isWin, guessedWord, isLastChance: false },
        wordGuessAttempted: true,
        wordGuessingDisabled: !isWin, // Deaktiviere Raten wenn falsch geraten
      }
    };
  }),

  guessWordInLastChance: (playerName: string, guessedWord: string) => set((state) => {
    // Evaluate guess and store result for last chance attempt
    const correctWord = state.offlineSettings.currentWordPair?.word?.toLowerCase().trim();
    const guess = guessedWord.toLowerCase().trim();
    const isWin = correctWord === guess;
    
    return {
      offlineSettings: {
        ...state.offlineSettings,
        wordGuessResult: { isWin, guessedWord, isLastChance: true },
        wordGuessAttempted: true,
        wordGuessingDisabled: !isWin, // Deaktiviere Raten wenn falsch geraten
      }
    };
  }),
}));
