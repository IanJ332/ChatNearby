// frontend/js/login.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("登录页面JS已加载");

    const socket = io();
    let selectedAvatar = 'avatar1.png';
    let customAvatar = null;
    
    // 确保默认语言是中文
    if (!localStorage.getItem('chat_language')) {
        localStorage.setItem('chat_language', 'zh');
        console.log("设置默认语言：中文");
    }
    
    // 初始化翻译系统
    if (window.ChatTranslation) {
        window.ChatTranslation.init();
        console.log("翻译系统已初始化");
    } else {
        console.warn("翻译系统未找到");
    }
    
    // 处理头像选择
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedAvatar = this.getAttribute('data-avatar');
            document.querySelector('#avatar-preview img').src = `/avatars/${selectedAvatar}`;
            customAvatar = null; // 重置自定义头像
        });
    });
    
    // 处理自定义头像上传
    document.getElementById('avatar-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const currentLang = localStorage.getItem('chat_language') || 'zh';
        
        // 检查文件大小（最大2MB）
        if (file.size > 2 * 1024 * 1024) {
            document.getElementById('error-message').textContent = 
                window.ChatTranslation ? window.ChatTranslation.get('file_too_large', currentLang) : 
                (currentLang === 'zh' ? "图片大小不能超过2MB" : "Image size cannot exceed 2MB");
            return;
        }
        
        // 检查文件类型
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            document.getElementById('error-message').textContent = 
                window.ChatTranslation ? window.ChatTranslation.get('invalid_format', currentLang) : 
                (currentLang === 'zh' ? "只支持JPG和PNG格式" : "Only JPG and PNG formats are supported");
            return;
        }
        
        // 预览图片
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('#avatar-preview img').src = e.target.result;
            customAvatar = e.target.result;
            document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
        };
        reader.readAsDataURL(file);
    });
    
    // 表单提交
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const errorMsgEl = document.getElementById('error-message');
        const currentLang = localStorage.getItem('chat_language') || 'zh';
        
        console.log("准备登录，当前语言:", currentLang);
        
        // 清除之前的错误
        errorMsgEl.textContent = '';
        
        // 客户端验证用户名格式
        if (!username || username.length < 2 || username.length > 20) {
            errorMsgEl.textContent = currentLang === 'zh' 
                ? '用户名应为2-20个字符'
                : 'Username should be 2-20 characters';
            return;
        }
        
        // 检查用户名是否可用
        socket.emit('check username', { roomId: 'main', username }, function(response) {
            if (!response.valid) {
                errorMsgEl.textContent = response.message;
                return;
            }
            
            // 用户名有效，加入聊天室
            const avatar = customAvatar || `/avatars/${selectedAvatar}`;
            
            console.log("发送加入请求，使用语言:", currentLang);
            
            socket.emit('join room', {
                roomId: 'main',
                username,
                avatar,
                language: currentLang
            }, function(response) {
                if (response.success) {
                    // 保存用户信息到localStorage
                    localStorage.setItem('chat_username', username);
                    localStorage.setItem('chat_avatar', avatar);
                    
                    console.log("登录成功，重定向到聊天室");
                    
                    // 重定向到聊天室页面
                    window.location.href = '/chat.html';
                } else {
                    errorMsgEl.textContent = response.message;
                }
            });
        });
    });
    
    // 添加语言切换处理
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            localStorage.setItem('chat_language', lang);
            console.log("语言已更改为:", lang);
            
            document.querySelectorAll('.language-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            if (window.ChatTranslation) {
                window.ChatTranslation.apply(lang);
            }
        });
    });
    
    // 设置正确的初始语言按钮状态
    const initialLang = localStorage.getItem('chat_language') || 'zh';
    console.log("设置初始语言按钮状态:", initialLang);
    document.querySelectorAll('.language-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === initialLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});