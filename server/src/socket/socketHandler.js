import { roomManager } from '../models/RoomManager.js';
import { Participant } from '../models/Participant.js';
import { MongoRoom } from '../models/MongoRoom.js';

export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {

    const sendError = (message) => {
      socket.emit('error', { message });
    };

    const getContext = () => {
      const roomId = socket.data.roomId;
      if (!roomId) {
        return roomManager.findRoomBySocketId(socket.id);
      }
      const room = roomManager.getRoom(roomId);
      const participant = room ? room.findBySocketId(socket.id) : null;
      return { room, participant };
    };

    socket.on('join_room', async ({ roomId, username, userId }) => {
      if (!roomId || !userId) {
        return sendError('roomId and userId are required to join a room.');
      }

      const cleanRoomId = String(roomId).trim().replace(/\D/g, '');
      if (!cleanRoomId) {
        return sendError('Invalid Room ID. Room ID must be numeric.');
      }

      socket.data.roomId = cleanRoomId;
      socket.data.userId = userId;

      socket.join(cleanRoomId);

      const room = roomManager.getOrCreateRoom(cleanRoomId);
      const newParticipant = new Participant(socket.id, userId, username);
      const participant = room.addParticipant(newParticipant);

      socket.emit('sync_state', room.getSyncState());

      io.to(cleanRoomId).emit('user_joined', {
        username: participant.username,
        userId: participant.userId,
        role: participant.role,
        participants: room.toParticipantList()
      });

      try {
        await MongoRoom.findOneAndUpdate(
          { roomId: cleanRoomId },
          {
            hostUserId: room.hostUserId,
            lastVideoId: room.videoId,
            participantCount: room.participants.size
          },
          { upsert: true, new: true }
        );
      } catch (err) {}
    });

    socket.on('leave_room', ({ roomId }) => {
      const targetRoomId = roomId || socket.data.roomId;
      if (!targetRoomId) return;

      const room = roomManager.getRoom(targetRoomId);
      if (!room) return;

      const { removedParticipant, newHost } = room.removeParticipant(socket.id);
      socket.leave(targetRoomId);
      socket.data.roomId = null;

      if (removedParticipant) {
        io.to(targetRoomId).emit('user_left', {
          username: removedParticipant.username,
          userId: removedParticipant.userId,
          participants: room.toParticipantList()
        });

        if (newHost) {
          io.to(targetRoomId).emit('role_assigned', {
            userId: newHost.userId,
            username: newHost.username,
            role: newHost.role,
            participants: room.toParticipantList()
          });
        }
      }

      if (room.isEmpty()) {
        roomManager.removeRoom(targetRoomId);
      }
    });

    socket.on('play', () => {
      const { room, participant } = getContext();
      if (!room || !participant) return sendError('Room or participant context missing.');

      if (!participant.canControlPlayback()) {
        return sendError('Permission denied: Only Host or Moderator can control playback.');
      }

      room.updatePlayback({ playState: 'playing' });
      io.to(room.roomId).emit('sync_state', room.getSyncState());
    });

    socket.on('pause', () => {
      const { room, participant } = getContext();
      if (!room || !participant) return sendError('Room or participant context missing.');

      if (!participant.canControlPlayback()) {
        return sendError('Permission denied: Only Host or Moderator can control playback.');
      }

      room.updatePlayback({ playState: 'paused' });
      io.to(room.roomId).emit('sync_state', room.getSyncState());
    });

    socket.on('seek', ({ time }) => {
      const { room, participant } = getContext();
      if (!room || !participant) return sendError('Room or participant context missing.');

      if (!participant.canControlPlayback()) {
        return sendError('Permission denied: Only Host or Moderator can seek.');
      }

      room.updatePlayback({ currentTime: time });
      io.to(room.roomId).emit('sync_state', room.getSyncState());
    });

    socket.on('change_video', async ({ videoId }) => {
      const { room, participant } = getContext();
      if (!room || !participant) return sendError('Room or participant context missing.');

      if (!videoId) return sendError('Video ID is required.');

      if (!participant.canControlPlayback()) {
        return sendError('Permission denied: Only Host or Moderator can change video.');
      }

      room.updatePlayback({ videoId, currentTime: 0, playState: 'playing' });
      io.to(room.roomId).emit('sync_state', room.getSyncState());

      try {
        await MongoRoom.updateOne({ roomId: room.roomId }, { lastVideoId: videoId });
      } catch (err) {}
    });

    socket.on('assign_role', ({ userId, role }) => {
      const { room, participant } = getContext();
      if (!room || !participant) return sendError('Room or participant context missing.');

      if (!participant.canManageRoom()) {
        return sendError('Permission denied: Only the Host can assign roles.');
      }

      const target = room.assignRole(userId, role);
      if (!target) return sendError('Target participant not found.');

      io.to(room.roomId).emit('role_assigned', {
        userId: target.userId,
        username: target.username,
        role: target.role,
        participants: room.toParticipantList()
      });
    });

    socket.on('remove_participant', ({ userId }) => {
      const { room, participant } = getContext();
      if (!room || !participant) return sendError('Room or participant context missing.');

      if (!participant.canManageRoom()) {
        return sendError('Permission denied: Only the Host can remove participants.');
      }

      const targetParticipant = room.findByUserId(userId);
      if (!targetParticipant) return sendError('Participant not found.');

      const targetSocket = io.sockets.sockets.get(targetParticipant.socketId);
      if (targetSocket) {
        targetSocket.emit('kicked', { message: 'You have been removed from the room by the host.' });
        targetSocket.leave(room.roomId);
        targetSocket.data.roomId = null;
      }

      room.removeParticipant(targetParticipant.socketId);

      io.to(room.roomId).emit('participant_removed', {
        userId: targetParticipant.userId,
        username: targetParticipant.username,
        participants: room.toParticipantList()
      });
    });

    socket.on('send_message', ({ text }) => {
      const { room, participant } = getContext();
      if (!room || !participant || !text || !text.trim()) return;

      const messageObj = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: participant.userId,
        username: participant.username,
        role: participant.role,
        text: text.trim(),
        timestamp: Date.now()
      };

      io.to(room.roomId).emit('chat_message', messageObj);
    });

    socket.on('send_reaction', ({ emoji }) => {
      const { room, participant } = getContext();
      if (!room || !participant) return;

      io.to(room.roomId).emit('reaction', {
        id: `react_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: participant.userId,
        username: participant.username,
        emoji
      });
    });

    socket.on('disconnect', () => {
      const { room, participant } = getContext();
      if (!room || !participant) return;

      const { removedParticipant, newHost } = room.removeParticipant(socket.id);

      if (removedParticipant) {
        io.to(room.roomId).emit('user_left', {
          username: removedParticipant.username,
          userId: removedParticipant.userId,
          participants: room.toParticipantList()
        });

        if (newHost) {
          io.to(room.roomId).emit('role_assigned', {
            userId: newHost.userId,
            username: newHost.username,
            role: newHost.role,
            participants: room.toParticipantList()
          });
        }
      }

      if (room.isEmpty()) {
        roomManager.removeRoom(room.roomId);
      }
    });
  });
};
