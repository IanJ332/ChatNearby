# **Time2Chat: Real-time Online Chat Room**

## **Project Overview**
Time2Chat is a web-based, real-time chat room application that allows users within the same WLAN (Wireless Local Area Network) to connect, create or join chat rooms, and communicate with each other. The application provides a dynamic and interactive chat experience where users can set a username, create chat rooms (as a room "Holder"), or join existing rooms (as a "Participant"). The chat room supports multiple users with randomly generated avatars and allows each user to send messages of up to 250 characters.

## **Core Features**
1. **Username Setup and Validation:**
   - Users must set a username when they first access the website. The username must meet the following criteria:
     - Length: 6-20 characters.
     - Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), digits (0-9), and specific special characters (`~` `!` `@` `#` `$` `%` `^` `&` `*` `()` `+` `=` `_` `-` `{}` `[]` `|` `:` `;` `'` `”` `?` `,` `.`).

2. **Role Selection:**
   - Users can either:
     - Create a room as the **Holder**: A room with a randomly generated 9-digit room number is created under the username’s name.
     - Join as a **Participant**: Users can view existing rooms on the WLAN or enter the 9-digit room number manually to join a specific room.

3. **Real-time Chat:**
   - Once in a room, users are assigned a random avatar.
   - The chat supports sending and receiving real-time messages with a 250-character limit per message.

4. **Avatars and Room Details:**
   - Each user receives a randomly generated avatar from a folder of pre-uploaded images.
   - The chat room interface displays avatars of all current participants.

## **Technologies Used**
- **Frontend**: 
  - HTML, CSS (for basic layout and design).
  - JavaScript for client-side interactivity.
  - **Socket.IO** for real-time communication with the backend.
  
- **Backend**: 
  - **Node.js** with **Express**: Serves static frontend files and handles server-side logic.
  - **Socket.IO**: Manages WebSocket connections to enable real-time chat functionality.
  
- **Other Tools**:
  - Random avatars stored in the `public/avatars` folder for user personalization.
  - Validation and error-handling for user inputs.

## **Project Setup and Environment**

### **Requirements:**
1. **Node.js** (version 12.x or later): The backend server is built with Node.js, which needs to be installed on your system.
2. **npm** (Node Package Manager): Use npm to install dependencies like Express and Socket.IO.

### **Installation Instructions:**
1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd time2chat
   ```

2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Run the server:
   ```bash
   npm start
   ```

   The server will run on **localhost:3000** by default.

### **Accessing the Chat Room:**
- Open your web browser and go to:
  ```bash
  http://<your-local-IP>:3000
  ```
  Replace `<your-local-IP>` with your computer's local IP address to allow users on the same WLAN to access the site.

### **Folder Structure**
- **backend/**: Contains the server-side logic and WebSocket communication.
  - `index.js`: The main server file.
  - `package.json`: Lists dependencies and scripts.
  
- **frontend/**: Contains the HTML pages and JavaScript logic for user interactions.
  - `index.html`: Username setup and role selection.
  - `chat.js`: The frontend logic for real-time communication using WebSockets.
  
- **public/avatars/**: Stores pre-generated avatars for users.
  
- **styles/**: Contains CSS files for styling the web pages.

## **How It Works**
1. **Username Setup**: When users visit the site, they must first set a username. This username is validated to ensure it meets the specified criteria.
2. **Role Selection**: After setting the username, users are given the choice to either create a new room (Holder) or join an existing room (Participant).
3. **Chat Functionality**: Once in a room, the users can chat in real-time. Each user is assigned a random avatar, and their messages are limited to 250 characters.
