# Local Network Chat Room / 局域网聊天室

[English](#local-network-chat-room) | [中文](#局域网聊天室)

## Local Network Chat Room

### Project Overview
The Local Network Chat Room is a web-based real-time communication platform that allows users on a local network to chat through their browsers. Users can set their own names and avatars, and all chat records are saved to log files when reset. The application supports both Chinese and English interfaces and is optimized for both mobile and desktop devices.

### Main Features
1. **Real-time Chat**:
   - Users can send and receive messages in real-time
   - Support for system messages (user join/leave notifications)
   - Display of online user list and count

2. **User Identity**:
   - Users can set their own names (2-20 characters)
   - Users can choose default avatars or upload custom ones
   - Username uniqueness check to avoid duplicate names

3. **Language Support**:
   - Supports switching between Chinese and English interfaces
   - User language preferences are saved

4. **Chat History**:
   - Reset chat room feature that saves chat history to log files
   - Logs organized by year/month/day

5. **Device Compatibility**:
   - Responsive design compatible with desktop and mobile devices
   - Optimized for touch screen devices

### Technology Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express, Socket.IO
- **File System**: Node.js fs module for log storage

### Installation Steps

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd local-chat-room
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Prepare Default Avatars**:
   Place default avatar images in the `frontend/images/avatars/` directory, named from `avatar1.png` to `avatar6.png`

4. **Start Server**:
   ```bash
   npm start
   ```

5. **Access Chat Room**:
   - Local access: http://localhost:3000
   - Other devices on local network: http://[Your-IP-Address]:3000

### Usage Instructions
1. Set username and select/upload avatar on the login page
2. Choose interface language (Chinese or English)
3. After entering the chat room, you can see the online user list and chat history
4. Enter messages in the bottom input box and send
5. Administrators can click the "Reset Chat Room" button to clear current chat history

### Directory Structure
```
local-chat-room/
├── backend/           # Backend code
│   ├── index.js       # Main server code
│   └── package.json   # Dependencies configuration
├── frontend/          # Frontend code
│   ├── index.html     # Login page
│   ├── chat.html      # Chat room page
│   ├── images/        # Image resources
│   │   └── avatars/   # Avatar images
│   └── styles/        # Style files
│       └── style.css  # Main stylesheet
├── logs/              # Chat history logs (auto-created)
├── uploads/           # User uploaded avatars (auto-created)
└── temp/              # Temporary files (auto-created)
```

### Version Information
- Version: 1.0.1
- Update Date: 2025-02-27

## Changes in v1.0.1

### Automatic IP Detection

The application now automatically detects your local IP address. When the server starts, it will display the actual URL that can be shared with friends on the same network, eliminating the need to manually replace "YOUR_IP_ADDRESS" with your actual IP.

Example output:
```
Server running at http://localhost:3000
LAN users can access via your IP address: http://192.168.1.5:3000
```

You can simply copy and paste this URL to share with friends.

### License
This project is dual-licensed, you may choose either of the following licenses:

- [MIT License](LICENSE-MIT)
- [Apache License 2.0](LICENSE-APACHE)

Using this software indicates your agreement with the terms of your chosen license.

---

<a name="局域网聊天室"></a>
## 局域网聊天室

### 项目概述
局域网聊天室是一个基于Web的实时通信平台，允许局域网内的用户通过浏览器进行文字聊天。用户可以设置自己的名称和头像，所有聊天记录会在重置后保存到日志文件中。应用支持中英文界面，并针对移动设备和桌面设备进行了优化。

### 主要功能
1. **实时聊天**：
   - 用户可以实时发送和接收消息
   - 支持系统消息（用户加入/离开通知）
   - 显示在线用户列表和数量

2. **用户标识**：
   - 用户可以设置自己的名称（2-20个字符）
   - 用户可以选择默认头像或上传自定义头像
   - 用户名查重功能，避免同名用户

3. **语言支持**：
   - 支持中英文界面切换
   - 用户语言偏好会被保存

4. **聊天记录**：
   - 重置聊天室功能，将聊天记录保存到日志文件
   - 日志按年/月/日组织存储

5. **设备兼容**：
   - 响应式设计，兼容桌面和移动设备
   - 针对触屏设备进行了优化

### 技术栈
- **前端**：HTML, CSS, JavaScript
- **后端**：Node.js, Express, Socket.IO
- **文件系统**：Node.js fs模块用于日志存储

### 安装步骤

1. **克隆仓库**：
   ```bash
   git clone <repository-url>
   cd local-chat-room
   ```

2. **安装依赖**：
   ```bash
   cd backend
   npm install
   ```

3. **准备默认头像**：
   在 `frontend/images/avatars/` 目录下放置默认头像图片，命名为 `avatar1.png` 到 `avatar6.png`

4. **启动服务器**：
   ```bash
   npm start
   ```

5. **访问聊天室**：
   - 本机访问：http://localhost:3000
   - 局域网内其他设备访问：http://[您的IP地址]:3000

### 使用说明
1. 在登录页面设置用户名和选择/上传头像
2. 选择界面语言（中文或英文）
3. 进入聊天室后可以看到在线用户列表和聊天记录
4. 在底部输入框中输入消息并发送
5. 管理员可以点击"重置聊天室"按钮清空当前聊天记录

### 目录结构
```
local-chat-room/
├── backend/           # 后端代码
│   ├── index.js       # 主服务器代码
│   └── package.json   # 依赖配置
├── frontend/          # 前端代码
│   ├── index.html     # 登录页面
│   ├── chat.html      # 聊天室页面
│   ├── images/        # 图片资源
│   │   └── avatars/   # 头像图片
│   └── styles/        # 样式文件
│       └── style.css  # 主样式表
├── logs/              # 聊天记录日志（自动创建）
├── uploads/           # 用户上传的头像（自动创建）
└── temp/              # 临时文件（自动创建）
```

### 版本信息
- 版本号：1.0.1
- 更新日期：2025-02-27

## v1.0.1 版本更新内容

### 自动IP检测

应用程序现在可以自动检测您的本地IP地址。当服务器启动时，它将显示可以与同一网络上的朋友共享的实际URL，无需手动将"YOUR_IP_ADDRESS"替换为您的实际IP。

输出示例：
```
服务器运行在 http://localhost:3000
局域网用户可以通过您的IP地址访问: http://192.168.1.5:3000
```

您可以直接复制粘贴此URL与朋友分享。

### 许可证
本项目采用双重许可模式，您可以选择使用以下任一许可证：

- [MIT 许可证](LICENSE-MIT)
- [Apache 许可证 2.0](LICENSE-APACHE)

选择使用本软件即表示您同意遵守所选许可证的条款。
