# Imposter Online Mode - Local Development Server

Dieser lokale Server ermöglicht es, den Online-Modus der Imposter-App zu testen, ohne einen externen Server zu benötigen.

## Setup

1. **Server-Abhängigkeiten installieren:**
   ```bash
   cd server
   npm install
   ```

2. **Server starten:**
   ```bash
   npm start
   ```
   
   Oder für Entwicklung mit Auto-Reload:
   ```bash
   npm run dev
   ```

3. **Server-Status prüfen:**
   - Öffne http://localhost:3001/health im Browser
   - Du solltest eine JSON-Antwort mit dem Server-Status sehen

## Funktionalität

Der Server stellt folgende Endpoints zur Verfügung:

- `GET /api/lobbies` - Alle verfügbaren Lobbies abrufen
- `POST /api/lobbies` - Neue Lobby erstellen
- `GET /api/lobbies/:id` - Lobby-Details abrufen
- `POST /api/lobbies/:id/join` - Einer Lobby beitreten
- `POST /api/lobbies/:id/leave` - Lobby verlassen
- `GET /health` - Server-Status prüfen

## Testing mit der App

1. **Server starten** (siehe oben)
2. **Expo App starten:**
   ```bash
   cd ..
   npx expo start
   ```
3. **In der App:**
   - Klicke auf "Online spielen"
   - Wähle "Join a Lobby" oder "Create a Lobby"
   - Gib einen Namen ein
   - Teste die Funktionalität

## Multi-Tab Testing

Um die Online-Funktionalität zu testen:

1. **Erste Instanz:** 
   - Erstelle eine Lobby ("Create a Lobby")
   - Warte in der Lobby

2. **Zweite Instanz:** 
   - Öffne die App in einem neuen Browser-Tab oder auf einem anderen Gerät
   - Wähle "Join a Lobby"
   - Die erstellte Lobby sollte in der Liste erscheinen
   - Trete der Lobby bei

## Hinweise

- Der Server läuft nur lokal und ist nicht für Production gedacht
- Alle Daten werden im Arbeitsspeicher gespeichert und gehen beim Server-Neustart verloren
- Für echte Online-Funktionalität wäre ein echter Server mit WebSocket-Unterstützung und Datenbank nötig
- Die App fällt automatisch auf Mock-Daten zurück, wenn der Server nicht erreichbar ist

## Troubleshooting

**Server startet nicht:**
- Prüfe, ob Port 3001 bereits verwendet wird
- Installiere die Abhängigkeiten mit `npm install`

**App kann nicht mit Server verbinden:**
- Stelle sicher, dass der Server läuft (http://localhost:3001/health)
- Prüfe die Netzwerkverbindung
- Bei Verwendung auf einem echten Gerät: Stelle sicher, dass Gerät und Server im gleichen Netzwerk sind und ersetze `localhost` durch die IP-Adresse des Computers
