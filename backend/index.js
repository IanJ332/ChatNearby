// backend/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Load language translations
const translations = {
  zh: {
    userJoined: username => `${username} 加入了聊天室`,
    userLeft: username => `${username} 离开了聊天室`,
    roomReset: '聊天室已重置，历史记录已保存'
  },
  en: {
    userJoined: username => `${username} joined the chat room`,
    userLeft: username => `${username} left the chat room`,
    roomReset: 'Chat room has been reset, history saved'
  }
};

// Function: Get local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let ipAddress = 'localhost';
  
  for (const ifaceName in interfaces) {
    const iface = interfaces[ifaceName];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        ipAddress = alias.address;
        return ipAddress;
      }
    }
  }
  
  return ipAddress;
}

// Create necessary directories
const createDirectories = () => {
  const dirs = ['logs', 'temp', 'avatars'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Store active users and room information
let rooms = {
  'main': {
    users: {}, // {socketId: {username, avatar, language}}
    messages: []
  }
};

// Banned IPs storage
const bannedIPs = new Map();

// Admin users storage
const adminUsers = new Set(['admin']); // Default admin username

// Middleware setup
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/avatars', express.static(path.join(__dirname, '../avatars')));
app.use('/images/avatars', express.static(path.join(__dirname, '../avatars'))); // For compatibility

// Middleware to check if IP is banned
const checkBanned = (socket, next) => {
  const ip = socket.handshake.address;
  
  if (bannedIPs.has(ip)) {
    const banInfo = bannedIPs.get(ip);
    
    // Check if ban has expired
    if (banInfo.until > Date.now()) {
      return next(new Error('BANNED'));
    } else {
      // Ban expired, remove from map
      bannedIPs.delete(ip);
    }
  }
  
  next();
};

// Apply banned IP middleware
io.use(checkBanned);

// Save chat logs to file
const saveRoomLogsToFile = (roomId) => {
  if (!rooms[roomId] || !rooms[roomId].messages.length) return;
  
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const logDir = path.join('logs', String(year), month);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, `${day}_${roomId}.md`);
  const logContent = `# Chat Log - Room: ${roomId} - ${year}-${month}-${day}\n\n` + 
    rooms[roomId].messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      if (msg.system) {
        return `**${time} - System**: ${msg.text}`;
      }
      return `**${time} - ${msg.username}**: ${msg.text}`;
    }).join('\n\n');
  
  fs.writeFileSync(logFile, logContent);
  console.log(`Chat logs saved to ${logFile}`);
};

// Check if username is taken
const isUsernameTaken = (roomId, username) => {
  if (!rooms[roomId]) return false;
  return Object.values(rooms[roomId].users).some(user => user.username === username);
};

