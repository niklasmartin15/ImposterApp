export interface Player {
  id: string;
  name: string;
  isImposter: boolean;
  score: number;
  clue?: string;
  votedFor?: string;
  isReady: boolean;
}

export interface Lobby {
  id: string;
  players: Player[];
  word: string;
  imposterWord: string;
  round: number;
  maxRounds: number;
  status: 'waiting' | 'inGame' | 'voting' | 'results';
  hostId: string;
  settings: LobbySettings;
}

export interface LobbySettings {
  wordCategory: string;
  numberOfRounds: number;
  timerPerTurn: number;
  chatEnabled: boolean;
}

export interface WordPair {
  word: string;
  imposterHint: string;
}

export interface OfflineGameSettings {
  playerCount: number;
  imposterCount: number;
  playerNames: string[];
  assignedRoles?: OfflinePlayerRole[];
  currentWordPair?: WordPair;
  currentRound?: GameRound;
  currentRoundNumber: number;
  maxRounds: number;
  allClues: PlayerClue[]; // Speichert alle Hinweise aus allen Runden
  votingState?: VotingState;
  wordGuessResult?: WordGuessResult;
  wordGuessAttempted: boolean; // Ob bereits ein Wort-Raten-Versuch gemacht wurde
  wordGuessingDisabled: boolean; // Ob Wort-Raten deaktiviert ist (nach falschem Versuch)
}

export interface OfflinePlayerRole {
  playerName: string;
  isImposter: boolean;
  hasSeenCard: boolean;
}

export interface PlayerClue {
  playerName: string;
  clue: string;
  roundNumber: number;
}

export interface GameRound {
  playerOrder: string[];
  currentPlayerIndex: number;
  clues: PlayerClue[];
  isComplete: boolean;
}

export interface Vote {
  voterName: string;
  targetName: string;
}

export interface VotingState {
  votes: Vote[];
  currentVoterIndex: number;
  isComplete: boolean;
  playerOrder: string[];
}

export interface WordGuessResult {
  isWin: boolean;
  guessedWord: string;
}

export type GamePhase = 'nameInput' | 'mainLobby' | 'offlineSetup' | 'offlineGame' | 'gameStarting' | 'gameRounds' | 'votingStart' | 'voting' | 'votingAnimation' | 'votingResults' | 'imposterLastChance' | 'wordGuessResults' | 'gameRoom' | 'playing' | 'results';
