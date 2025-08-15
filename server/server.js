const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for lobbies
let lobbies = {};

// Helper function to create a new lobby
function createLobby(data) {
  const lobbyId = uuidv4();
  const lobby = {
    id: lobbyId,
    name: data.name,
    maxPlayers: data.maxPlayers,
    gameMode: data.gameMode,
    isPasswordProtected: data.isPasswordProtected,
    password: data.password,
    hostId: data.hostId,
    hostName: data.hostName,
    players: [
      {
        id: data.hostId,
        name: data.hostName,
        isReady: false,
      }
    ],
    status: 'waiting',
    settings: {
      wordDifficulty: data.wordDifficulty,
      maxRounds: data.maxRounds,
      timerEnabled: data.timerEnabled,
      timerDuration: data.timerDuration,
    },
    createdAt: new Date(),
  };
  
  lobbies[lobbyId] = lobby;
  return lobby;
}

// Helper function to get public lobby info (without password)
function getPublicLobbyInfo(lobby) {
  return {
    id: lobby.id,
    name: lobby.name,
    players: lobby.players.length,
    maxPlayers: lobby.maxPlayers,
    host: lobby.hostName,
    gameMode: lobby.gameMode,
    isPasswordProtected: lobby.isPasswordProtected,
    status: lobby.status,
  };
}

// Routes

// Get all available lobbies
app.get('/api/lobbies', (req, res) => {
  const publicLobbies = Object.values(lobbies)
    .filter(lobby => lobby.status === 'waiting')
    .map(getPublicLobbyInfo);
  
  console.log(`GET /api/lobbies - Returning ${publicLobbies.length} lobbies`);
  res.json(publicLobbies);
});

// Create a new lobby
app.post('/api/lobbies', (req, res) => {
  try {
    const lobby = createLobby(req.body);
    console.log(`POST /api/lobbies - Created lobby: ${lobby.name} (${lobby.id})`);
    
    res.json({
      success: true,
      lobby: {
        ...lobby,
        // Don't send password back
        password: undefined,
      },
    });
  } catch (error) {
    console.error('Error creating lobby:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lobby',
    });
  }
});

// Get specific lobby details
app.get('/api/lobbies/:lobbyId', (req, res) => {
  const { lobbyId } = req.params;
  const lobby = lobbies[lobbyId];
  
  if (!lobby) {
    return res.status(404).json({
      success: false,
      error: 'Lobby not found',
    });
  }
  
  console.log(`GET /api/lobbies/${lobbyId} - Returning lobby details`);
  res.json({
    ...lobby,
    // Don't send password back
    password: undefined,
  });
});

// Join a lobby
app.post('/api/lobbies/:lobbyId/join', (req, res) => {
  const { lobbyId } = req.params;
  const { playerId, playerName, password } = req.body;
  const lobby = lobbies[lobbyId];
  
  if (!lobby) {
    return res.status(404).json({
      success: false,
      error: 'Lobby not found',
    });
  }
  
  if (lobby.status !== 'waiting') {
    return res.status(400).json({
      success: false,
      error: 'Lobby is not accepting new players',
    });
  }
  
  if (lobby.players.length >= lobby.maxPlayers) {
    return res.status(400).json({
      success: false,
      error: 'Lobby is full',
    });
  }
  
  if (lobby.isPasswordProtected && lobby.password !== password) {
    return res.status(403).json({
      success: false,
      error: 'Invalid password',
    });
  }
  
  // Check if player is already in lobby
  const existingPlayer = lobby.players.find(p => p.id === playerId);
  if (existingPlayer) {
    console.log(`POST /api/lobbies/${lobbyId}/join - Player ${playerName} already in lobby`);
    return res.json({
      success: true,
      lobby: {
        ...lobby,
        password: undefined,
      },
    });
  }
  
  // Add player to lobby
  lobby.players.push({
    id: playerId,
    name: playerName,
    isReady: false,
  });
  
  console.log(`POST /api/lobbies/${lobbyId}/join - Player ${playerName} joined lobby`);
  res.json({
    success: true,
    lobby: {
      ...lobby,
      password: undefined,
    },
  });
});

// Leave a lobby
app.post('/api/lobbies/:lobbyId/leave', (req, res) => {
  const { lobbyId } = req.params;
  const { playerId } = req.body;
  const lobby = lobbies[lobbyId];
  
  if (!lobby) {
    return res.status(404).json({
      success: false,
      error: 'Lobby not found',
    });
  }
  
  // Remove player from lobby
  lobby.players = lobby.players.filter(p => p.id !== playerId);
  
  // If lobby is empty or host left, delete the lobby
  if (lobby.players.length === 0 || lobby.hostId === playerId) {
    delete lobbies[lobbyId];
    console.log(`POST /api/lobbies/${lobbyId}/leave - Lobby deleted (empty or host left)`);
  } else {
    console.log(`POST /api/lobbies/${lobbyId}/leave - Player left lobby`);
  }
  
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    lobbies: Object.keys(lobbies).length,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Imposter Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Lobbies endpoint: http://localhost:${PORT}/api/lobbies`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});
