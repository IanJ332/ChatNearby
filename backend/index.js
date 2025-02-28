const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// 创建必要的目录
const createDirectories = () => {
  const dirs = ['logs', 'uploads/avatars', 'temp'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// 存储活跃用户和房间信息
let rooms = {
  'main': {
    users: {}, // 保存所有用户信息 {socketId: {username, avatar}}
    messages: [] // 保存房间的所有消息
  }
};

// 中间件设置
app.use(express.static('frontend')); // 静态文件
app.use(express.json()); // 解析JSON
app.use('/uploads', express.static('uploads')); // 服务上传的文件

// 保存聊天记录到日志
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
  
  const logFile = path.join(logDir, `${day}.md`);
  const logContent = `# Chat Log - Room: ${roomId} - ${year}-${month}-${day}\n\n` + 
    rooms[roomId].messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      return `**${time} - ${msg.username}**: ${msg.text}`;
    }).join('\n\n');
  
  fs.writeFileSync(logFile, logContent);
  console.log(`Chat logs saved to ${logFile}`);
};

// 检查用户名是否已存在
const isUsernameTaken = (roomId, username) => {
  if (!rooms[roomId]) return false;
  return Object.values(rooms[roomId].users).some(user => user.username === username);
};

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  
  // 检查用户名是否可用
  socket.on('check username', (data, callback) => {
    const { roomId, username } = data;
    const room = roomId || 'main';
    
    // 验证用户名格式(2-20个字符)
    const usernameRegex = /^[A-Za-z0-9\u4e00-\u9fa5_-]{2,20}$/;
    if (!usernameRegex.test(username)) {
      return callback({ valid: false, message: '用户名格式无效，请使用2-20个字符(字母、数字、中文、下划线或连字符)' });
    }
    
    // 检查用户名是否已被使用
    if (isUsernameTaken(room, username)) {
      return callback({ valid: false, message: '用户名已被使用，请选择其他用户名' });
    }
    
    callback({ valid: true });
  });
  
  // 用户加入房间
  socket.on('join room', (data, callback) => {
    const { roomId, username, avatar } = data;
    const room = roomId || 'main';
    
    // 确保房间存在
    if (!rooms[room]) {
      rooms[room] = {
        users: {},
        messages: []
      };
    }
    
    // 检查用户名是否已被使用
    if (isUsernameTaken(room, username)) {
      return callback({ success: false, message: '用户名已被使用，请选择其他用户名' });
    }
    
    // 将用户加入房间
    socket.join(room);
    socket.roomId = room; // 保存用户当前所在房间ID
    rooms[room].users[socket.id] = { username, avatar };
    
    // 发送欢迎消息
    const joinMessage = {
      username: 'System',
      text: `${username} 加入了聊天室`,
      timestamp: Date.now(),
      system: true
    };
    
    rooms[room].messages.push(joinMessage);
    
    // 向用户发送当前在线用户列表和历史消息
    callback({
      success: true,
      users: Object.values(rooms[room].users),
      messages: rooms[room].messages
    });
    
    // 通知其他用户有新用户加入
    socket.to(room).emit('user joined', {
      username,
      avatar,
      message: joinMessage
    });
  });
  
  // 处理用户发送的聊天消息
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
    
    // 保存消息到房间历史记录
    rooms[room].messages.push(chatMessage);
    
    // 广播消息给房间内所有用户
    io.to(room).emit('chat message', chatMessage);
  });
  
  // 处理用户断开连接
  socket.on('disconnect', () => {
    const room = socket.roomId;
    if (!room || !rooms[room] || !rooms[room].users[socket.id]) return;
    
    const { username } = rooms[room].users[socket.id];
    
    // 创建用户离开的系统消息
    const leaveMessage = {
      username: 'System',
      text: `${username} 离开了聊天室`,
      timestamp: Date.now(),
      system: true
    };
    
    rooms[room].messages.push(leaveMessage);
    
    // 通知其他用户
    socket.to(room).emit('user left', {
      username,
      message: leaveMessage
    });
    
    // 从房间用户列表中移除该用户
    delete rooms[room].users[socket.id];
    
    console.log(`User disconnected: ${username}`);
  });
  
  // 处理重置聊天室请求
  socket.on('reset room', (roomId) => {
    const room = roomId || 'main';
    if (!rooms[room]) return;
    
    // 保存聊天记录到日志
    saveRoomLogsToFile(room);
    
    // 重置房间消息
    rooms[room].messages = [];
    
    // 通知所有用户
    io.to(room).emit('room reset', {
      username: 'System',
      text: '聊天室已重置，历史记录已保存',
      timestamp: Date.now(),
      system: true
    });
  });
});

// 启动服务器
server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`局域网用户可以通过您的IP地址访问: http://YOUR_IP_ADDRESS:${PORT}`);
});