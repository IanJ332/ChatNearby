# **Time2Chat: Collaborative Real-Time Writing Platform**

## **Project Overview**
Time2Chat is a web-based, real-time collaborative writing platform where users can anonymously work together on a shared document, similar to Google Docs. Instead of a traditional chat room, Time2Chat provides a large virtual "canvas" or paper where all users can contribute in real time. Each user's updates are saved as text files on the server to provide a record of all changes. The platform offers anonymity to encourage open collaboration, with each user randomly assigned an avatar.

## **Key Features**
1. **Collaborative Canvas**: 
   - A large shared canvas where users can collaboratively write and edit content in real-time. This canvas is presented as a long virtual "paper" that users scroll through and interact with.
  
2. **Anonymity**: 
   - Users are assigned random avatars upon joining the platform. No personal information or usernames are required, fostering anonymous collaboration.

3. **Real-Time Text File Storage**: 
   - Each user’s updates are stored as `.txt` files in a `temp` folder on the server, ensuring that all edits are tracked and saved in real-time. Each update generates a new text file, stored with a timestamp for version control.

4. **Role Selection**:
   - **Holder**: The user who creates the room and hosts the collaborative canvas.
   - **Participant**: Users who join an existing room via a room number or by viewing available rooms on the local network.
   
5. **Room Creation & Entry**: 
   - Holders create a room with a randomly generated 9-digit number.
   - Participants can either view existing rooms or manually enter a room number to join. The room is automatically created on the server with its own `temp` folder for storing user edits.

## **Project Logic**
- **Server-Side Logic**:
  - A `temp` folder is created on the server for each new room. All updates made to the canvas by participants are saved as individual `.txt` files in that folder.
  - Each file is named with a timestamp to ensure that the history of changes can be preserved and tracked.
  
- **Client-Side Logic**:
  - The user interface provides a large editable text area. Any updates made by one user are broadcast to all participants in the room, ensuring real-time synchronization.
  - Each user’s edits are continuously sent to the server and saved as separate `.txt` files.

## **Technologies Used**
- **Frontend**: 
  - **HTML5, CSS3** for the user interface.
  - **JavaScript** for real-time interactions and WebSocket connections.
  
- **Backend**: 
  - **Node.js** with **Express** for handling requests and serving static files.
  - **Socket.IO** for real-time communication between the server and clients.

- **File System**:
  - **Node.js**’s **fs** (File System) module is used to create and manage the `temp` folders and save updates as `.txt` files.

## **Folder Structure**

```
time2chat/
│
├── backend/
│   ├── index.js                # Main backend logic (Node.js + Socket.IO)
│   └── package.json            # Dependencies and scripts
│
├── frontend/
│   ├── index.html              # Entry page for username and role selection
│   ├── canvas.html             # Collaborative canvas page
│   └── chat.js                 # Client-side WebSocket and real-time logic
│
├── public/
│   └── avatars/                # Folder containing user avatars
│
├── temp/                       # Dynamic folder for storing room-specific `.txt` updates
│   └── room_<room_number>/     # Each room has its own folder for storing updates
│
└── styles/
    └── style.css               # CSS for styling the platform
```

## **Setup and Environment**

### **Requirements**
- **Node.js** (version 12.x or later)
- **npm** (Node Package Manager)

### **Installation Instructions**
1. **Clone this repository**:
   ```bash
   git clone <repository-url>
   cd time2chat
   ```

2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Run the server**:
   ```bash
   npm start
   ```

4. **Access the platform**:
   - Open your browser and navigate to `http://localhost:3000`.
   - To allow others on the same WLAN to access the platform, use your computer’s local IP address, e.g., `http://192.168.0.10:3000`.

### **Usage Instructions**
1. **Create or Join a Room**:
   - Users first select whether to be a **Holder** (room creator) or **Participant** (room joiner).
   - As a Holder, a new room is created with a 9-digit number, and a folder is created under `/temp` for storing `.txt` files.
   - As a Participant, you can join existing rooms by entering the room number.

2. **Collaborate**:
   - Once inside the room, users are presented with a shared canvas.
   - Any edits made are broadcast to all users in real-time and stored on the server.

3. **Storage**:
   - All user changes are saved to the `temp/` folder in the backend. Each room has its own subfolder, where updates are stored as `.txt` files with timestamps for tracking.

## **Future Enhancements**
- **Version Control**: Adding the ability to roll back changes or merge `.txt` files for better file management.
- **UI Enhancements**: Improving the canvas interface for a smoother user experience.
- **Additional Features**: Supporting markdown or rich text editing, allowing users to add formatting to their contributions.