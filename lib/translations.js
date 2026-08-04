// lib/translations.js
export const translations = {
  zh: {
    // === 通用 / 导航 ===
    switchLang: "English",
    backToDashboard: "回到我的 Dashboard",
    dreamGallery: "🌌 大家的梦境展馆",
    loading: "加载中...",
    fetchError: "加载数据失败，请稍后再试。",
    
    // === Gallery 展馆页面 ===
    galleryDesc: "这里展示了来自所有用户的最新公开记录。",
    realSpecies: "现实物种",
    imaginarySpecies: "想象物种",
    moodLabel: "心情",
    unrecorded: "未记录",
    unknownLocation: "未知地点",
    unknownSpecies: "未知物种",
    unknownTime: "未知时间",
    postedBy: "由 {name} 发布",
    anonymous: "匿名用户",
    prevPage: "上一页",
    nextPage: "下一页",
    pageInfo: "第 {current} 页 / 共 {total} 页",
    emptyGallery: "还没有人公开分享记录呢，或者这一页没有数据。",
    
    // === Login 登录页面 ===
    loginTitle: "登录 DreamBird",
    signupTitle: "注册新账号",
    email: "邮箱",
    password: "密码",
    username: "用户名",
    processing: "处理中...",
    loginBtn: "登录",
    signupBtn: "注册并登录",
    hasAccount: "已有账号？",
    noAccount: "还没有账号？",
    goToLogin: "去登录",
    goToSignup: "去注册",
    
    // === 登录页欢迎辞 ===
    welcomeTitle: "🌿 欢迎来到 DreamBird！在这里你可以记录梦中见到的各种动植物。",
    welcomeGuide: "使用指南：",
    guide1: "1. 利用邮箱注册登录后，网站自动跳转到记录页面。",
    guide2: "2. 在“这是什么？”部分选择种类（6 选 1）。如果是“鸟类”，可在搜索栏用中文/英文/学名搜索；若梦见现实不存在的鸟类（如凤凰或紫色的母鸡），选择“想象物种”，自行命名并在备注中描述。",
    guide3: "3. 如果梦到的动植物属于其他分类（植物、哺乳动物、昆虫、水生等）：选择“现实”或“想象”，然后直接输入物种名（暂不支持搜索）。",
    guide4: "4. 填写梦境地点、做梦日期和心情（5 种可选），有更多想说的也可以在备注区写下来！",
    guide5: "5. 如果想要分享自己的梦境，勾选“公开这条记录”，大家就可以在“展馆”翻阅；如果不勾选则仅自己可见。最后点击“添加记录”就上传成功啦~",
    feedback: "这是观鸟人第一次尝试搭建网站，有什么反馈和建议欢迎大家提出！（小红书：鸭鸭子吃番茄 或 邮箱：t10191128@163.com）",
    blessing: "最后祝大家鸟运昌盛，博物运昌盛，生活愉快！",

    // === Dashboard 页面 ===
    dashTitle: "🐦 DreamBird Dashboard",
    goToGalleryBtn: "去大家的梦境展馆看看 →",
    welcomeUser: "欢迎回来，{name}！",
    addNewRecordTitle: "✍️ 添加新的梦境记录",
    categoryLabel: "这是什么生物？",
    
    // 生物类别选项
    catBird: "🐦 鸟类",
    catPlant: "🌿 植物",
    catInsect: "🐞 昆虫",
    catMammal: "🦊 哺乳动物",
    catFish: "🐟 鱼类/水生",
    catOther: "🌀 其他",

    // 类型选项
    typeLabel: "类型",
    typeReal: "现实物种",
    typeImaginary: "想象物种",

    // 物种输入与搜索
    birdSpeciesLabel: "鸟种名 (可添加多个)",
    birdSearchPlaceholder: "搜索并添加多种真实鸟种...",
    speciesNameLabel: "物种名称",
    placeholderPlant: "例如：银杏、玫瑰...",
    placeholderBirdImaginary: "给自己梦到的奇幻鸟种起个名吧！",
    placeholderDefaultSpecies: "请输入名称...",

    // 表单其他字段
    locationLabel: "地点",
    locationPlaceholder: "请输入梦境中的地点",
    dateLabel: "日期",
    moodSelectLabel: "心情",

    // 心情选项
    moodHappy: "开心",
    moodPeaceful: "平静",
    moodScary: "害怕",
    moodWeird: "奇怪",
    moodAnnoyed: "懊恼",
    moodOther: "其他",

    notesLabel: "备注",
    notesPlaceholder: "写下你梦境中的细节...",
    isPublicLabel: "公开这条记录？",
    submitRecordBtn: "添加记录",
    submittingBtn: "提交中...",

    // 我的记录列表
    myRecordsTitle: "📋 我的记录",
    noRecordsText: "暂无记录。",

    // 搜索提示词
    searchError: "❌ 搜索出错",
    searchFormatError: "❌ 数据格式错误",
    searchNotFound: "未找到相关鸟种",
    searchNetworkError: "❌ 网络错误"
  },
  
  en: {
    // === Common / Nav ===
    switchLang: "中文",
    backToDashboard: "Back to Dashboard",
    dreamGallery: "🌌 Public Dream Gallery",
    loading: "Loading...",
    fetchError: "Failed to load data. Please try again later.",
    
    // === Gallery Page ===
    galleryDesc: "Showcasing the latest public entries from dreamers everywhere.",
    realSpecies: "Real Species",
    imaginarySpecies: "Imaginary Species",
    moodLabel: "Mood",
    unrecorded: "Not recorded",
    unknownLocation: "Unknown Location",
    unknownSpecies: "Unknown Species",
    unknownTime: "Unknown Date",
    postedBy: "Posted by {name}",
    anonymous: "Anonymous",
    prevPage: "Previous",
    nextPage: "Next",
    pageInfo: "Page {current} of {total}",
    emptyGallery: "No public logs shared yet, or this page has no data.",
    
    // === Login Page ===
    loginTitle: "Login to DreamBird",
    signupTitle: "Create an Account",
    email: "Email",
    password: "Password",
    username: "Username",
    processing: "Processing...",
    loginBtn: "Login",
    signupBtn: "Sign up & Login",
    hasAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    goToLogin: "Log in",
    goToSignup: "Sign up",
    
    // === Login Page Welcome Section ===
    welcomeTitle: "🌿 Welcome to DreamBird! Here you can record the fauna and flora you encounter in your dreams.",
    welcomeGuide: "Quick guide:",
    guide1: "1. After signing up/logging in with your email, you will be redirected to the recording page.",
    guide2: "2. In “What is this?” section, select a category (1 of 6 options). If you dreamed of “Birds”, search for them by their Chinese, English, or scientific name. For non-existent birds (such as phoenix or purple hens), select \"Imaginary Species\", name it yourself, and describe it in the notes.",
    guide3: "3. If your dream animal/plant belongs in other sections (Plants, Mammals, Insects, Aquatics, etc.): Select “Real” or “Imaginary”, then directly type in the species name (search not currently supported).",
    guide4: "4. Fill in the dream location, date, and your mood (5 options). Feel free to share more in the notes section!",
    guide5: "5. If you want to share your dream, check \"Make this record public\". Everyone can browse others' dreams in the “Gallery” section. If not, your record will be kept private. Finally, click \"Add Record\" to upload.",
    feedback: "This is my first time building a website. Any feedback is welcome! (Rednote: 鸭鸭子吃番茄 or Email: t10191128@163.com)",
    blessing: "Wishing you great birding luck, fruitful nature observations, and a happy life!",

    // === Dashboard Page ===
    dashTitle: "🐦 DreamBird Dashboard",
    goToGalleryBtn: "Explore Public Gallery →",
    welcomeUser: "Welcome back, {name}!",
    addNewRecordTitle: "✍️ Add New Dream Record",
    categoryLabel: "What creature is this?",
    
    // Category Options
    catBird: "🐦 Birds",
    catPlant: "🌿 Plants",
    catInsect: "🐞 Insects",
    catMammal: "🦊 Mammals",
    catFish: "🐟 Fish / Aquatics",
    catOther: "🌀 Other",

    // Species Type Options
    typeLabel: "Type",
    typeReal: "Real Species",
    typeImaginary: "Imaginary Species",

    // Species input & search
    birdSpeciesLabel: "Bird Species (Multiple allowed)",
    birdSearchPlaceholder: "Search & add real bird species...",
    speciesNameLabel: "Species Name",
    placeholderPlant: "e.g., Ginkgo, Rose...",
    placeholderBirdImaginary: "Name your imaginary bird!",
    placeholderDefaultSpecies: "Enter species name...",

    // Form Fields
    locationLabel: "Location",
    locationPlaceholder: "Where did this happen in your dream?",
    dateLabel: "Date",
    moodSelectLabel: "Mood",

    // Mood Options
    moodHappy: "Happy",
    moodPeaceful: "Peaceful",
    moodScary: "Scary",
    moodWeird: "Weird",
    moodAnnoyed: "Annoyed",
    moodOther: "Other",

    notesLabel: "Notes",
    notesPlaceholder: "Write down the details of your dream...",
    isPublicLabel: "Make this record public?",
    submitRecordBtn: "Add Record",
    submittingBtn: "Submitting...",

    // My Records List
    myRecordsTitle: "📋 My Logs",
    noRecordsText: "No records yet.",

    // Search Messages
    searchError: "❌ Search Error",
    searchFormatError: "❌ Invalid Data Format",
    searchNotFound: "No matching species found",
    searchNetworkError: "❌ Network Error"
  }
};