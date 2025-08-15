// Online Service für lokale Entwicklung und Testing
class OnlineService {
  private static instance: OnlineService;
  private baseUrl = 'http://localhost:3001'; // Lokaler Server
  private playerId: string | null = null;
  private playerName: string | null = null;

  private constructor() {}

  static getInstance(): OnlineService {
    if (!OnlineService.instance) {
      OnlineService.instance = new OnlineService();
    }
    return OnlineService.instance;
  }

  setPlayerInfo(id: string, name: string) {
    this.playerId = id;
    this.playerName = name;
  }

  getPlayerInfo() {
    return {
      id: this.playerId,
      name: this.playerName,
    };
  }

  // Get all available lobbies
  async getLobbies() {
    try {
      const response = await fetch(`${this.baseUrl}/api/lobbies`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.log('Server not available, using mock data');
      // Fallback to mock data if server is not available
      return this.getMockLobbies();
    }
  }

  // Create a new lobby
  async createLobby(lobbyData: {
    name: string;
    maxPlayers: number;
    gameMode: string;
    isPasswordProtected: boolean;
    password?: string;
    wordDifficulty: string;
    maxRounds: number;
    timerEnabled: boolean;
    timerDuration?: number;
    hostName: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/lobbies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...lobbyData,
          hostId: this.playerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log('Server not available, creating mock lobby');
      // Fallback to mock data if server is not available
      return this.createMockLobby(lobbyData);
    }
  }

  // Join a lobby
  async joinLobby(lobbyId: string, password?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/lobbies/${lobbyId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: this.playerId,
          playerName: this.playerName,
          password,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log('Server not available, using mock join');
      return { success: true, lobby: this.getMockLobby() };
    }
  }

  // Leave a lobby
  async leaveLobby(lobbyId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/lobbies/${lobbyId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: this.playerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log('Server not available, using mock leave');
      return { success: true };
    }
  }

  // Start game (host only)
  async startGame(lobbyId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/lobbies/${lobbyId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostId: this.playerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log('Server not available, using mock start game');
      return { success: true, lobby: this.getMockLobby() };
    }
  }

  // Get lobby details
  async getLobby(lobbyId: string) {
    try {
      console.log(`Fetching lobby ${lobbyId} from server...`);
      const response = await fetch(`${this.baseUrl}/api/lobbies/${lobbyId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Received lobby data:`, JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Error fetching lobby:', error);
      console.log('Server not available, using mock lobby');
      return this.getMockLobby();
    }
  }

  // Mock data for development without server
  private getMockLobbies() {
    return [
      {
        id: '1',
        name: 'Test Lobby 1',
        players: 2,
        maxPlayers: 6,
        host: this.playerName || 'Host',
        gameMode: 'Standard',
        isPasswordProtected: false,
        status: 'waiting',
      },
      {
        id: '2',
        name: 'Private Game',
        players: 1,
        maxPlayers: 4,
        host: 'TestHost',
        gameMode: 'Hard Mode',
        isPasswordProtected: true,
        status: 'waiting',
      },
    ];
  }

  private createMockLobby(lobbyData: any) {
    return {
      success: true,
      lobby: {
        id: `mock-${Date.now()}`,
        name: lobbyData.name,
        players: 1,
        maxPlayers: lobbyData.maxPlayers,
        host: lobbyData.hostName,
        gameMode: lobbyData.gameMode,
        isPasswordProtected: lobbyData.isPasswordProtected,
        status: 'waiting',
        hostId: this.playerId,
        settings: {
          wordDifficulty: lobbyData.wordDifficulty,
          maxRounds: lobbyData.maxRounds,
          timerEnabled: lobbyData.timerEnabled,
          timerDuration: lobbyData.timerDuration,
        },
      },
    };
  }

  private getMockLobby() {
    return {
      id: 'mock-lobby',
      name: 'Test Lobby',
      players: [
        {
          id: this.playerId,
          name: this.playerName,
          isReady: false,
        },
      ],
      maxPlayers: 6,
      host: this.playerName,
      gameMode: 'Standard',
      isPasswordProtected: false,
      status: 'waiting',
      hostId: this.playerId,
      settings: {
        wordDifficulty: 'medium',
        maxRounds: 3,
        timerEnabled: false,
      },
    };
  }

  // WebSocket connection for real-time updates (simplified for now)
  connectToLobby(lobbyId: string, onUpdate: (data: any) => void) {
    // For now, we'll simulate updates
    console.log(`Connected to lobby ${lobbyId}`);
    
    // Simulate periodic updates
    const interval = setInterval(() => {
      onUpdate({
        type: 'LOBBY_UPDATE',
        data: this.getMockLobby(),
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      console.log(`Disconnected from lobby ${lobbyId}`);
    };
  }
}

export default OnlineService;
