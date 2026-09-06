import { Room } from './Room.js';

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getOrCreateRoom(roomId, initialVideoId) {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Room(roomId, initialVideoId);
      this.rooms.set(roomId, room);
    }
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  removeRoom(roomId) {
    this.rooms.delete(roomId);
  }

  findRoomBySocketId(socketId) {
    for (const room of this.rooms.values()) {
      const participant = room.findBySocketId(socketId);
      if (participant) {
        return { room, participant };
      }
    }
    return { room: null, participant: null };
  }
}

export const roomManager = new RoomManager();
