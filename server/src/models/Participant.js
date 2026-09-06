export class Participant {
  constructor(socketId, userId, username, role = 'participant') {
    this.socketId = socketId;
    this.userId = userId;
    this.username = username || `User_${socketId.substring(0, 4)}`;
    this.role = role;
    this.joinedAt = Date.now();
  }

  canControlPlayback() {
    return this.role === 'host' || this.role === 'moderator';
  }

  canManageRoom() {
    return this.role === 'host';
  }

  toJSON() {
    return {
      socketId: this.socketId,
      userId: this.userId,
      username: this.username,
      role: this.role,
      joinedAt: this.joinedAt
    };
  }
}
