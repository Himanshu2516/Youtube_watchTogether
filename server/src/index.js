import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerSocketHandlers } from './socket/socketHandler.js';
import { roomManager } from './models/RoomManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../../client/dist');

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 30000,
  pingInterval: 10000
});

registerSocketHandlers(io);

app.use(express.static(clientDistPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = roomManager.getRoom(roomId.toLowerCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found or inactive' });
  }
  res.json({
    roomId: room.roomId,
    participantCount: room.participants.size,
    videoId: room.videoId,
    playState: room.playState
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

const startServer = () => {
  httpServer.listen(PORT, () => {
    console.log(`Watch Party Backend running on port ${PORT}`);
  });
};

startServer();
