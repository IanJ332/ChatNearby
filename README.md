# 局域网聊天室应用安装和使用说明

## 环境要求
- Node.js (推荐 v14.x 或更高版本)
- npm (Node 包管理器)

## 安装步骤

1. **下载项目文件**
   将所有项目文件下载到您的计算机上，保持目录结构不变。

2. **安装依赖**
   ```bash
   cd backend
   npm install
   ```

3. **准备默认头像**
   在 `frontend/images/avatars/` 目录下放置6个默认头像图片，命名为 `avatar1.png` 到 `avatar6.png`。
   
   您可以使用任何头像图片，但确保它们是正方形的，并且文件名与代码中的一致。

4. **启动服务器**
   ```bash
   npm start
   ```
   
   如果要在开发模式下运行（文件更改时自动重启服务器）：
   ```bash
   npm run dev
   ```

5. **访问聊天室**
   - 在运行服务器的计算机上打开浏览器，访问 `http://localhost:3000`
   - 局域网内的其他用户可以通过您计算机的 IP 地址访问，例如 `http://192.168.0.123:3000`

## 查找您的局域网 IP 地址

### Windows
1. 按下 `Win + R`，输入 `cmd` 打开命令提示符
2. 输入 `ipconfig` 并按回车
3. 查找 "IPv4 地址" 字段，这就是您的局域网 IP

### macOS
1. 打开系统偏好设置 > 网络
2. 选择活动的网络连接（如 Wi-Fi 或以太网）
3. 您的 IP 地址将显示在右侧面板中

### Linux
1. 打开终端
2. 输入 `hostname -I` 或 `ip addr` 命令
3. 查找您的局域网 IP 地址

## 功能使用

1. **登录**
   - 输入您的用户名（2-20个字符）
   - 选择一个默认头像或上传自定义头像
   - 点击"进入聊天室"

2. **聊天**
   - 在文本框中输入消息
   - 按回车键或点击"发送"按钮发送消息
   - 消息会实时显示给所有在线用户

3. **重置聊天室**
   - 点击侧边栏底部的"重置聊天室"按钮
   - 当前的聊天记录将保存到日志文件中
   - 聊天记录将被清空

4. **查看聊天记录**
   - 聊天记录保存在服务器的 `logs/[年份]/[月份]/[日期].md` 文件中
   - 每次重置聊天室，当前聊天记录会自动保存

## 注意事项

1. 服务器必须保持运行，才能让用户进行聊天。
2. 用户只能手动删除日志文件，系统不会自动删除。
3. 所有用户的聊天内容没有限制，请确保在适当的环境中使用。
4. 用户名在聊天室中是唯一的，不能重复。
5. 头像图片大小限制为2MB，支持JPG和PNG格式。