// frontend/js/chat.js
document.addEventListener('DOMContentLoaded', function() {
    // Get user info from localStorage
    const username = localStorage.getItem('chat_username');
    const userAvatar = localStorage.getItem('chat_avatar');
    
    // If no user info, redirect to login
    if (!username || !userAvatar) {
        window.location.href = '/';
        return;
    }
    
    // Initialize the socket connection
    const socket = io();
    
    // Get DOM elements
    const messagesList = document.getElementById('chat-messages');
    const usersList = document.getElementById('users-list');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const onlineCountEl = document.getElementById('online-count');
    const resetButton = document.getElementById('reset-chat');
    
    // Initialize translations
    if (window.ChatTranslation) {
        window.ChatTranslation.init();
    }
    
    // Format time for messages
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Create a message element
    function createMessageElement(message, isSelf = false) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message');
        
        if (isSelf) {
            messageEl.classList.add('self');
        }
        
        if (message.system) {
            messageEl.classList.add('system');
            messageEl.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${message.text}</div>
                </div>
            `;
            
            // Add special classes for join/leave messages
            if (message.text.includes('加入') || message.text.includes('joined')) {
                messageEl.classList.add('join-message');
            } else if (message.text.includes('离开') || message.text.includes('left')) {
                messageEl.classList.add('leave-message');
            }
        } else {
            // Process avatar path
            let avatarPath = message.avatar;
            
            // If path contains old /images/avatars path, update to new path
            if (avatarPath && avatarPath.includes('/images/avatars/')) {
                avatarPath = avatarPath.replace('/images/avatars/', '/avatars/');
            }
            
            // Ensure path is valid, if not use default avatar
            if (!avatarPath || (!avatarPath.includes('/avatars/') && !avatarPath.startsWith('data:'))) {
                const avatarName = avatarPath ? avatarPath.split('/').pop() : 'avatar1.png';
                avatarPath = `/avatars/${avatarName}`;
            }
            
            messageEl.innerHTML = `
                <img class="message-avatar" src="${avatarPath}" alt="${message.username}">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-username">${message.username}</span>
                        <span class="message-time">${formatTime(message.timestamp)}</span>
                    </div>
                    <div class="message-text">${message.text}</div>
                </div>
            `;
        }
        
        return messageEl;
    }
    
    // Scroll to bottom of messages
    function scrollToBottom(smooth = true) {
        if (smooth) {
            messagesList.scrollTo({
                top: messagesList.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            messagesList.scrollTop = messagesList.scrollHeight;
        }
    }
    
    // Send a message
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('chat message', message);
            messageInput.value = '';
            messageInput.style.height = 'auto'; // Reset height
            messageInput.focus();
        }
    }
    
    // Update user list
    function updateUsersList(users) {
        usersList.innerHTML = '';
        
        users.forEach(user => {
            // Process avatar path
            let avatarPath = user.avatar;
            
            // If path contains old /images/avatars path, update to new path
            if (avatarPath && avatarPath.includes('/images/avatars/')) {
                avatarPath = avatarPath.replace('/images/avatars/', '/avatars/');
            }
            
            // Ensure path is valid, if not use default avatar
            if (!avatarPath || (!avatarPath.includes('/avatars/') && !avatarPath.startsWith('data:'))) {
                const avatarName = avatarPath ? avatarPath.split('/').pop() : 'avatar1.png';
                avatarPath = `/avatars/${avatarName}`;
            }
            
            const userEl = document.createElement('div');
            userEl.classList.add('user-item');
            userEl.innerHTML = `
                <img class="user-avatar" src="${avatarPath}" alt="${user.username}">
                <span>${user.username}</span>
            `;
            usersList.appendChild(userEl);
        });
        
        // Update online count
        const currentLang = localStorage.getItem('chat_language') || 'zh';
        onlineCountEl.textContent = `${window.ChatTranslation.get('online_count', currentLang)}${users.length}`;
    }
    
    // Fix avatar path if needed
    let correctedAvatar = userAvatar;
    
    // If path contains old /images/avatars path, update to new path
    if (correctedAvatar && correctedAvatar.includes('/images/avatars/')) {
        correctedAvatar = correctedAvatar.replace('/images/avatars/', '/avatars/');
        localStorage.setItem('chat_avatar', correctedAvatar);
    }
    
    // Ensure path is valid, if not use default avatar (but keep data URLs)
    if (!correctedAvatar || (!correctedAvatar.includes('/avatars/') && !correctedAvatar.startsWith('data:'))) {
        const avatarName = correctedAvatar ? correctedAvatar.split('/').pop() : 'avatar1.png';
        correctedAvatar = `/avatars/${avatarName}`;
        localStorage.setItem('chat_avatar', correctedAvatar);
    }
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key (without Shift)
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Reset chat button
    resetButton.addEventListener('click', function() {
        const currentLang = localStorage.getItem('chat_language') || 'zh';
        if (confirm(window.ChatTranslation.get('confirm_reset', currentLang))) {
            socket.emit('reset room', 'main');
        }
    });
    
    // Join the chat room
    socket.emit('join room', {
        roomId: 'main',
        username,
        avatar: correctedAvatar,
        language: localStorage.getItem('chat_language') || 'zh'
    }, function(response) {
        if (!response.success) {
            alert(response.message);
            localStorage.removeItem('chat_username');
            localStorage.removeItem('chat_avatar');
            window.location.href = '/';
            return;
        }
        
        // Display existing messages
        response.messages.forEach(msg => {
            const isSelf = msg.username === username;
            const messageEl = createMessageElement(msg, isSelf);
            messagesList.appendChild(messageEl);
        });
        
        // Scroll to latest messages
        scrollToBottom(false);
        
        // Update user list
        updateUsersList(response.users);
    });
    
    // Listen for new messages
    socket.on('chat message', function(message) {
        const isSelf = message.username === username;
        const messageEl = createMessageElement(message, isSelf);
        messagesList.appendChild(messageEl);
        
        // Auto-scroll if near bottom
        const isNearBottom = messagesList.scrollHeight - messagesList.scrollTop - messagesList.clientHeight < 100;
        if (isNearBottom) {
            scrollToBottom();
        }
    });
    
    // Listen for user joining
    socket.on('user joined', function(data) {
        // Add system message
        if (data.message) {
            const messageEl = createMessageElement(data.message);
            messagesList.appendChild(messageEl);
            scrollToBottom();
        }
        
        // Update user list
        socket.emit('join room', {
            roomId: 'main',
            username,
            avatar: correctedAvatar,
            language: localStorage.getItem('chat_language') || 'zh'
        }, function(response) {
            if (response.success) {
                updateUsersList(response.users);
            }
        });
    });
    
    // Listen for user leaving
    socket.on('user left', function(data) {
        // Add system message
        if (data.message) {
            const messageEl = createMessageElement(data.message);
            messagesList.appendChild(messageEl);
            scrollToBottom();
        }
        
        // Update user list
        socket.emit('join room', {
            roomId: 'main',
            username,
            avatar: correctedAvatar,
            language: localStorage.getItem('chat_language') || 'zh'
        }, function(response) {
            if (response.success) {
                updateUsersList(response.users);
            }
        });
    });
    
    // Listen for room reset
    socket.on('room reset', function(message) {
        // Clear messages
        messagesList.innerHTML = '';
        
        // Add reset message
        const messageEl = createMessageElement(message);
        messagesList.appendChild(messageEl);
        scrollToBottom();
    });
    
    // Handle mobile viewport adjustments
    function handleMobileViewport() {
        // Set custom viewport height variable
        const viewportHeight = window.innerHeight;
        document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
        
        // Adjust container height
        document.querySelector('.chat-container').style.height = 'calc(var(--vh, 1vh) * 100)';
        
        // Check if keyboard is likely open (on mobile)
        if (window.innerHeight < window.outerHeight * 0.75) {
            document.body.classList.add('keyboard-open');
        } else {
            document.body.classList.remove('keyboard-open');
        }
    }
    
    // Call on page load and whenever window resizes
    window.addEventListener('resize', handleMobileViewport);
    window.addEventListener('orientationchange', handleMobileViewport);
    handleMobileViewport();
    
    // Prevent zoom gestures on mobile
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    // Fix double-tap zoom on mobile
    let lastTapTime = 0;
    document.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        if (tapLength < 500 && tapLength > 0) {
            e.preventDefault();
        }
        lastTapTime = currentTime;
    });
    
    // Handle language button clicks
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            if (window.ChatTranslation) {
                window.ChatTranslation.apply(lang);
                
                // Update language on server
                socket.emit('language change', { language: lang });
            }
        });
    });
    
    // Apply dark mode based on system preference
    function checkDarkMode() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode-auto');
        } else {
            document.body.classList.remove('dark-mode-auto');
        }
    }
    
    // Apply dark mode on load
    checkDarkMode();
    
    // Listen for changes to color scheme preferences
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkDarkMode);
});