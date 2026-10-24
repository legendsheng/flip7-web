/**
 * Flip 7 - Internationalization (i18n) Module
 * English & 简体中文 (Simplified Chinese)
 */

const I18N = {
  en: {
    // Header
    langBtn: "🌐 中文",
    soundTitle: "Toggle Sound",
    rulesBtn: "📖 Rules",
    roomListBtn: "🏛️ Rooms",
    themeBtn: "🎨 Themes",
    tagline: "The Ultimate Push-Your-Luck Card Game",

    // Room List Modal
    browseRoomsBtn: "🏛️ View All Rooms & Status",
    roomListModalTitle: "🏛️ Active Online Rooms",
    roomListModalDesc: "View live status of all active rooms. Click to join a waiting lobby or reconnect to an ongoing match:",
    refreshRoomsBtn: "🔄 Refresh",
    noActiveRooms: "No active rooms right now. Create a new room to start playing!",
    roomStateLobby: "🟢 Waiting in Lobby",
    roomStatePlaying: "🔥 Playing",
    roomStateRecap: "📊 Round Recap",
    roomStateGameover: "🏆 Game Over",
    joinThisRoomBtn: "➡️ Join Room",
    reconnectThisRoomBtn: "🔌 Reconnect",
    inProgressLockedBtn: "🔒 In Progress",
    roomHostLabel: "Host:",
    roomHumansLabel: "Players:",
    roomBotsLabel: "Bots:",

    // Theme Picker
    themeModalTitle: "Choose Table Theme",
    themeModalDesc: "Customize your gaming visual atmosphere:",
    themeCasino: "🎰 Classic Casino",
    themeCasinoDesc: "Emerald green felt, luxury brass rail, and gold accents",
    themeCyberpunk: "⚡ Cyberpunk Neon",
    themeCyberpunkDesc: "High-tech synthwave, electric cyan & hot pink neon",
    themeArcade: "🕹️ Retro Arcade",
    themeArcadeDesc: "Pixelated 80s arcade vibes and vibrant gaming colors",
    themeCafe: "☕ Cozy Cafe & Wood",
    themeCafeDesc: "Warm mahogany wood, artisan coffee tones, and cozy paper cards",
    themeCelestial: "🌌 Midnight Celestial",
    themeCelestialDesc: "Deep cosmic nebula, starlight glow, and ethereal mystery",

    // Home Screen
    welcomeTitle: "Welcome to Flip 7!",
    welcomeDesc: "Flip cards one by one without drawing a duplicate number. Bank points before you bust, or risk it all to flip <strong>7 unique numbers</strong> for the ultimate jackpot!",
    nicknameLabel: "Your Nickname",
    randomProfileBtn: "🎲 Random",
    randomProfileTitle: "Randomize Name & Avatar",
    changeAvatar: "Change Avatar",
    createGameTitle: "Create Online Room",
    createGameDesc: "Host a table for your friends or play with smart AI bots",
    targetScoreLabel: "Target Score:",
    showOddsLabel: "Show Bust Odds:",
    showOddsOn: "Enabled (Live odds HUD)",
    showOddsOff: "Hidden (Memory & intuition)",
    oddsEnabled: "Enabled",
    oddsHidden: "Hidden",
    hitBtnSublabelNoOdds: "Flip a card",
    youTag: "YOU",
    bustedCardTooltip: "Bust card:",
    bustedCardTag: "Bust card:",
    ptsQuick: "100 Points (Quick)",
    ptsStandard: "150 Points (Standard)",
    ptsOfficial: "200 Points (Official Rules)",
    btnCreateRoom: "✨ Create Room",
    joinGameTitle: "Join Online Room",
    joinGameDesc: "Enter a 4-letter room code to hop right into a table",
    codePlaceholder: "CODE",
    btnJoinRoom: "Join Table",
    btnSoloPlay: "🤖 Instant Solo Play (You vs 3 Bots)",
    btnLocalPlay: "👥 Local Multiplayer (Pass & Play on 1 Device)",

    // Local Setup Screen
    localSetupTitle: "Local Multiplayer (Pass & Play)",
    localSetupDesc: "Play together on the same screen! Pass the device or take turns around the table.",
    localPlayersCount: "Player Count:",
    addPlayerBtn: "+ Add Player",
    addBotBtn: "+ Add AI Bot",
    startLocalBtn: "🚀 Start Local Game",
    backBtn: "⬅️ Back",
    playerLabel: "Player",
    botLabel: "Bot",
    humanLabel: "Human",
    removeLabel: "Remove",

    // Lobby Screen
    roomCodeLabel: "ROOM CODE:",
    copyCodeBtn: "📋 Code",
    copyLinkBtn: "🔗 Link",
    copied: "✅ Copied!",
    goalLabel: "Goal:",
    playersAtTable: "Players at the Table",
    tableHost: "👑 Table Host",
    addAiBotBtn: "🤖 + Add AI Bot",
    startMatchBtn: "🚀 Start Match",
    waitingHost: "Waiting for host to start the game...",
    leaveTableBtn: "Leave Table",

    // Table / Game Arena
    roundLabel: "Round",
    targetLabel: "Target:",
    currentTurnPrefix: "Current Turn: ",
    yourTurn: "🌟 YOUR TURN! 🌟",
    drawDeckLabel: "DRAW DECK",
    discardLabel: "DISCARD",
    awaitingFlip: "Awaiting Flip",
    bustRiskLabel: "Bust Risk:",
    duplicatesLabel: "Duplicates in Deck:",
    cardsLeftLabel: "Cards Left:",
    handScoreLabel: "Hand Score",
    totalScoreLabel: "Total Score",
    numbersLabel: "Numbers",
    modifiersShieldLabel: "Modifiers & Extra Life:",
    noNumbersYet: "No numbers flipped yet",
    none: "None",
    extraLifeTitle: "Extra Life (+1 Life)",
    btnHit: "HIT (Draw Card)",
    hitSublabelSafe: "Flip a new card",
    btnStay: "STAY (Bank Points)",
    staySublabel: "Lock in hand",
    waitingTurn: "Waiting for turn",
    locked: "Locked",
    feedTab: "📜 Feed",
    scoresTab: "🏆 Scores",
    chatTab: "💬 Chat",
    exportLogBtn: "Export Log",
    exportLogSuccess: "✅ Match log exported and downloaded!",
    liveLogTitle: "Live Feed",
    dealingFlipThree: "⚡ Flip Three in progress...",
    waitingFlipThree: "Waiting for flips...",
    exportLogTitle: "Export Full Match Log",
    exportLogPrompt: "No match logs available yet",
    saySomething: "Say something...",
    sendBtn: "Send",
    passToPrompt: "👉 Pass device to ",

    // Status Tags
    statusActive: "Active",
    statusStayed: "Stayed",
    statusFrozen: "Frozen",
    statusBusted: "Busted",
    statusFlip7: "Flip 7!",
    autoPlayTag: "🤖 Auto",
    offlineTag: "🔌 Offline",
    enableAutoPlayBtn: "🤖 Auto-Play",
    disableAutoPlayBtn: "👤 Cancel Auto",
    autoPlayBannerText: "🤖 AI Auto-Play is active (triggered by 60s timeout or manual toggle)",
    resumeManualBtn: "👤 Resume Manual Control",
    reconnectingText: "📡 Connection lost. Reconnecting to table...",
    reconnectNowBtn: "Reconnect Now",
    reconnectedToast: "✅ Reconnected to the table!",
    turnTimerTitle: "60s turn timer (auto-AI after timeout)",

    // Modals
    selectTargetTitle: "Select Target Player",
    targetFreezeDesc: "Choose an active player to freeze and lock their current hand:",
    targetFlipThreeDesc: "Choose a player to force them to flip 3 cards consecutively:",
    giftSecondChanceDesc: "You already have an Extra Life! Gift this Heart to an active player:",
    roundCompleteTitle: "Complete!",
    thPlayer: "Player",
    thStatus: "Status",
    thCards: "Cards",
    thRoundPts: "Round Pts",
    thTotalPts: "Total Pts",
    btnNextRound: "Next Round ➡️",
    waitingNextRound: "Waiting for host to start next round...",
    victoryTitle: "VICTORY!",
    winningScore: "Winning Score:",
    points: "Points!",
    btnPlayAgain: "🔄 Play Again",
    btnReturnLobby: "🏠 Exit to Lobby",

    // Rules
    rulesTitle: "Flip 7 - Official Rules Guide",
    ruleObjTitle: "🎯 The Objective",
    ruleObjText: "Score <strong>200 points</strong> (or the room target) by flipping cards one by one without busting! First player to reach the goal wins.",
    ruleTurnTitle: "🃏 How a Turn Works",
    ruleTurnHit: "HIT: Flip a card from the deck. If it's a number card you do not have, add it to your hand! But if you draw a duplicate number, you BUST and score 0 points this round!",
    ruleTurnStay: "STAY: Bank your current score and sit out the rest of the round. Your points are safe!",
    ruleFlip7Title: "🌟 FLIP 7!",
    ruleFlip7Text: "If you successfully flip 7 unique number cards without busting, you achieve FLIP 7! You instantly earn a +15 point bonus and the round concludes immediately for everyone!",
    ruleDeckTitle: "📦 What's in the Deck? (94 Cards)",
    ruleNumbersTitle: "Number Cards (0–12, 79 Cards)",
    ruleNumbersDesc: "The card value equals how many copies are in the deck! (One 0, One 1, Two 2s ... Twelve 12s). Higher numbers give more points, but have a much higher bust probability!",
    ruleModifiersTitle: "Modifier Cards (6 Cards)",
    ruleModifiersDesc: "+2, +4, +6, +8, +10 flat bonus cards and one ×2 multiplier. The ×2 doubles the sum of your numbers and flat bonuses! Flip 7 bonus is added after.",
    ruleActionsTitle: "Special Action Cards (9 Cards)",
    ruleSecondChanceDesc: "❤️ Second Chance (3 cards): Extra Life! Absorbs your next duplicate card so you don't bust.",
    ruleFreezeDesc: "❄️ Freeze (3 cards): Force any active player (including an opponent!) to Stay immediately.",
    ruleFlipThreeDesc: "⚡ Flip Three (3 cards): Force chosen player to immediately flip 3 cards consecutively!",
    ruleScoringTitle: "🧮 Round Scoring",
    ruleScoringDesc: "Round Score = ((Sum of Numbers + Flat Bonuses) × (2 if ×2)) + (15 if Flip 7). Busted players score 0 points.",

    // Notifications / Logs
    logRoundBegins: (round, dealer) => `🔔 --- Round ${round} Begins! Dealer: ${dealer} ---`,
    logRoundEnd: (round, reason) => `🏁 Round ${round} Finished! ${reason ? `(${reason})` : ''}`,
    logHitSafe: (name, val, count) => `🃏 ${name} hit and flipped ${val}! (Total cards: ${count})`,
    logBusted: (name, val) => `💥 ${name} drew duplicate ${val} and BUSTED! (0 pts this round)`,
    logShieldSaved: (name, val) => `❤️ ${name} drew duplicate ${val}, but Extra Life HEART saved them!`,
    logFlip7: (name) => `🌟🎉 FLIP 7! ${name} flipped 7 unique numbers! +15 BONUS POINTS!`,
    logModifier: (name, cardName) => `✨ ${name} flipped modifier card ${cardName}!`,
    logShieldGained: (name) => `❤️ ${name} gained an Extra Life heart (+1 Life)!`,
    logFroze: (source, target, pts) => `❄️ ${source} FROZE ${target}! ${target}'s hand is locked at ${pts} points!`,
    logGiftedShield: (source, target) => `🎁 ${source} gifted an Extra Life heart to ${target}!`,
    logFlipThreeUsed: (source, target) => `⚡ ${source} targeted ${target} with FLIP THREE! Dealing 3 cards...`,
    logStayed: (name, pts) => `🛑 ${name} stayed and banked ${pts} points!`,
    logGameOver: (name, score) => `🏆 GAME OVER! ${name} won the game with ${score} points!`
  },

  zh: {
    // Header
    langBtn: "🌐 English",
    soundTitle: "声音开关",
    rulesBtn: "📖 规则",
    roomListBtn: "🏛️ 房间列表",
    themeBtn: "🎨 主题风格",
    tagline: "风靡全球的极限运气博弈卡牌游戏",

    // Room List Modal
    browseRoomsBtn: "🏛️ 查看所有房间与状态",
    roomListModalTitle: "🏛️ 在线房间大厅",
    roomListModalDesc: "实时查看所有正在等待或对局中的房间状态，点击即可一键加入或断线重连：",
    refreshRoomsBtn: "🔄 刷新",
    noActiveRooms: "当前暂无活跃房间，快点击「创建房间」开启牌局吧！",
    roomStateLobby: "🟢 等待开局中",
    roomStatePlaying: "🔥 对局进行中",
    roomStateRecap: "📊 本轮结算中",
    roomStateGameover: "🏆 比赛已结束",
    joinThisRoomBtn: "➡️ 加入房间",
    reconnectThisRoomBtn: "🔌 断线重连",
    inProgressLockedBtn: "🔒 对局进行中",
    roomHostLabel: "房主:",
    roomHumansLabel: "真人:",
    roomBotsLabel: "AI:",

    // Theme Picker
    themeModalTitle: "选择牌桌主题风格",
    themeModalDesc: "随心切换个性化视觉氛围与牌桌质感：",
    themeCasino: "🎰 经典绿呢赌场",
    themeCasinoDesc: "翡翠绿呢绒、黄铜包边与奢华金色高光",
    themeCyberpunk: "⚡ 赛博朋克霓虹",
    themeCyberpunkDesc: "未来科技网格、电光青与荧光粉红光晕",
    themeArcade: "🕹️ 8-Bit 复古街机",
    themeArcadeDesc: "80年代复古游戏厅、街机像素与炫彩跳脱感",
    themeCafe: "☕ 温暖原木咖啡",
    themeCafeDesc: "沉稳红木桌、羊皮纸卡牌与温馨咖啡馆质感",
    themeCelestial: "🌌 深邃星空秘境",
    themeCelestialDesc: "星系星云紫、月光铂金与神秘塔罗星芒",

    // Home Screen
    welcomeTitle: "欢迎来到 Flip 7！",
    welcomeDesc: "逐张翻牌，切忌翻出相同数字！在爆牌前锁定收益，或放手一搏翻出<strong>7张不同数字</strong>触发超级翻倍大奖！",
    nicknameLabel: "你的昵称",
    randomProfileBtn: "🎲 随机",
    randomProfileTitle: "随机生成昵称与头像",
    changeAvatar: "更换头像",
    createGameTitle: "创建在线对战",
    createGameDesc: "开设专属牌桌与好友联机，或加入智能AI机器人",
    targetScoreLabel: "目标分数:",
    showOddsLabel: "爆牌概率提示:",
    showOddsOn: "显示 (实时概率HUD)",
    showOddsOff: "隐藏 (凭直觉与记牌)",
    oddsEnabled: "开启",
    oddsHidden: "隐藏",
    hitBtnSublabelNoOdds: "翻一张牌",
    youTag: "你",
    bustedCardTooltip: "爆牌卡:",
    bustedCardTag: "爆牌卡:",
    ptsQuick: "100 分 (快节奏)",
    ptsStandard: "150 分 (标准模式)",
    ptsOfficial: "200 分 (官方经典规则)",
    btnCreateRoom: "✨ 创建房间",
    joinGameTitle: "加入在线对战",
    joinGameDesc: "输入4位房间代码即可立即进入牌桌",
    codePlaceholder: "代码",
    btnJoinRoom: "进入房间",
    btnSoloPlay: "🤖 快速单人练习 (你 vs 3个机器人)",
    btnLocalPlay: "👥 本地同屏多人对战 (同设备多人轮流玩)",

    // Local Setup Screen
    localSetupTitle: "本地同屏多人对战",
    localSetupDesc: "在同一台电脑/手机/平板上与好友面对面轮流翻牌对决！无需联网也能玩！",
    localPlayersCount: "玩家人数:",
    addPlayerBtn: "+ 添加玩家",
    addBotBtn: "+ 添加机器人",
    startLocalBtn: "🚀 开始本地对战",
    backBtn: "⬅️ 返回主页",
    playerLabel: "玩家",
    botLabel: "机器人",
    humanLabel: "真人",
    removeLabel: "移除",

    // Lobby Screen
    roomCodeLabel: "房间代码:",
    copyCodeBtn: "📋 复制卡号",
    copyLinkBtn: "🔗 复制链接",
    copied: "✅ 已复制！",
    goalLabel: "目标:",
    playersAtTable: "当前牌桌玩家",
    tableHost: "👑 房主",
    addAiBotBtn: "🤖 + 添加AI机器人",
    startMatchBtn: "🚀 开始比赛",
    waitingHost: "等待房主开始比赛...",
    leaveTableBtn: "离开牌桌",

    // Table / Game Arena
    roundLabel: "第",
    targetLabel: "目标:",
    currentTurnPrefix: "当前行动: ",
    yourTurn: "🌟 轮到你了！🌟",
    drawDeckLabel: "摸牌堆",
    discardLabel: "弃牌堆",
    awaitingFlip: "等待翻牌",
    bustRiskLabel: "爆牌概率:",
    duplicatesLabel: "牌库重复张数:",
    cardsLeftLabel: "剩余牌数:",
    handScoreLabel: "本轮手牌分",
    totalScoreLabel: "累计总分",
    numbersLabel: "数字牌",
    modifiersShieldLabel: "加分卡与爱心:",
    noNumbersYet: "暂未翻出数字牌",
    none: "无",
    extraLifeTitle: "爱心 (多一条命)",
    btnHit: "摸牌 (翻一张)",
    hitSublabelSafe: "翻一张新牌",
    btnStay: "停牌 (锁定得分)",
    staySublabel: "锁定本轮手牌",
    waitingTurn: "等待对手行动",
    locked: "手牌已锁定",
    feedTab: "📜 战报",
    scoresTab: "🏆 积分榜",
    chatTab: "💬 聊天",
    exportLogBtn: "导出战报",
    exportLogSuccess: "✅ 对局日志已成功导出并下载！",
    liveLogTitle: "实时流水",
    dealingFlipThree: "⚡ 连翻三张发牌中...",
    waitingFlipThree: "等待连翻结束",
    exportLogTitle: "导出对局完整日志",
    exportLogPrompt: "暂无可用对局日志",
    saySomething: "说点什么...",
    sendBtn: "发送",
    passToPrompt: "👉 请将设备交给 ",

    // Status Tags
    statusActive: "进行中",
    statusStayed: "已停牌",
    statusFrozen: "已冻结",
    statusBusted: "已爆牌",
    statusFlip7: "FLIP 7 达成！",
    autoPlayTag: "🤖 托管中",
    offlineTag: "🔌 离线",
    enableAutoPlayBtn: "🤖 开启托管",
    disableAutoPlayBtn: "👤 取消托管",
    autoPlayBannerText: "🤖 当前处于 AI 自动托管状态（超时未行动或手动开启）",
    resumeManualBtn: "👤 恢复手动操作",
    reconnectingText: "📡 网络连接断开，正在自动重连回牌桌...",
    reconnectNowBtn: "立即重连",
    reconnectedToast: "✅ 断线重连成功！已回到牌桌",
    turnTimerTitle: "行动倒计时（超过60秒未操作将自动进入AI托管）",

    // Modals
    selectTargetTitle: "选择目标玩家",
    targetFreezeDesc: "选择一位进行中的玩家将其冻结并强制停牌：",
    targetFlipThreeDesc: "选择一位玩家强迫其连续翻3张牌：",
    giftSecondChanceDesc: "你已拥有爱心！请将此爱心（多一条命）赠送给另一位玩家：",
    roundCompleteTitle: "本轮结束！",
    thPlayer: "玩家",
    thStatus: "状态",
    thCards: "手牌",
    thRoundPts: "本轮得分",
    thTotalPts: "累计总分",
    btnNextRound: "下一轮 ➡️",
    waitingNextRound: "等待房主开启下一轮...",
    victoryTitle: "🎉 最终大获全胜！",
    winningScore: "冠军总分:",
    points: "分！",
    btnPlayAgain: "🔄 再来一局",
    btnReturnLobby: "🏠 返回大厅",

    // Rules
    rulesTitle: "Flip 7 — 官方规则说明",
    ruleObjTitle: "🎯 游戏目标",
    ruleObjText: "通过逐张翻牌积累分数，率先达到 <strong>200 分</strong>（或房间设定目标）的玩家获胜！切勿贪心导致翻出重复数字爆牌！",
    ruleTurnTitle: "🃏 回合行动",
    ruleTurnHit: "摸牌 (HIT)：从牌堆翻开顶牌。若是你未拥有的数字牌，收入手牌；若翻出手中已有的重复数字，你将立刻【爆牌】，本轮得0分！",
    ruleTurnStay: "停牌 (STAY)：落袋为安！锁定当前手牌得分并退出本轮后续行动，分数安全计入总分。",
    ruleFlip7Title: "🌟 FLIP 7 超级翻盘！",
    ruleFlip7Text: "如果你在不爆牌的情况下成功翻出 <strong>7 张不同的数字牌</strong>，将达成【FLIP 7】！额外获得 <strong>+15 分大奖</strong>，并立刻终结本轮！",
    ruleDeckTitle: "📦 牌库构成（共94张牌）",
    ruleNumbersTitle: "数字牌 (0–12，共79张)",
    ruleNumbersDesc: "牌面数字与牌库中的张数相同！（1张0，1张1，2张2，3张3...12张12）。大数字牌分值高，但在牌堆中张数极多，爆牌几率剧增！",
    ruleModifiersTitle: "加分卡与翻倍卡 (共6张)",
    ruleModifiersDesc: "+2, +4, +6, +8, +10 (各1张) 附加额外基础分；宝贵的【x2 翻倍卡】(1张) 会将所有数字牌与加分卡的总和翻倍！Flip 7奖励分不翻倍。",
    ruleActionsTitle: "特殊功能卡 (共9张)",
    ruleSecondChanceDesc: "❤️ 第二次机会 (3张)：多一条命！翻出重复数字时自动消耗一颗爱心免除爆牌，获得一次重来机会。",
    ruleFreezeDesc: "❄️ 冰冻卡 (3张)：选择任意一名进行中的玩家（可以是对局领先者），强迫其立刻停牌锁定当前分数。",
    ruleFlipThreeDesc: "⚡ 连翻三张 (3张)：选择一名玩家强迫其连续翻3张牌，极度惊险刺激！",
    ruleScoringTitle: "🧮 计分规则",
    ruleScoringDesc: "本轮得分 = ((数字牌总和 + 附加分) × (2 若有x2)) + (15 若达成Flip 7)。爆牌玩家本轮得 0 分。",

    // Notifications / Logs
    logRoundBegins: (round, dealer) => `🔔 --- 第 ${round} 轮开始！荷官: ${dealer} ---`,
    logRoundEnd: (round, reason) => `🏁 第 ${round} 轮结束！${reason ? `(${reason})` : ''}`,
    logHitSafe: (name, val, count) => `🃏 ${name} 摸牌翻出 ${val}！（当前共 ${count} 张）`,
    logBusted: (name, val) => `💥 ${name} 翻出重复的 ${val}，爆牌！（本轮 0 分）`,
    logShieldSaved: (name, val) => `❤️ ${name} 翻出重复的 ${val}，但【爱心多一条命】生效！消耗爱心保住性命！`,
    logFlip7: (name) => `🌟🎉 FLIP 7！${name} 成功集齐 7 张不重复数字！+15 分！本轮直接结束！`,
    logModifier: (name, cardName) => `✨ ${name} 翻出加分卡 ${cardName}！`,
    logShieldGained: (name) => `❤️ ${name} 获得了爱心（多一条命）！`,
    logFroze: (source, target, pts) => `❄️ ${source} 冰冻了 ${target}！${target} 强制停牌并锁定在 ${pts} 分！`,
    logGiftedShield: (source, target) => `🎁 ${source} 将爱心（多一条命）赠送给了 ${target}！`,
    logFlipThreeUsed: (source, target) => `⚡ ${source} 对 ${target} 使用了【连翻三张】！强制连续翻牌...`,
    logStayed: (name, pts) => `🛑 ${name} 选择停牌，锁定 ${pts} 分！`,
    logGameOver: (name, score) => `🏆 游戏结束！${name} 以 ${score} 分荣获总冠军！`
  }
};

let currentLang = localStorage.getItem('flip7_lang') || 'zh'; // Default to Chinese

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'zh') lang = 'zh';
  currentLang = lang;
  localStorage.setItem('flip7_lang', lang);
  applyI18n();
}

function t(key, ...args) {
  const dict = I18N[currentLang] || I18N.en;
  const val = dict[key];
  if (typeof val === 'function') {
    return val(...args);
  }
  return val || I18N.en[key] || key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const trans = t(key);
    if (trans) el.innerHTML = trans;
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const trans = t(key);
    if (trans) el.setAttribute('title', trans);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const trans = t(key);
    if (trans) el.setAttribute('placeholder', trans);
  });

  const langBtn = document.getElementById('btn-lang-toggle');
  if (langBtn) {
    langBtn.textContent = t('langBtn');
  }

  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    const span = themeBtn.querySelector('span');
    if (span) span.textContent = (currentLang === 'zh' ? '主题风格' : 'Themes');
  }
}

window.I18N = I18N;
window.t = t;
window.setLanguage = setLanguage;
window.getCurrentLanguage = () => currentLang;