// Check if user is admin
const isAdmin = (username) => {
  return adminUsers.has(username);
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id} from IP: ${socket.handshake.address}`);
  
  // Check if username is available
  socket.on('check username', (data, callback) => {
    const { roomId, username } = data;
    const room = roomId || 'main';
    
    // Validate username format (2-20 characters)
    const usernameRegex = /^[A-Za-z0-9\u4e00-\u9fa5_-]{2,20}$/;
    if (!usernameRegex.test(username)) {
      return callback({
        valid: false,
        message: socket.language === 'zh' 
          ? '用户名格式无效，请使用2-20个字符(字母、数字、中文、下划线或连字符)'
          : 'Invalid username format. Please use 2-20 characters (letters, numbers, Chinese characters, underscores or hyphens)'
      });
    }
    
    // Check if username is taken
    if (isUsernameTaken(room, username)) {
      return callback({
        valid: false,
        message: socket.language === 'zh'
          ? '用户名已被使用，请选择其他用户名'
          : 'Username is already taken, please choose another one'
      });
    }
    
    callback({ valid: true });
  });
  
  // Handle language change
  socket.on('language change', (data) => {
    const { language } = data;
    socket.language = language || 'zh';
    
    // If user is in a room, update their language preference
    if (socket.roomId && rooms[socket.roomId] && rooms[socket.roomId].users[socket.id]) {
      rooms[socket.roomId].users[socket.id].language = socket.language;
    }
  });
  
  // Join room
  socket.on('join room', (data, callback) => {
    const { roomId, username, avatar, language } = data;
    const userLanguage = language || 'zh';
    const room = roomId || 'main';
    
    // Set language for this socket
    socket.language = userLanguage;
    
    // Ensure room exists
    if (!rooms[room]) {
      rooms[room] = {
        users: {},
        messages: []
      };
    }
    
    // Check if username is taken (for new users)
    if (!socket.roomId && isUsernameTaken(room, username)) {
      return callback({
        success: false,
        message: userLanguage === 'zh'
          ? '用户名已被使用，请选择其他用户名'
          : 'Username is already taken, please choose another one'
      });
    }
    
    // If user is rejoining with a new socket, remove old socket entry
    if (socket.roomId) {
      Object.entries(rooms[room].users).forEach(([sid, user]) => {
        if (user.username === username && sid !== socket.id) {
          delete rooms[room].users[sid];
        }
      });
    }
    
    // Join room
    socket.join(room);
    socket.roomId = room;
    rooms[room].users[socket.id] = { username, avatar, language: userLanguage };
    
    // Send welcome message if it's a new user
    if (!socket.username) {
      socket.username = username;
      
      const joinMessage = {
        username: 'System',
        text: translations[userLanguage].userJoined(username),
        timestamp: Date.now(),
        system: true
      };
      
      rooms[room].messages.push(joinMessage);
      
      // Broadcast to others
      socket.to(room).emit('user joined', {
        username,
        avatar,
        message: joinMessage
      });
    }
    
    // Send current users and messages to the joining user
    callback({
      success: true,
      users: Object.values(rooms[room].users),
      messages: rooms[room].messages
    });
  });
  
  // Handle chat messages
  socket.on('chat message', (message) => {
    const room = socket.roomId || 'main';
    if (!rooms[room] || !rooms[room].users[socket.id]) return;
    
    const { username, avatar } = rooms[room].users[socket.id];
    const chatMessage = {
      username,
      avatar,
      text: message,
      timestamp: Date.now()
    };
    
    // Save message
    rooms[room].messages.push(chatMessage);
    
    // If messages exceed a certain limit, trim the oldest ones
    const MAX_MESSAGES = 200;
    if (rooms[room].messages.length > MAX_MESSAGES) {
      const excessMessages = rooms[room].messages.length - MAX_MESSAGES;
      rooms[room].messages = rooms[room].messages.slice(excessMessages);
    }
    
    // Broadcast to all in room
    io.to(room).emit('chat message', chatMessage);
  });
  
  // Handle user disconnection
  socket.on('disconnect', () => {
    const room = socket.roomId;
    if (!room || !rooms[room] || !rooms[room].users[socket.id]) return;
    
    const { username, language } = rooms[room].users[socket.id];
    const userLanguage = language || 'zh';
    
    console.log(`User disconnected: ${username}`);
    
    // Create leave message
    const leaveMessage = {
      username: 'System',
      text: translations[userLanguage].userLeft(username),
      timestamp: Date.now(),
      system: true
    };
    
    rooms[room].messages.push(leaveMessage);
    
    // Notify others
    socket.to(room).emit('user left', {
      username,
      message: leaveMessage
    });
    
    // Remove user from room
    delete rooms[room].users[socket.id];
  });
  
  // Handle room reset
  socket.on('reset room', (roomId) => {
    const room = roomId || 'main';
    if (!rooms[room]) return;
    
    const userLanguage = socket.language || 'zh';
    
    // Only admins can reset rooms (or first user as fallback)
    const isFirstUser = Object.keys(rooms[room].users).length <= 1;
    if (!isAdmin(socket.username) && !isFirstUser) {
      return;
    }
    
    // Save logs before reset
    saveRoomLogsToFile(room);
    
    // Reset messages but keep the users
    rooms[room].messages = [];
    
    // Send reset notification
    io.to(room).emit('room reset', {
      username: 'System',
      text: translations[userLanguage].roomReset,
      timestamp: Date.now(),
      system: true
    });
  });
  
  // Admin functionality - ban user
  socket.on('ban user', ({ username, duration }) => {
    if (!isAdmin(socket.username)) return;
    
    const room = socket.roomId || 'main';
    
    // Find user's socket ID
    let targetSocketId = null;
    let targetIP = null;
    
    Object.entries(rooms[room].users).forEach(([sid, user]) => {
      if (user.username === username) {
        targetSocketId = sid;
        // In a real app, you'd store the IP with the user
        targetIP = io.sockets.sockets.get(sid)?.handshake.address;
      }
    });
    
    if (targetSocketId && targetIP) {
      // Ban the IP
      bannedIPs.set(targetIP, {
        until: Date.now() + duration * 60 * 1000,
        reason: 'Banned by admin'
      });
      
      // Disconnect the user
      io.sockets.sockets.get(targetSocketId)?.disconnect(true);
    }
  });
});

// Cleanup - save logs on server shutdown
process.on('SIGINT', () => {
  console.log('Saving chat logs before exit...');
  Object.keys(rooms).forEach(roomId => {
    saveRoomLogsToFile(roomId);
  });
  process.exit();
});

// Get the local IP address
const localIpAddress = getLocalIpAddress();

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Local network users can access at: http://${localIpAddress}:${PORT}`);
});