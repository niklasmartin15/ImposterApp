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

export type GamePhase = 'nameInput' | 'mainLobby' | 'gameRoom' | 'playing' | 'voting' | 'results';
