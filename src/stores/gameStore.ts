import { create } from 'zustand';
import { getDifficultyDisplayName, getRandomWordPair, getRandomWordPairByDifficulty } from '../data/wordPairs';
import { GameMode, GamePhase, GameRound, OfflineGameSettings, PlayerClue, Vote, VotingState, WordDifficulty } from '../types/game';

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
  markPlayerCardSeen: (playerName: string) => void;
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
  resetGameKeepPlayers: () => void;
  continueToNextRound: () => void;
  endGameAndVote: () => void;
  simulateVotingForOpenMode: (selectedImposter: string) => void;
  setGameMode: (mode: GameMode) => void;
  getGameModeDisplayName: (mode: GameMode) => string;
  setWordDifficulty: (difficulty: WordDifficulty) => void;
  getWordDifficultyDisplayName: (difficulty: WordDifficulty) => string;
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
    gameWordPair: undefined,
    currentRoundNumber: 1,
    maxRounds: 5,
    allClues: [],
    wordGuessAttempted: false,
    wordGuessingDisabled: false,
    gameMode: 'wordInput_playerAdvance' as GameMode,
    wordDifficulty: 'medium' as WordDifficulty,
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
  
  resetOfflineSettings: () => set(() => {
    const initialWordPair = getRandomWordPair();
    return {
      offlineSettings: {
        playerCount: 4,
        imposterCount: 1,
        playerNames: ['', '', '', ''],
        assignedRoles: [],
        currentWordPair: initialWordPair,
        gameWordPair: initialWordPair, // Setze gameWordPair auch
        currentRoundNumber: 1,
        maxRounds: 5, // Maximal 5 Runden möglich
        allClues: [],
        wordGuessAttempted: false,
        wordGuessingDisabled: false,
        wordGuessResult: undefined, // Clear any previous word guess results
        votingState: undefined,     // Clear voting state
        gameMode: 'wordInput_playerAdvance' as GameMode, // Standard Spielmodus
        wordDifficulty: 'medium' as WordDifficulty, // Standard Schwierigkeitsgrad
      }
    };
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
      hasSeenCard: false,
      isFlipped: false
    }));

    // Generiere ein neues Wort basierend auf der gewählten Schwierigkeit
    const newWordPair = getRandomWordPairByDifficulty(state.offlineSettings.wordDifficulty);

    return {
      offlineSettings: {
        ...state.offlineSettings,
        assignedRoles,
        currentWordPair: newWordPair,
        gameWordPair: newWordPair,
        allClues: [], // Lösche alle vorherigen Hinweise
        wordGuessAttempted: false,
        wordGuessingDisabled: false,
        wordGuessResult: undefined, // Clear previous word guess results
        votingState: undefined,     // Clear voting state
        currentRound: undefined,    // Clear current round
      },
      currentPhase: 'offlineGame' as GamePhase
    };
  }),

  togglePlayerCardSeen: (playerName: string) => set((state) => {
    const newRoles = state.offlineSettings.assignedRoles?.map(role => {
      if (role.playerName === playerName) {
        // Wenn noch nicht umgedreht: umdrehen
        if (!role.isFlipped) {
          return { ...role, isFlipped: true };
        }
        // Wenn bereits umgedreht aber noch nicht als gesehen markiert: als gesehen markieren
        else if (!role.hasSeenCard) {
          return { ...role, hasSeenCard: true };
        }
        // Wenn bereits als gesehen markiert: nichts ändern (disabled)
        return role;
      }
      return role;
    }) || [];

    return {
      offlineSettings: {
        ...state.offlineSettings,
        assignedRoles: newRoles
      }
    };
  }),

  // Neue Funktion für "Halten & Loslassen"-Methode
  markPlayerCardSeen: (playerName: string) => set((state) => {
    const newRoles = state.offlineSettings.assignedRoles?.map(role => {
      if (role.playerName === playerName && !role.hasSeenCard) {
        // Direkt als gesehen markieren, ohne den isFlipped Zwischenschritt
        return { ...role, hasSeenCard: true, isFlipped: false };
      }
      return role;
    }) || [];

    return {
      offlineSettings: {
        ...state.offlineSettings,
        assignedRoles: newRoles
      }
    };
  }),

  generateNewWordPair: () => set((state) => {
    // Erzeuge neues Wortpaar basierend auf der gewählten Schwierigkeit und reset Rating-Flags
    const newWordPair = getRandomWordPairByDifficulty(state.offlineSettings.wordDifficulty);
    const playerNames = state.offlineSettings.playerNames.filter(name => name.trim() !== '');
    const impCount = state.offlineSettings.imposterCount;
    // Imposter-Positionen zufällig wählen
    const playerCount = playerNames.length;
    const indices = Array.from({ length: playerCount }, (_, i) => i);
    const shuffled = [...indices].sort(() => Math.random() - 0.5);
    const imposterIndices = shuffled.slice(0, impCount);
    const assignedRoles = playerNames.map((playerName, idx) => ({
      playerName,
      isImposter: imposterIndices.includes(idx),
      hasSeenCard: false,
      isFlipped: false
    }));
    return {
      offlineSettings: {
        ...state.offlineSettings,
        currentWordPair: newWordPair,
        gameWordPair: newWordPair, // Setze gameWordPair auch auf das neue Wort
        assignedRoles,
        allClues: [], // Lösche alle vorherigen Hinweise
        wordGuessAttempted: false,
        wordGuessingDisabled: false,
        wordGuessResult: undefined, // Clear previous word guess results
        votingState: undefined,     // Clear voting state
        currentRound: undefined,    // Clear current round
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
        currentRound: newRound,
        allClues: [], // Lösche alle vorherigen Hinweise beim Start neuer Game Rounds
        gameWordPair: state.offlineSettings.currentWordPair, // Speichere das aktuelle Wort für das Spiel
        wordGuessAttempted: false,
        wordGuessingDisabled: false,
        wordGuessResult: undefined, // Clear previous word guess results
        votingState: undefined,     // Clear voting state
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
      const currentRound = state.offlineSettings.currentRoundNumber;
      const maxRounds = state.offlineSettings.maxRounds;
      
      // Prüfe ob wir eine Fortsetzungsentscheidung brauchen (nach Runde 1, 2, 3, oder 4)
      if (currentRound >= 1 && currentRound < maxRounds) {
        return {
          offlineSettings: {
            ...state.offlineSettings,
            currentRound: {
              ...state.offlineSettings.currentRound,
              isComplete: true
            }
          },
          currentPhase: 'roundContinuation' as GamePhase
        };
      }
      
      // Nach maxRounds erreicht - direkt zum Voting
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
    const gameWordPair = state.offlineSettings.gameWordPair;
    const correctWord = gameWordPair?.word?.toLowerCase().trim();
    const guess = guessedWord.toLowerCase().trim();
    const isWin = correctWord === guess;
    
    console.log('guessWord - Game word:', gameWordPair?.word, 'Guess:', guessedWord, 'IsWin:', isWin);
    
    return {
      offlineSettings: {
        ...state.offlineSettings,
        wordGuessResult: {
          isWin,
          guessedWord,
          isLastChance: false,
          targetWord: gameWordPair?.word || '',
          targetHint: gameWordPair?.imposterHint || ''
        },
        wordGuessAttempted: true,
        wordGuessingDisabled: !isWin, // Deaktiviere Raten wenn falsch geraten
      }
    };
  }),

  guessWordInLastChance: (playerName: string, guessedWord: string) => set((state) => {
    // Evaluate guess and store result for last chance attempt
    const gameWordPair = state.offlineSettings.gameWordPair;
    const correctWord = gameWordPair?.word?.toLowerCase().trim();
    const guess = guessedWord.toLowerCase().trim();
    const isWin = correctWord === guess;
    
    console.log('guessWordInLastChance - Game word:', gameWordPair?.word, 'Guess:', guessedWord, 'IsWin:', isWin);
    
    return {
      offlineSettings: {
        ...state.offlineSettings,
        wordGuessResult: {
          isWin,
          guessedWord,
          isLastChance: true,
          targetWord: gameWordPair?.word || '',
          targetHint: gameWordPair?.imposterHint || ''
        },
        wordGuessAttempted: true,
        wordGuessingDisabled: !isWin, // Deaktiviere Raten wenn falsch geraten
      }
    };
  }),

  resetGameKeepPlayers: () => set((state) => {
    // Behalte die Spielernamen, aber setze alles andere zurück und gehe direkt zum Rollenselektions-Screen
    const initialWordPair = getRandomWordPair();
    const playerNames = state.offlineSettings.playerNames.filter(name => name.trim() !== '');
    const impCount = state.offlineSettings.imposterCount;
    
    // Imposter-Positionen zufällig wählen
    const playerCount = playerNames.length;
    const indices = Array.from({ length: playerCount }, (_, i) => i);
    const shuffled = [...indices].sort(() => Math.random() - 0.5);
    const imposterIndices = shuffled.slice(0, impCount);
    
    const assignedRoles = playerNames.map((playerName, idx) => ({
      playerName,
      isImposter: imposterIndices.includes(idx),
      hasSeenCard: false,
      isFlipped: false
    }));

    return {
      offlineSettings: {
        ...state.offlineSettings,
        currentWordPair: initialWordPair,
        gameWordPair: initialWordPair,
        assignedRoles,
        currentRoundNumber: 1,
        allClues: [],
        wordGuessAttempted: false,
        wordGuessingDisabled: false,
        wordGuessResult: undefined,
        votingState: undefined,
        currentRound: undefined,
      },
      currentPhase: 'offlineGame' as GamePhase // Gehe direkt zur Rollenselektion, überspringe Setup
    };
  }),

  // Neue Aktionen für Rundenkontinuation
  continueToNextRound: () => set((state) => {
    // Starte die nächste Runde
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
      hasSeenCard: false,
      isFlipped: false
    }));
    
    // Neues Wortpaar für die neue Runde
    const newWordPair = getRandomWordPair();
    
    return {
      offlineSettings: {
        ...state.offlineSettings,
        currentRoundNumber: nextRoundNumber,
        currentWordPair: newWordPair,
        gameWordPair: newWordPair, // Beide auf das gleiche neue Wort setzen
        assignedRoles: newAssignedRoles,
        allClues: [], // Lösche alle vorherigen Hinweise bei neuer Runde
        wordGuessAttempted: false,
        wordGuessingDisabled: false,
        wordGuessResult: undefined,
        votingState: undefined, // Clear voting state
        currentRound: {
          playerOrder: state.offlineSettings.currentRound?.playerOrder || playerNames,
          currentPlayerIndex: 0,
          clues: [],
          isComplete: false
        }
      },
      currentPhase: 'gameStarting' as GamePhase
    };
  }),

  endGameAndVote: () => set((state) => {
    // Spiel beenden und zum Voting gehen
    return {
      ...state,
      currentPhase: 'votingStart' as GamePhase
    };
  }),

  // Neue Funktion für offenen Modus: Direkt zu VotingResults mit simuliertem Voting
  simulateVotingForOpenMode: (selectedImposter: string) => set((state) => {
    if (!state.offlineSettings.currentRound) return state;

    const playerOrder = state.offlineSettings.currentRound.playerOrder;
    
    // Simuliere eine Abstimmung: Alle Spieler stimmen für den ausgewählten Imposter
    const simulatedVotes: Vote[] = playerOrder.map((voter) => ({
      voterName: voter,
      targetName: selectedImposter
    }));

    // Erstelle einen VotingState mit allen Stimmen bereits abgegeben
    const votingState: VotingState = {
      votes: simulatedVotes,
      currentVoterIndex: playerOrder.length, // Alle haben abgestimmt
      isComplete: true,
      playerOrder: playerOrder
    };

    return {
      offlineSettings: {
        ...state.offlineSettings,
        votingState: votingState
      },
      currentPhase: 'votingResults' as GamePhase
    };
  }),

  setGameMode: (mode: GameMode) => set((state) => ({
    offlineSettings: {
      ...state.offlineSettings,
      gameMode: mode
    }
  })),

  getGameModeDisplayName: (mode: GameMode) => {
    switch (mode) {
      case 'wordInput_playerAdvance':
        return 'Wörter eingeben, Spieler weiterklicken';
      case 'playerAdvance_only':
        return 'Nur Spieler weiterklicken';
      case 'open_mode':
        return 'Offener Modus';
      default:
        return 'Unbekannt';
    }
  },

  setWordDifficulty: (difficulty: WordDifficulty) => set((state) => ({
    offlineSettings: {
      ...state.offlineSettings,
      wordDifficulty: difficulty
    }
  })),

  getWordDifficultyDisplayName: (difficulty: WordDifficulty) => {
    return getDifficultyDisplayName(difficulty);
  },
}));
