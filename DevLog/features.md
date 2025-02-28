### **功能 1: 实时消息撤回 (P1)**  
#### 功能描述
允许用户在发送消息后的一定时间内（如2分钟）撤回消息，撤回后消息对所有用户不可见。

#### 技术实现
1. **消息存储结构**  
   在消息对象中添加`isDeleted`字段：
   ```js
   {
     _id: "msg_123",
     content: "Hello",
     senderId: "user_abc",
     timestamp: 1620000000,
     isDeleted: false
   }
   ```

2. **撤回逻辑**  
   - 客户端发送撤回请求：
     ```js
     {
       action: "delete",
       messageId: "msg_123"
     }
     ```
   - 服务端校验：
     ```js
     if (message.senderId === currentUser.id && 
         Date.now() - message.timestamp < 120000) {
       message.isDeleted = true;
       broadcast({ type: "delete", messageId: "msg_123" });
     }
     ```

3. **前端处理**  
   - 收到撤回事件后，动态移除或标记消息为“已撤回”。

#### 优先级
- **P1**：提升用户体验，减少误发消息的影响。

---

### **功能 2: 消息回复与引用 (P1)**  
#### 功能描述
允许用户回复特定消息，并在聊天界面中显示引用关系。

#### 技术实现
1. **消息结构扩展**  
   ```js
   {
     _id: "msg_123",
     content: "Hello",
     senderId: "user_abc",
     timestamp: 1620000000,
     replyTo: "msg_456" // 引用的消息ID
   }
   ```

2. **前端交互**  
   - 点击消息后显示“回复”按钮
   - 输入框显示引用内容预览：
     ```
     > @UserA: 你好！
     回复内容...
     ```

3. **服务端广播**  
   - 在广播消息时，包含完整的引用链：
     ```js
     {
       type: "chat",
       content: "好的！",
       replyTo: {
         id: "msg_456",
         content: "你好！",
         sender: "UserA"
       }
     }
     ```

#### 优先级
- **P1**：提升聊天交互的连贯性。

---

### **功能 3: 文件传输支持 (P2)**  
#### 功能描述
允许用户在聊天中发送文件（如图片、文档），文件大小限制为10MB。

#### 技术实现
1. **文件存储方案**  
   - 使用本地文件系统存储：
     ```
     /uploads/
       ├── 2024/
       │   ├── 03/
       │   │   ├── file_abc123.jpg
       │   │   └── file_def456.pdf
     ```

2. **消息结构扩展**  
   ```js
   {
     _id: "msg_123",
     type: "file",
     file: {
       name: "example.jpg",
       url: "/uploads/2024/03/file_abc123.jpg",
       size: 1024000 // bytes
     }
   }
   ```

3. **前端实现**  
   - 文件上传组件：
     ```html
     <input type="file" @change="handleFileUpload" />
     ```
   - 上传进度显示：
     ```js
     axios.post('/upload', formData, {
       onUploadProgress: (progress) => {
         console.log(`上传进度: ${Math.round((progress.loaded / progress.total) * 100)}%`);
       }
     });
     ```

#### 优先级
- **P2**：扩展聊天功能，但需要额外存储和带宽资源。

---

### **功能 5: 聊天室分组 (P3)**  
#### 功能描述
允许用户创建或加入不同的聊天室，每个聊天室有独立的聊天记录和用户列表。

#### 技术实现
1. **聊天室数据结构**  
   ```js
   {
     _id: "room_123",
     name: "技术讨论",
     creator: "user_abc",
     users: ["user_abc", "user_def"],
     messages: []
   }
   ```

2. **房间管理API**  
   - 创建房间：
     ```js
     POST /rooms { name: "技术讨论" }
     ```
   - 加入房间：
     ```js
     POST /rooms/:id/join
     ```

3. **前端实现**  
   - 房间列表组件：
     ```html
     <div v-for="room in rooms" @click="joinRoom(room.id)">
       {{ room.name }} ({{ room.users.length }}人在线)
     </div>
     ```

#### 优先级
- **P3**：扩展性强，但增加系统复杂性。

---

### **功能 4: 聊天机器人集成 (P2)**  
#### 功能描述
集成一个简单的聊天机器人，支持常用命令（如`/help`、`/weather`）。

#### 技术实现
1. **命令解析**  
   ```js
   function handleCommand(message) {
     const [command, ...args] = message.split(' ');
     
     switch (command) {
       case '/help':
         return "可用命令: /help, /weather [城市]";
       case '/weather':
         return fetchWeather(args[0]);
       default:
         return "未知命令";
     }
   }
   ```

2. **机器人消息标识**  
   - 在消息中添加`isBot`字段：
     ```js
     {
       _id: "msg_123",
       content: "今天天气晴朗",
       senderId: "bot_weather",
       isBot: true
     }
     ```

3. **前端样式**  
   - 为机器人消息添加特殊样式：
     ```css
     .message-bot {
       background-color: #f0f0f0;
       border-left: 4px solid #007bff;
     }
     ```

#### 优先级
- **P2**：增加趣味性，但非核心功能。
