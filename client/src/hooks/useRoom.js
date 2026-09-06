import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export const useRoom = (roomId, username, userId) => {
  const { socket, isConnected } = useSocket();

  const [participants, setParticipants] = useState([]);
  const [myRole, setMyRole] = useState('participant');
  const [videoId, setVideoId] = useState('jfKfPfyJRdk');
  const [playState, setPlayState] = useState('paused');
  const [currentTime, setCurrentTime] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [isKicked, setIsKicked] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected || !roomId || !userId || !username) return;

    socket.emit('join_room', { roomId, username, userId });

    const handleSyncState = (data) => {
      if (data.videoId) setVideoId(data.videoId);
      if (data.playState) setPlayState(data.playState);
      if (typeof data.currentTime === 'number') setCurrentTime(data.currentTime);
      if (data.participants) {
        setParticipants(data.participants);
        const me = data.participants.find(p => p.userId === userId);
        if (me) setMyRole(me.role);
      }
    };

    const handleUserJoined = (data) => {
      if (data.participants) {
        setParticipants(data.participants);
        const me = data.participants.find(p => p.userId === userId);
        if (me) setMyRole(me.role);
      }
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}_${Math.random()}`,
          isSystem: true,
          text: `${data.username} joined the room`,
          timestamp: Date.now()
        }
      ]);
    };

    const handleUserLeft = (data) => {
      if (data.participants) {
        setParticipants(data.participants);
        const me = data.participants.find(p => p.userId === userId);
        if (me) setMyRole(me.role);
      }
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}_${Math.random()}`,
          isSystem: true,
          text: `${data.username} left the room`,
          timestamp: Date.now()
        }
      ]);
    };

    const handleRoleAssigned = (data) => {
      if (data.participants) {
        setParticipants(data.participants);
        const me = data.participants.find(p => p.userId === userId);
        if (me) setMyRole(me.role);
      }
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}_${Math.random()}`,
          isSystem: true,
          text: `${data.username} is now a ${data.role.toUpperCase()}`,
          timestamp: Date.now()
        }
      ]);
    };

    const handleParticipantRemoved = (data) => {
      if (data.participants) {
        setParticipants(data.participants);
        const me = data.participants.find(p => p.userId === userId);
        if (me) setMyRole(me.role);
      }
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}_${Math.random()}`,
          isSystem: true,
          text: `${data.username} was removed by the host`,
          timestamp: Date.now()
        }
      ]);
    };

    const handleKicked = () => {
      setIsKicked(true);
    };

    const handleChatMessage = (msg) => {
      setChatMessages(prev => [...prev, msg]);
    };

    const handleReaction = (reaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 2500);
    };

    socket.on('sync_state', handleSyncState);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('role_assigned', handleRoleAssigned);
    socket.on('participant_removed', handleParticipantRemoved);
    socket.on('kicked', handleKicked);
    socket.on('chat_message', handleChatMessage);
    socket.on('reaction', handleReaction);

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('sync_state', handleSyncState);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('role_assigned', handleRoleAssigned);
      socket.off('participant_removed', handleParticipantRemoved);
      socket.off('kicked', handleKicked);
      socket.off('chat_message', handleChatMessage);
      socket.off('reaction', handleReaction);
    };
  }, [socket, isConnected, roomId, username, userId]);

  const play = useCallback(() => {
    if (socket) socket.emit('play');
  }, [socket]);

  const pause = useCallback(() => {
    if (socket) socket.emit('pause');
  }, [socket]);

  const seek = useCallback((time) => {
    if (socket) socket.emit('seek', { time });
  }, [socket]);

  const changeVideo = useCallback((newVideoId) => {
    if (socket) socket.emit('change_video', { videoId: newVideoId });
  }, [socket]);

  const assignRole = useCallback((targetUserId, newRole) => {
    if (socket) socket.emit('assign_role', { userId: targetUserId, role: newRole });
  }, [socket]);

  const removeParticipant = useCallback((targetUserId) => {
    if (socket) socket.emit('remove_participant', { userId: targetUserId });
  }, [socket]);

  const transferHost = useCallback((targetUserId) => {
    if (socket) socket.emit('assign_role', { userId: targetUserId, role: 'host' });
  }, [socket]);

  const sendMessage = useCallback((text) => {
    if (socket) socket.emit('send_message', { text });
  }, [socket]);

  const sendReaction = useCallback((emoji) => {
    if (socket) socket.emit('send_reaction', { emoji });
  }, [socket]);

  return {
    participants,
    myRole,
    videoId,
    playState,
    currentTime,
    chatMessages,
    reactions,
    isKicked,
    actions: {
      play,
      pause,
      seek,
      changeVideo,
      assignRole,
      removeParticipant,
      transferHost,
      sendMessage,
      sendReaction
    }
  };
};
