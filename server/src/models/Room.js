import { Participant } from './Participant.js';

export class Room {
  constructor(roomId, initialVideoId = 'jfKfPfyJRdk') {
    this.roomId = roomId;
    this.participants = new Map();
    this.videoId = initialVideoId;
    this.playState = 'paused';
    this.currentTime = 0;
    this.updatedAt = Date.now();
    this.hostUserId = null;
  }

  addParticipant(participant) {
    if (this.participants.size === 0) {
      participant.role = 'host';
      this.hostUserId = participant.userId;
    } else {
      if (this.hostUserId === participant.userId) {
        participant.role = 'host';
      } else {
        participant.role = 'participant';
      }
    }

    this.participants.set(participant.socketId, participant);
    return participant;
  }

  removeParticipant(socketId) {
    const removedParticipant = this.participants.get(socketId);
    if (!removedParticipant) {
      return { removedParticipant: null, newHost: null };
    }

    this.participants.delete(socketId);
    let newHost = null;

    if (removedParticipant.role === 'host' && this.participants.size > 0) {
      newHost = this.getOldestParticipant();
      if (newHost) {
        newHost.role = 'host';
        this.hostUserId = newHost.userId;
      }
    }

    return { removedParticipant, newHost };
  }

  findBySocketId(socketId) {
    return this.participants.get(socketId) || null;
  }

  findByUserId(userId) {
    for (const participant of this.participants.values()) {
      if (participant.userId === userId) {
        return participant;
      }
    }
    return null;
  }

  getOldestParticipant() {
    let oldest = null;
    for (const p of this.participants.values()) {
      if (!oldest || p.joinedAt < oldest.joinedAt) {
        oldest = p;
      }
    }
    return oldest;
  }

  toParticipantList() {
    return Array.from(this.participants.values()).map(p => p.toJSON());
  }

  isEmpty() {
    return this.participants.size === 0;
  }

  updatePlayback({ playState, currentTime, videoId }) {
    const now = Date.now();

    if (this.playState === 'playing' && this.currentTime !== undefined) {
      const elapsed = (now - this.updatedAt) / 1000;
      this.currentTime += elapsed;
    }

    if (videoId !== undefined && videoId !== this.videoId) {
      this.videoId = videoId;
      this.currentTime = 0;
      this.playState = 'paused';
    } else {
      if (currentTime !== undefined) {
        this.currentTime = Number(currentTime);
      }
      if (playState !== undefined) {
        this.playState = playState;
      }
    }

    this.updatedAt = now;
  }

  getSyncState() {
    let currentPos = this.currentTime;
    if (this.playState === 'playing') {
      const elapsed = (Date.now() - this.updatedAt) / 1000;
      currentPos += elapsed;
    }
    return {
      videoId: this.videoId,
      playState: this.playState,
      currentTime: currentPos,
      updatedAt: this.updatedAt,
      participants: this.toParticipantList()
    };
  }

  assignRole(userId, newRole) {
    const participant = this.findByUserId(userId);
    if (!participant) return null;

    if (newRole === 'host') {
      return this.transferHost(userId);
    }

    participant.role = newRole;
    return participant;
  }

  transferHost(newHostUserId) {
    const targetParticipant = this.findByUserId(newHostUserId);
    if (!targetParticipant) return null;

    for (const p of this.participants.values()) {
      if (p.role === 'host') {
        p.role = 'moderator';
      }
    }

    targetParticipant.role = 'host';
    this.hostUserId = newHostUserId;
    return targetParticipant;
  }
}
