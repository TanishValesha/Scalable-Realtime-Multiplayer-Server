# Scalable Realtime Multiplayer System

A cloud-native, **horizontally scalable real-time multiplayer WebSocket server** implementation built with Node.js, TypeScript, Redis Pub/Sub, and Redis Queues.
It supports room-based matchmaking, low-latency state synchronization, and dynamic scaling via Kubernetes’ Horizontal Pod Autoscaler (HPA).
Deployed on **AWS EKS** with an **AWS Load Balancer**, **Redis (for Pub/Sub and task queues)**, and **Docker**.

## Architecture Overview

![Architecture Diagram](/assets/architecture.png)

### Core Components

1. **WebSocket Service Layer**
   - Manages client connections
   - Provides real-time messaging across rooms
   - Handles matchmaking and state updates

2. **Redis Manager**
   - Guarantees event delivery for all connected clients
   - Single Redis connection pool (Singleton)
   - Handles Pub/Sub and Queues operations

3. **Matchmaking Service**
   - Handles queue operation to add players to the queue
   - Handles players matchmaking
   - Tracks player session and room allocation of matched players

4. **GameState Service**
   - Synchronizes game state between clients during a match
   - Broadcasts client game state to other clients in the same room
  
## Features
- Real-time, bidirectional multiplayer communication
- Room/Matchmaking support with fast state sync
- Horizontally scalable with HPA on Kubernetes
- Redis Pub/Sub for event distribution
- Redis Queues for matchmaking task
- Built with TypeScript for strong typing and maintainability
- Dockerized for easy CI/CD and portability
- Cloud-native deployment using Kubernetes

## Installation

1. Clone the repository
```bash
git clone https://github.com/TanishValesha/Scalable-Realtime-Multiplayer-System.git
cd Scalable-Realtime-Multiplayer-System
```

2. Install dependencies
```bash
npm install
```

3. Configure Redis
```bash
cd docker
docker-compose up -d
```

4. Start the server
```bash
npm start
```

## Project Structure

```
src/
├── manager/
│   ├── RedisManager.ts          # Singleton Redis connection
├── services/
│   ├── WebSocketService.ts      # Handles WebSocket connections
│   ├── MatchmakingService.ts    # Matchmaking and room logic
│   ├── RoomService.ts           # Room Creation service
│   └── GameStateService.ts      # Game state broadcasting
├── types/
│   └── index.ts                 # Shared TypeScript types
├── utils/
│   └── logger.ts                # Logging helper function
└── index.ts                     # Application entry point
```

## Usage

### Connect to WebSocket Server
```javascript
const ws = new WebSocket('ws://localhost:8080');
```

### Join Matchmaking Room
```javascript
ws.send(JSON.stringify({
  type: 'MATCH_START'
}));
```

### Join an Existing Room
```javascript
ws.send(JSON.stringify({
  type: 'JOIN',
  payload: { room: 'match-12345' }
}));
```

### Send a Player Action
```javascript
ws.send(JSON.stringify({
  type: 'PLAYER_ACTION',
  payload: {
    room: 'match-12345',
    action: { type: 'move', dx: 3, dy: -1 }
  }
}));
```

### Chat with Players in the Room
```javascript
ws.send(JSON.stringify({
  type: 'CHAT',
  payload: { room: 'match-12345', message: 'Hello team!' }
}));
```

### Send a Player Action
```javascript
ws.send(JSON.stringify({
  type: 'PLAYER_ACTION',
  payload: {
    room: 'match-12345',
    action: { type: 'move', dx: 3, dy: -1 }
  }
}));
```

## Message Types

| Type                               | Description                                            | Payload                                                                                    |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `MATCH_START`                      | Request to enter matchmaking queue                     | –                                                                                          |
| `MATCH_START` *(server → client)*  | Notifies players of a new match and provides room info | `{ room: string, players: string[] }`                                                      |
| `JOIN`                             | Join a specific room                                   | `{ room: string }`                                                                         |
| `LEAVE`                            | Leave a room                                           | `{ room: string }`                                                                         |
| `CHAT`                             | Send a chat message to everyone in the room            | `{ room: string, message: string }`                                                        |
| `PLAYER_ACTION`                    | Send a gameplay action (move / attack / heal)          | `{ room: string, action: { type: "move"/"attack"/"heal", dx?, dy?, targetId?, damage? } }` |
| `STATE_UPDATE` *(server → client)* | Broadcast with the current state of the room           | `{ players: PlayerState[] }`                                                               |
| `ECHO`                             | Debug echo test                                        | `{ any }`                                                                                  |

## Scaling

The application supports horizontal scaling by deploying multiple instances behind a load balancer. Using Redis Pub/Sub ensures that messages are broadcast and delivered reliably across all instances.

```bash
# Start multiple instances
PORT=8080 npm start
PORT=8081 npm start
PORT=8082 npm start
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building
```bash
npm run build
```
