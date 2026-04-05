const roomTimers = {}; // roomId -> { userA, userB, timerStart, connectedSeconds }

const webrtcSocket = (io, socket) => {

  socket.on('join_room', ({ roomId }) => {
    socket.join(`room_${roomId}`);

    // Room track karo
    if (!roomTimers[roomId]) {
      roomTimers[roomId] = {
        users: new Set(),
        timerRunning: false,
        timerStart: null,
        connectedSeconds: 0,
      };
    }

    roomTimers[roomId].users.add(socket.user.id);

    // Dono users aa gaye → timer start karo
    if (roomTimers[roomId].users.size >= 2 && !roomTimers[roomId].timerRunning) {
      roomTimers[roomId].timerRunning = true;
      roomTimers[roomId].timerStart = Date.now();

      // Dono ko batao timer start ho gaya
      io.to(`room_${roomId}`).emit('timer_started', {
        connectedSeconds: roomTimers[roomId].connectedSeconds,
      });

      console.log(`⏱️ Timer started for room ${roomId}`);
    }

    socket.to(`room_${roomId}`).emit('user_joined', { 
      userId: socket.user.id, 
      name: socket.user.name 
    });
  });

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(`room_${roomId}`).emit('offer', { offer, fromId: socket.user.id });
  });

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(`room_${roomId}`).emit('answer', { answer, fromId: socket.user.id });
  });

  socket.on('ice_candidate', ({ roomId, candidate }) => {
    socket.to(`room_${roomId}`).emit('ice_candidate', { candidate, fromId: socket.user.id });
  });

  socket.on('screen_share', ({ roomId, isSharing }) => {
    socket.to(`room_${roomId}`).emit('peer_screen_share', { 
      userId: socket.user.id, 
      isSharing 
    });
  });

  socket.on('leave_room', ({ roomId }) => {
    handleLeave(socket, io, roomId);
  });

  // Disconnect handle karo — agar browser band ho jaye
  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room.startsWith('room_')) {
        const roomId = room.replace('room_', '');
        handleLeave(socket, io, roomId);
      }
    }
  });

  // Partner ko notify karo session start ho gaya
  socket.on('session_started', ({ roomId, sessionId, partnerName }) => {
    socket.to(`room_${roomId}`).emit('session_started', {
      roomId,
      sessionId,
      partnerName,
    });
  });

  // Frontend se connected duration request
  socket.on('get_connected_duration', ({ roomId }) => {
    const room = roomTimers[roomId];
    if (!room) return socket.emit('connected_duration', { seconds: 0 });

    let total = room.connectedSeconds;
    if (room.timerRunning && room.timerStart) {
      total += Math.floor((Date.now() - room.timerStart) / 1000);
    }

    socket.emit('connected_duration', { seconds: total });
  });
};

// Helper — leave handle karo
const handleLeave = (socket, io, roomId) => {
  const room = roomTimers[roomId];

  if (room) {
    // Timer pause karo — ek user chala gaya
    if (room.timerRunning && room.timerStart) {
      room.connectedSeconds += Math.floor((Date.now() - room.timerStart) / 1000);
      room.timerRunning = false;
      room.timerStart = null;
      console.log(`⏸️ Timer paused for room ${roomId} — ${room.connectedSeconds}s so far`);
    }

    room.users.delete(socket.user.id);

    // Doosre user ko batao
    io.to(`room_${roomId}`).emit('partner_disconnected', { 
      userId: socket.user.id,
      connectedSeconds: room.connectedSeconds,
    });

    // Agar room khali ho gaya → cleanup
    if (room.users.size === 0) {
      delete roomTimers[roomId];
      console.log(`🗑️ Room ${roomId} cleaned up`);
    }
  }

  socket.leave(`room_${roomId}`);
  socket.to(`room_${roomId}`).emit('user_left', { userId: socket.user.id });
};

module.exports = webrtcSocket;