// 检测用户的浏览器语言
function detectUserLanguage() {
    // 获取浏览器语言（例如 "en-US", "zh-CN"）
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // 提取语言代码部分
    
    // 如果支持该语言，使用它；否则默认为英文
    return translations[langCode] ? langCode : 'en';
  }
  
  // 初始化翻译系统
  function initTranslations() {
    console.log("初始化翻译系统...");
    
    // 检查localStorage中是否保存了语言选择
    let savedLanguage = localStorage.getItem('chat_language');
    
    // 如果没有保存的语言，则从浏览器检测
    if (!savedLanguage) {
      savedLanguage = detectUserLanguage();
      localStorage.setItem('chat_language', savedLanguage);
      console.log("检测到浏览器语言:", savedLanguage);
    }
    
    console.log("当前语言设置:", savedLanguage);
    
    // 应用保存/检测到的语言
    applyLanguage(savedLanguage);
    
    // 设置语言切换按钮
    document.querySelectorAll('.language-btn').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      
      // 在当前语言按钮上设置active状态
      if (lang === savedLanguage) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      
      // 添加点击处理程序
      btn.addEventListener('click', function() {
        console.log("切换语言到:", lang);
        applyLanguage(lang);
      });
    });
  }