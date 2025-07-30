import { create } from 'zustand';
import { GamePhase } from '../types/game';

interface GameState {
  // Player info
  playerName: string;
  playerId: string;
  
  // Game state
  currentPhase: GamePhase;
  
  // Actions
  setPlayerName: (name: string) => void;
  setCurrentPhase: (phase: GamePhase) => void;
  generatePlayerId: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  playerName: '',
  playerId: '',
  currentPhase: 'nameInput',
  
  // Actions
  setPlayerName: (name: string) => set({ playerName: name }),
  setCurrentPhase: (phase: GamePhase) => set({ currentPhase: phase }),
  generatePlayerId: () => set({ playerId: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }),
}));
