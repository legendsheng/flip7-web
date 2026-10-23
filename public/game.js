/**
 * FLIP 7 - Modern Web Client (Online Multiplayer + Local Pass-and-Play + i18n)
 */

(() => {
  // ============================================================================
  // Audio Synthesizer (Web Audio API)
  // ============================================================================

  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('flip7_sound') !== 'muted';
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('flip7_sound', this.enabled ? 'on' : 'muted');
      return this.enabled;
    }

    playCardFlip() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    }

    playBust() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.linearRampToValueAtTime(70, t + 0.35);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    }

    playShieldSave() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.06);
        gain.gain.setValueAtTime(0.15, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.26);
      });
    }

    playFreeze() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [880, 1174.66, 1318.51].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.05);
        gain.gain.setValueAtTime(0.12, t + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.005, t + i * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.05);
        osc.stop(t + i * 0.05 + 0.36);
      });
    }

    playFlipSeven() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        gain.gain.setValueAtTime(0.2, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.45);
      });
    }

    playRoundWin() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.55);
      });
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  const sfx = new SoundFX();

  // ============================================================================
  // Confetti Particle Engine
  // ============================================================================

  class Confetti {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.running = false;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    explode(count = 120) {
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];
      const x = this.canvas.width / 2;
      const y = this.canvas.height / 3;

      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 18,
          vy: (Math.random() - 0.8) * 16,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 10,
          gravity: 0.35,
          alpha: 1
        });
      }

      if (!this.running) {
        this.running = true;
        this.render();
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.alpha -= 0.007;

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      });

      this.particles = this.particles.filter(p => p.alpha > 0 && p.y < this.canvas.height + 50);

      if (this.particles.length > 0) {
        requestAnimationFrame(() => this.render());
      } else {
        this.running = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  const confetti = new Confetti('confetti-canvas');

  // ============================================================================
  // Random Nickname & Avatar Generator
  // ============================================================================

  const ALL_AVATARS = ['🦊', '🦁', '🐼', '🦅', '🐉', '🤖', '🎲', '💎', '🚀', '👑', '🍀', '🔥', '🐯', '🦄', '🐙', '🦉', '🦈', '🐺'];
  const RANDOM_NAMES_ZH = [
    '幸运锦鲤', '王牌怪盗', '翻牌雀神', '欧皇本皇', '闪电快手', '冷静大师',
    '天选之子', '星际赌神', '神抽王', '逍遥浪客', '神秘大咖', '极速猎手',
    '深海巨鲨', '暗夜狐仙', '黄金狮子', '暴风飞龙', '绝世好牌', '紫气东来'
  ];
  const RANDOM_NAMES_EN = [
    'Lucky Fox', 'Ace Shark', 'Star Roller', 'Card Wizard', 'Shadow King', 'Neon Maverick',
    'Golden Lion', 'Frost Dragon', 'Turbo Panda', 'Royal Flush', 'Cyber Hawk', 'Wild Joker',
    'Mystic Wolf', 'Ruby Falcon', 'Cosmic Owl', 'Blaze Tiger'
  ];

  function generateRandomProfile(usedNames = new Set(), usedAvatars = new Set()) {
    const isZh = (window.getCurrentLanguage ? window.getCurrentLanguage() === 'zh' : true);
    const namePool = isZh ? RANDOM_NAMES_ZH : RANDOM_NAMES_EN;

    const availAvatars = ALL_AVATARS.filter(a => !usedAvatars.has(a));
    const avatarList = availAvatars.length > 0 ? availAvatars : ALL_AVATARS;
    const avatar = avatarList[Math.floor(Math.random() * avatarList.length)];

    let name = '';
    for (let i = 0; i < 20; i++) {
      const base = namePool[Math.floor(Math.random() * namePool.length)];
      const num = Math.floor(Math.random() * 90) + 10;
      const candidate = `${base}${num}`;
      if (!usedNames.has(candidate)) {
        name = candidate;
        break;
      }
    }
    if (!name) {
      name = `${namePool[0]}${Math.floor(Math.random() * 900) + 100}`;
    }
    return { name, avatar };
  }

  // Generate a random profile for this tab if not already assigned in this tab session
  const initialTabProfile = (() => {
    const savedTabName = sessionStorage.getItem('flip7_tab_name');
    const savedTabAvatar = sessionStorage.getItem('flip7_tab_avatar');
    if (savedTabName && savedTabAvatar && savedTabName !== 'Player') {
      return { name: savedTabName, avatar: savedTabAvatar };
    }
    const rand = generateRandomProfile();
    sessionStorage.setItem('flip7_tab_name', rand.name);
    sessionStorage.setItem('flip7_tab_avatar', rand.avatar);
    return rand;
  })();

  const localP1 = generateRandomProfile();
  const localP2 = generateRandomProfile(new Set([localP1.name]), new Set([localP1.avatar]));

  // ============================================================================
  // App State & Network
  // ============================================================================

  const state = {
    ws: null,
    connected: false,
    wasInRoomBeforeDisconnect: false,
    reconnectTimer: null,
    heartbeatTimer: null,
    turnDeadlineLocal: null,
    playerId: sessionStorage.getItem('flip7_playerId') || null,
    roomCode: null,
    isHost: false,
    roomData: null,
    playerName: initialTabProfile.name,
    playerAvatar: initialTabProfile.avatar,
    activeTab: 'tab-log',
    lastSeenDrawId: null,
    animatingCard: null,
    
    // Theme
    theme: localStorage.getItem('flip7_theme') || 'casino',

    // Local Mode State
    isLocalMode: false,
    localGame: null,
    localSetupPlayers: [
      { name: localP1.name, avatar: localP1.avatar, isBot: false },
      { name: localP2.name, avatar: localP2.avatar, isBot: false },
      { name: 'Lucky Lucy', avatar: '🍀', isBot: true, personality: 'balanced' }
    ]
  };

  function saveRoomSession(roomCode, playerId, name, avatar) {
    if (!roomCode || !playerId) return;
    const payload = JSON.stringify({
      roomCode,
      playerId,
      name,
      avatar,
      updatedAt: Date.now()
    });
    sessionStorage.setItem('flip7_playerId', playerId);
    sessionStorage.setItem('flip7_active_room', roomCode);
    sessionStorage.setItem('flip7_session', payload);
    try {
      localStorage.setItem(`flip7_room_session_${roomCode}`, payload);
      localStorage.setItem('flip7_last_session', payload);
    } catch (e) {}
  }

  function loadRoomSession(roomCode) {
    try {
      if (roomCode) {
        const raw = localStorage.getItem(`flip7_room_session_${roomCode.toUpperCase()}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Date.now() - (parsed.updatedAt || 0) < 12 * 3600 * 1000) {
            return parsed;
          }
        }
      }
      const tabRaw = sessionStorage.getItem('flip7_session');
      if (tabRaw) {
        const parsed = JSON.parse(tabRaw);
        if (!roomCode || parsed.roomCode === roomCode.toUpperCase()) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  }

  function clearRoomSession(roomCode) {
    sessionStorage.removeItem('flip7_active_room');
    sessionStorage.removeItem('flip7_session');
    try {
      if (roomCode) localStorage.removeItem(`flip7_room_session_${roomCode.toUpperCase()}`);
      localStorage.removeItem('flip7_last_session');
    } catch (e) {}
  }

  // Helper Elements
  const el = {
    // Screens
    screenHome: document.getElementById('screen-home'),
    screenLocalSetup: document.getElementById('screen-local-setup'),
    screenRoomLobby: document.getElementById('screen-room-lobby'),
    screenGame: document.getElementById('screen-game'),

    // Header & Network Banners
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    btnLangToggle: document.getElementById('btn-lang-toggle'),
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    btnRules: document.getElementById('btn-rules'),
    btnRoomListHeader: document.getElementById('btn-room-list-header'),
    btnRoomList: document.getElementById('btn-room-list'),
    modalRoomList: document.getElementById('modal-room-list'),
    roomListCountBadge: document.getElementById('room-list-count-badge'),
    btnRefreshRooms: document.getElementById('btn-refresh-rooms'),
    btnCloseRooms: document.getElementById('btn-close-rooms'),
    roomListContainer: document.getElementById('room-list-container'),
    reconnectBanner: document.getElementById('reconnect-banner'),
    reconnectText: document.getElementById('reconnect-text'),
    btnReconnectNow: document.getElementById('btn-reconnect-now'),
    reconnectToast: document.getElementById('reconnect-toast'),

    // Theme Modal
    modalTheme: document.getElementById('modal-theme'),
    btnCloseTheme: document.getElementById('btn-close-theme'),
    themeOptionsGrid: document.getElementById('theme-options-grid'),

    // Home / Profile
    playerNameInput: document.getElementById('player-name-input'),
    selectedAvatar: document.getElementById('selected-avatar'),
    avatarTrigger: document.getElementById('avatar-trigger'),
    avatarPicker: document.getElementById('avatar-picker'),
    btnRandomProfile: document.getElementById('btn-random-profile'),
    createTargetScore: document.getElementById('create-target-score'),
    createShowOdds: document.getElementById('create-show-odds'),
    btnCreateRoom: document.getElementById('btn-create-room'),
    roomCodeInput: document.getElementById('room-code-input'),
    btnJoinRoom: document.getElementById('btn-join-room'),
    btnLocalPlayOpen: document.getElementById('btn-local-play-open'),
    btnSoloPlay: document.getElementById('btn-solo-play'),

    // Local Setup Screen
    localTargetScore: document.getElementById('local-target-score'),
    localShowOdds: document.getElementById('local-show-odds'),
    btnLocalAddPlayer: document.getElementById('btn-local-add-player'),
    btnLocalAddBot: document.getElementById('btn-local-add-bot'),
    localPlayersList: document.getElementById('local-players-list'),
    btnLocalBack: document.getElementById('btn-local-back'),
    btnLocalStart: document.getElementById('btn-local-start'),

    // Room Lobby
    lobbyRoomCode: document.getElementById('lobby-room-code'),
    lobbyTargetScore: document.getElementById('lobby-target-score'),
    lobbyShowOdds: document.getElementById('lobby-show-odds'),
    lobbyPlayerCount: document.getElementById('lobby-player-count'),
    lobbyPlayerList: document.getElementById('lobby-player-list'),
    hostControls: document.getElementById('host-controls'),
    guestControls: document.getElementById('guest-controls'),
    btnAddBot: document.getElementById('btn-add-bot'),
    btnStartGame: document.getElementById('btn-start-game'),
    btnLeaveRoom: document.getElementById('btn-leave-room'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    btnCopyLink: document.getElementById('btn-copy-link'),

    // Game Table
    gameRoundNum: document.getElementById('game-round-num'),
    turnPlayerName: document.getElementById('turn-player-name'),
    turnTimerBadge: document.getElementById('turn-timer-badge'),
    gameTargetScore: document.getElementById('game-target-score'),
    localPassBanner: document.getElementById('local-pass-banner'),
    localPassText: document.getElementById('local-pass-text'),
    otherPlayersArena: document.getElementById('other-players-arena'),
    deckRemainingCount: document.getElementById('deck-remaining-count'),
    discardCount: document.getElementById('discard-count'),
    lastCardPlaceholder: document.getElementById('last-card-placeholder'),
    revealedCardContainer: document.getElementById('revealed-card-container'),
    oddsHud: document.getElementById('odds-hud'),
    hudBustPct: document.getElementById('hud-bust-pct'),
    hudDupCount: document.getElementById('hud-dup-count'),
    hudCardsLeft: document.getElementById('hud-cards-left'),

    // My Board
    myPlayerBoard: document.getElementById('my-player-board'),
    myAvatar: document.getElementById('my-avatar'),
    myName: document.getElementById('my-name'),
    myStatusPill: document.getElementById('my-status-pill'),
    btnToggleAutoplay: document.getElementById('btn-toggle-autoplay'),
    autoplayBanner: document.getElementById('autoplay-banner'),
    btnResumeManual: document.getElementById('btn-resume-manual'),
    myHandScore: document.getElementById('my-hand-score'),
    myTotalScore: document.getElementById('my-total-score'),
    myNumberCount: document.getElementById('my-number-count'),
    myNumberCards: document.getElementById('my-number-cards'),
    mySpecialCards: document.getElementById('my-special-cards'),
    btnHit: document.getElementById('btn-hit'),
    btnStay: document.getElementById('btn-stay'),
    hitSublabel: document.getElementById('hit-sublabel'),
    staySublabel: document.getElementById('stay-sublabel'),

    // Sidebar
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    tabBtnChat: document.getElementById('tab-btn-chat'),
    reactionsBar: document.getElementById('reactions-bar'),
    logStream: document.getElementById('log-stream'),
    scoreboardList: document.getElementById('scoreboard-list'),
    chatMessages: document.getElementById('chat-messages'),
    chatForm: document.getElementById('chat-form'),
    chatInput: document.getElementById('chat-input'),

    // Modals
    modalTarget: document.getElementById('modal-target'),
    targetModalTitle: document.getElementById('target-modal-title'),
    targetModalDesc: document.getElementById('target-modal-desc'),
    targetCardPreview: document.getElementById('target-card-preview'),
    targetPlayersGrid: document.getElementById('target-players-grid'),

    modalRecap: document.getElementById('modal-recap'),
    recapRoundNum: document.getElementById('recap-round-num'),
    recapReason: document.getElementById('recap-reason'),
    recapTableBody: document.getElementById('recap-table-body'),
    btnNextRound: document.getElementById('btn-next-round'),
    recapGuestNotice: document.getElementById('recap-guest-notice'),

    modalGameOver: document.getElementById('modal-gameover'),
    championSpotlight: document.getElementById('champion-spotlight'),
    podiumArea: document.getElementById('podium-area'),
    btnPlayAgain: document.getElementById('btn-play-again'),
    btnReturnLobby: document.getElementById('btn-return-lobby'),

    modalRules: document.getElementById('modal-rules'),
    btnCloseRules: document.getElementById('btn-close-rules')
  };

  // ============================================================================
  // WebSocket Connection & Auto-Reconnect (For Online Multiplayer)
  // ============================================================================

  function showReconnectToast() {
    if (!el.reconnectToast) return;
    el.reconnectToast.classList.remove('hidden');
    clearTimeout(el.reconnectToast._hideTimer);
    el.reconnectToast._hideTimer = setTimeout(() => {
      el.reconnectToast.classList.add('hidden');
    }, 3200);
  }

  function startHeartbeat() {
    clearInterval(state.heartbeatTimer);
    state.heartbeatTimer = setInterval(() => {
      if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        try {
          state.ws.send(JSON.stringify({ type: 'PING', data: {} }));
        } catch (e) {}
      }
    }, 20000);
  }

  function triggerReconnectNow() {
    if (!state.roomCode || state.isLocalMode) return;
    clearTimeout(state.reconnectTimer);
    if (state.ws) {
      try { state.ws.close(); } catch (e) {}
      state.ws = null;
    }
    connectWebSocket(() => {
      sendWS('JOIN_ROOM', {
        roomCode: state.roomCode,
        playerId: state.playerId,
        name: state.playerName,
        avatar: state.playerAvatar
      });
    });
  }

  function connectWebSocket(onOpenCallback) {
    if (state.ws && (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING)) {
      if (onOpenCallback && state.ws.readyState === WebSocket.OPEN) onOpenCallback();
      return;
    }

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${proto}//${host}/ws`;

    state.ws = new WebSocket(wsUrl);

    state.ws.onopen = () => {
      state.connected = true;
      clearTimeout(state.reconnectTimer);
      startHeartbeat();
      if (el.reconnectBanner) el.reconnectBanner.classList.add('hidden');
      if (onOpenCallback) onOpenCallback();
    };

    state.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };

    state.ws.onclose = () => {
      state.connected = false;
      clearInterval(state.heartbeatTimer);
      if (state.roomCode && !state.isLocalMode) {
        state.wasInRoomBeforeDisconnect = true;
        if (el.reconnectBanner) el.reconnectBanner.classList.remove('hidden');
        clearTimeout(state.reconnectTimer);
        state.reconnectTimer = setTimeout(() => {
          triggerReconnectNow();
        }, 2000);
      }
    };
  }

  function sendWS(type, data = {}) {
    if (state.isLocalMode) {
      handleLocalAction(type, data);
      return;
    }

    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type, data }));
    } else {
      connectWebSocket(() => {
        state.ws.send(JSON.stringify({ type, data }));
      });
    }
  }

  // Anti-rapid-click helper
  function withButtonLock(btn, cooldownMs, fn) {
    if (!btn) return fn();
    if (btn._isLocked || btn.disabled) return;
    btn._isLocked = true;
    btn.classList.add('btn-busy');
    btn.disabled = true;
    clearTimeout(btn._unlockTimer);
    btn._unlockTimer = setTimeout(() => {
      btn._isLocked = false;
      btn.classList.remove('btn-busy');
      btn.disabled = false;
    }, cooldownMs);
    fn();
  }

  function unlockRoomButtons() {
    state.roomActionPending = false;
    [el.btnCreateRoom, el.btnJoinRoom].forEach(btn => {
      if (btn) {
        clearTimeout(btn._unlockTimer);
        btn._isLocked = false;
        btn.classList.remove('btn-busy');
        btn.disabled = false;
      }
    });
  }

  function handleServerMessage(msg) {
    const { type, data } = msg;

    if (type === 'PONG') {
      return;
    }

    if (type === 'ROOM_LIST') {
      renderRoomList((data && data.rooms) || []);
      return;
    }

    if (type === 'ROOM_CREATED' || type === 'ROOM_JOINED') {
      unlockRoomButtons();
      closeRoomListModal();
      state.isLocalMode = false;
      state.roomCode = data.roomCode;
      state.playerId = data.playerId;
      if (data.playerName) {
        state.playerName = data.playerName;
        el.playerNameInput.value = data.playerName;
      }
      if (data.playerAvatar) {
        state.playerAvatar = data.playerAvatar;
        el.selectedAvatar.textContent = data.playerAvatar;
      }
      saveRoomSession(state.roomCode, state.playerId, state.playerName, state.playerAvatar);
      history.replaceState(null, '', `?room=${data.roomCode}`);

      if (el.reconnectBanner) el.reconnectBanner.classList.add('hidden');
      if (data.reconnected || state.wasInRoomBeforeDisconnect) {
        state.wasInRoomBeforeDisconnect = false;
        showReconnectToast();
      }
      updateGameState(data.state);
    } else if (type === 'STATE_UPDATE') {
      updateGameState(data);
    } else if (type === 'CHAT_MESSAGE') {
      renderChatMessage(data);
    } else if (type === 'ERROR') {
      unlockRoomButtons();
      if (data && data.code === 'ROOM_NOT_FOUND') {
        clearRoomSession(state.roomCode);
        state.roomCode = null;
        state.wasInRoomBeforeDisconnect = false;
        if (el.reconnectBanner) el.reconnectBanner.classList.add('hidden');
        history.replaceState(null, '', window.location.pathname);
        showScreen(el.screenHome);
      }
      alert(data.message || 'An error occurred.');
    }
  }

  // ============================================================================
  // Active Room List Modal
  // ============================================================================

  function openRoomListModal() {
    if (!el.modalRoomList) return;
    el.modalRoomList.classList.remove('hidden');
    fetchRoomList();
    clearInterval(state.roomListPollTimer);
    state.roomListPollTimer = setInterval(() => {
      if (el.modalRoomList && !el.modalRoomList.classList.contains('hidden')) {
        fetchRoomList();
      } else {
        clearInterval(state.roomListPollTimer);
      }
    }, 3500);
  }

  function closeRoomListModal() {
    if (!el.modalRoomList) return;
    el.modalRoomList.classList.add('hidden');
    clearInterval(state.roomListPollTimer);
  }

  async function fetchRoomList() {
    try {
      const res = await fetch('/api/rooms', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        renderRoomList(json.rooms || []);
        return;
      }
    } catch (e) {
      // Fallback to WebSocket if fetch fails
    }
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type: 'LIST_ROOMS', data: {} }));
    }
  }

  function joinRoomByCode(code) {
    if (!code || state.roomActionPending) return;
    const cleanCode = code.trim().toUpperCase();
    state.roomActionPending = true;
    setTimeout(() => { state.roomActionPending = false; }, 1800);
    state.isLocalMode = false;
    if (el.roomCodeInput) el.roomCodeInput.value = cleanCode;
    const savedSess = loadRoomSession(cleanCode);
    connectWebSocket(() => {
      sendWS('JOIN_ROOM', {
        roomCode: cleanCode,
        playerId: savedSess ? savedSess.playerId : state.playerId,
        name: state.playerName,
        avatar: state.playerAvatar
      });
    });
  }

  function renderRoomList(rooms) {
    if (!el.roomListContainer) return;
    if (el.roomListCountBadge) {
      el.roomListCountBadge.textContent = rooms.length;
    }

    if (!rooms || rooms.length === 0) {
      el.roomListContainer.innerHTML = `
        <div class="room-list-empty">
          <div class="empty-icon">🃏</div>
          <p>${window.t('noActiveRooms')}</p>
        </div>
      `;
      return;
    }

    const isZh = (window.getCurrentLanguage() === 'zh');
    el.roomListContainer.innerHTML = rooms.map(r => {
      let stateLabel = window.t('roomStateLobby');
      let stateClass = 'room-badge-lobby';
      if (r.state === 'playing') {
        stateLabel = `${window.t('roomStatePlaying')} (${isZh ? `第 ${r.roundNumber} 轮` : `R${r.roundNumber}`})`;
        stateClass = 'room-badge-playing';
      } else if (r.state === 'round_recap') {
        stateLabel = `${window.t('roomStateRecap')} (${isZh ? `第 ${r.roundNumber} 轮` : `R${r.roundNumber}`})`;
        stateClass = 'room-badge-recap';
      } else if (r.state === 'gameover') {
        stateLabel = window.t('roomStateGameover');
        stateClass = 'room-badge-gameover';
      }

      const savedSess = loadRoomSession(r.roomCode);
      const hasDisconnectedSeat = (r.players || []).some(p => !p.isBot && p.isConnected === false);
      const canReconnect = !!(savedSess || hasDisconnectedSeat || r.roomCode === state.roomCode);
      const canJoin = (r.state === 'lobby' && r.playerCount < (r.maxPlayers || 12)) || canReconnect;

      let actionBtnHTML = '';
      if (r.state === 'lobby') {
        actionBtnHTML = `<button type="button" class="btn btn-sm btn-primary btn-join-room-item" data-room-code="${escapeHTML(r.roomCode)}">${window.t('joinThisRoomBtn')}</button>`;
      } else if (canReconnect) {
        actionBtnHTML = `<button type="button" class="btn btn-sm btn-secondary btn-join-room-item" data-room-code="${escapeHTML(r.roomCode)}">${window.t('reconnectThisRoomBtn')}</button>`;
      } else {
        actionBtnHTML = `<button type="button" class="btn btn-sm btn-outline" disabled>${window.t('inProgressLockedBtn')}</button>`;
      }

      const playerChips = (r.players || []).map(p => `
        <span class="room-player-chip ${p.isBot ? 'is-bot' : ''} ${p.isConnected === false ? 'is-offline' : ''}">
          ${p.avatar} ${escapeHTML(p.name)}
          ${p.isAutoPlay ? '🤖' : ''}
          ${p.isConnected === false ? '🔌' : ''}
        </span>
      `).join('');

      return `
        <div class="room-list-card ${r.roomCode === state.roomCode ? 'is-current-room' : ''}">
          <div class="room-card-top">
            <div class="room-code-wrap">
              <span class="room-code-pill">${escapeHTML(r.roomCode)}</span>
              <span class="room-state-badge ${stateClass}">${stateLabel}</span>
            </div>
            <div class="room-card-action">
              ${actionBtnHTML}
            </div>
          </div>
          <div class="room-card-meta">
            <span>👑 ${window.t('roomHostLabel')} <strong>${r.hostAvatar || '🦊'} ${escapeHTML(r.hostName)}</strong></span>
            <span>👥 ${window.t('roomHumansLabel')} <strong>${r.connectedHumanCount}/${r.humanCount}</strong></span>
            <span>🤖 ${window.t('roomBotsLabel')} <strong>${r.botCount}</strong></span>
            <span>🎯 ${window.t('goalLabel')} <strong>${r.targetScore} pts</strong></span>
          </div>
          <div class="room-card-players">
            ${playerChips}
          </div>
        </div>
      `;
    }).join('');

    el.roomListContainer.querySelectorAll('.btn-join-room-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-room-code');
        sfx.playClick();
        withButtonLock(btn, 1500, () => {
          joinRoomByCode(code);
        });
      });
    });
  }

  // ============================================================================
  // Screen Management
  // ============================================================================

  function showScreen(screenEl) {
    [el.screenHome, el.screenLocalSetup, el.screenRoomLobby, el.screenGame].forEach(s => s.classList.remove('active'));
    screenEl.classList.add('active');
  }

  // ============================================================================
  // Local Multiplayer Engine
  // ============================================================================

  class LocalFlip7Game {
    constructor(playerConfigs, targetScore = 200, showOdds = true) {
      this.targetScore = targetScore;
      this.showOdds = showOdds;
      this.roundNumber = 0;
      this.dealerIndex = 0;
      this.currentTurnIndex = 0;
      this.state = 'playing';
      this.deck = this.buildDeck();
      this.discardPile = [];
      this.gameLog = [];
      this.lastCardDrawn = null;
      this.lastDrawResult = null;
      this.pendingTarget = null;
      this.winner = null;
      this.turnDeadline = null;
      this.inactivityTimer = null;

      this.players = playerConfigs.map((cfg, i) => ({
        id: `local_p_${i}`,
        name: cfg.name,
        avatar: cfg.avatar,
        isBot: cfg.isBot,
        isAutoPlay: false,
        botPersonality: cfg.personality || 'balanced',
        totalScore: 0,
        roundScore: 0,
        roundStatus: 'active',
        numberCards: [],
        modifierCards: [],
        handCards: [],
        hasSecondChance: false,
        secondChanceCard: null,
        bustedCard: null,
        flippedSeven: false,
        isConnected: true
      }));

      this.startNewRound();
    }

    log(msg) {
      this.gameLog.push(msg);
      if (this.gameLog.length > 50) this.gameLog.shift();
    }

    buildDeck() {
      const d = [];
      let cid = 1;
      // Numbers: 0(1), 1(1), 2(2)... 12(12) = 79 cards
      d.push({ id: `c_${cid++}`, type: 'number', value: 0, name: '0', desc: window.t('ruleNumbersTitle') });
      for (let v = 1; v <= 12; v++) {
        for (let c = 0; c < v; c++) {
          d.push({ id: `c_${cid++}`, type: 'number', value: v, name: `${v}`, desc: `${v}` });
        }
      }
      // Modifiers: +2, +4, +6, +8, +10 and x2 = 6 cards
      for (const m of [2, 4, 6, 8, 10]) {
        d.push({ id: `c_${cid++}`, type: 'modifier', value: m, mod_type: 'add', name: `+${m}`, desc: `+${m}` });
      }
      d.push({ id: `c_${cid++}`, type: 'modifier', value: 2, mod_type: 'multiply', name: 'x2', desc: 'x2' });
      // Actions: 3x Second Chance, 3x Freeze, 3x Flip Three = 9 cards
      for (let i = 0; i < 3; i++) d.push({ id: `c_${cid++}`, type: 'action', action: 'second_chance', name: 'Second Chance', desc: 'Extra Life' });
      for (let i = 0; i < 3; i++) d.push({ id: `c_${cid++}`, type: 'action', action: 'freeze', name: 'Freeze', desc: 'Freeze' });
      for (let i = 0; i < 3; i++) d.push({ id: `c_${cid++}`, type: 'action', action: 'flip_three', name: 'Flip Three', desc: 'Flip 3' });
      
      // Shuffle
      for (let i = d.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [d[i], d[j]] = [d[j], d[i]];
      }
      return d;
    }

    drawCard() {
      if (this.deck.length === 0) {
        if (this.discardPile.length > 0) {
          this.deck = this.discardPile.slice();
          this.discardPile = [];
          for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
          }
          this.log("🔀 " + (window.getCurrentLanguage() === 'zh' ? '弃牌堆已重新洗入摸牌堆。' : 'Discard pile reshuffled into draw deck.'));
        } else {
          this.deck = this.buildDeck();
        }
      }
      return this.deck.pop();
    }

    computeScore(p) {
      if (p.roundStatus === 'busted') {
        p.roundScore = 0;
        return 0;
      }
      const sum = p.numberCards.reduce((a, b) => a + b, 0);
      const hasX2 = p.modifierCards.some(m => m.name === 'x2');
      const mods = p.modifierCards.filter(m => m.mod_type === 'add').reduce((a, m) => a + m.value, 0);
      const bonus = p.numberCards.length >= 7 ? 15 : 0;
      p.roundScore = ((sum + mods) * (hasX2 ? 2 : 1)) + bonus;
      return p.roundScore;
    }

    startNewRound() {
      this.roundNumber += 1;
      this.state = 'playing';
      this.lastCardDrawn = null;
      this.lastDrawResult = null;
      this.pendingTarget = null;

      // Collect all cards remaining in players' hands into the discard pile
      this.players.forEach(p => {
        if (p.handCards && p.handCards.length > 0) {
          this.discardPile.push(...p.handCards);
        }
        if (p.secondChanceCard) {
          this.discardPile.push(p.secondChanceCard);
          p.secondChanceCard = null;
        }
        p.handCards = [];
        p.roundStatus = 'active';
        p.numberCards = [];
        p.modifierCards = [];
        p.hasSecondChance = false;
        p.bustedCard = null;
        p.flippedSeven = false;
        p.roundScore = 0;
      });

      // The draw deck (this.deck) is PRESERVED across rounds!
      // Only when this.deck runs out will drawCard() reshuffle this.discardPile.

      this.currentTurnIndex = (this.dealerIndex + 1) % this.players.length;
      const dealerName = this.players[this.dealerIndex].name;
      this.log(window.t('logRoundBegins', this.roundNumber, dealerName));
      this.checkBotTurn();
    }

    currentPlayer() {
      return this.players[this.currentTurnIndex];
    }

    activePlayers() {
      return this.players.filter(p => p.roundStatus === 'active');
    }

    advanceTurn() {
      this.lastCardDrawn = null;
      const active = this.activePlayers();
      if (active.length === 0) {
        this.endRound();
        return;
      }

      const n = this.players.length;
      for (let s = 1; s <= n; s++) {
        const nextIdx = (this.currentTurnIndex + s) % n;
        if (this.players[nextIdx].roundStatus === 'active') {
          this.currentTurnIndex = nextIdx;
          break;
        }
      }
      this.checkBotTurn();
    }

    hit(autoAdvance = true) {
      const p = this.currentPlayer();
      if (!p || p.roundStatus !== 'active' || this.state !== 'playing') return;

      const card = this.drawCard();
      this.lastCardDrawn = card;
      const result = { card, player: p.id };

      if (card.type === 'number') {
        const val = card.value;
        if (p.numberCards.includes(val)) {
          // Duplicate!
          if (p.hasSecondChance) {
            p.hasSecondChance = false;
            this.discardPile.push(card);
            if (p.secondChanceCard) {
              this.discardPile.push(p.secondChanceCard);
              p.secondChanceCard = null;
            }
            result.outcome = 'shield_saved';
            this.log(window.t('logShieldSaved', p.name, val));
          } else {
            p.roundStatus = 'busted';
            p.bustedCard = card;
            this.discardPile.push(card);
            if (p.handCards && p.handCards.length > 0) {
              this.discardPile.push(...p.handCards);
              p.handCards = [];
            }
            if (p.secondChanceCard) {
              this.discardPile.push(p.secondChanceCard);
              p.secondChanceCard = null;
            }
            result.outcome = 'busted';
            this.log(window.t('logBusted', p.name, val));
          }
        } else {
          p.numberCards.push(val);
          p.handCards.push(card);
          result.outcome = 'safe_number';
          this.log(window.t('logHitSafe', p.name, val, p.numberCards.length));

          if (p.numberCards.length >= 7) {
            p.flippedSeven = true;
            result.outcome = 'flip_seven';
            this.log(window.t('logFlip7', p.name));
            this.lastDrawResult = result;
            this.endRound(`${p.name} FLIP 7!`);
            return;
          }
        }
      } else if (card.type === 'modifier') {
        p.modifierCards.push(card);
        p.handCards.push(card);
        result.outcome = 'modifier';
        this.log(window.t('logModifier', p.name, card.name));
      } else if (card.type === 'action') {
        if (card.action === 'second_chance') {
          if (!p.hasSecondChance) {
            p.hasSecondChance = true;
            p.secondChanceCard = card;
            result.outcome = 'second_chance_gained';
            this.log(window.t('logShieldGained', p.name));
          } else {
            const others = this.activePlayers().filter(pl => pl.id !== p.id && !pl.hasSecondChance);
            if (others.length > 0) {
              this.pendingTarget = {
                type: 'GIFT_SECOND_CHANCE',
                source_id: p.id,
                card: card,
                valid_targets: others.map(pl => pl.id)
              };
              result.outcome = 'pending_gift';
              this.lastDrawResult = result;
              this.checkBotTarget();
              return;
            } else {
              this.discardPile.push(card);
            }
          }
        } else if (card.action === 'freeze') {
          const activeTargets = this.activePlayers();
          if (activeTargets.length > 0) {
            this.pendingTarget = {
              type: 'TARGET_FREEZE',
              source_id: p.id,
              card: card,
              valid_targets: activeTargets.map(pl => pl.id)
            };
            result.outcome = 'pending_freeze';
            this.lastDrawResult = result;
            this.checkBotTarget();
            return;
          } else {
            this.discardPile.push(card);
          }
        } else if (card.action === 'flip_three') {
          const others = this.activePlayers();
          if (others.length > 0) {
            this.pendingTarget = {
              type: 'TARGET_FLIP_THREE',
              source_id: p.id,
              card: card,
              valid_targets: others.map(pl => pl.id)
            };
            result.outcome = 'pending_flip_three';
            this.lastDrawResult = result;
            this.checkBotTarget();
            return;
          }
        }
      }

      this.lastDrawResult = result;
      if (autoAdvance && !this.pendingTarget && this.state === 'playing') {
        this.advanceTurn();
      }
    }

    stay() {
      const p = this.currentPlayer();
      if (!p || p.roundStatus !== 'active' || this.state !== 'playing') return;
      p.roundStatus = 'stayed';
      const pts = this.computeScore(p);
      this.log(window.t('logStayed', p.name, pts));
      this.advanceTurn();
    }

    resolveTarget(targetId) {
      if (!this.pendingTarget) return;
      const { type, source_id, valid_targets, card } = this.pendingTarget;
      const source = this.players.find(p => p.id === source_id);
      const target = this.players.find(p => p.id === targetId);
      if (!target || !valid_targets.includes(targetId)) return;

      const sName = source ? source.name : 'Player';
      const tName = target.name;

      if (type === 'TARGET_FREEZE') {
        target.roundStatus = 'frozen';
        if (card) this.discardPile.push(card);
        const pts = this.computeScore(target);
        this.log(window.t('logFroze', sName, tName, pts));
        this.pendingTarget = null;
        this.advanceTurn();
      } else if (type === 'GIFT_SECOND_CHANCE') {
        target.hasSecondChance = true;
        target.secondChanceCard = card;
        this.log(window.t('logGiftedShield', sName, tName));
        this.pendingTarget = null;
        this.advanceTurn();
      } else if (type === 'TARGET_FLIP_THREE') {
        if (card) this.discardPile.push(card);
        this.log(window.t('logFlipThreeUsed', sName, tName));
        this.pendingTarget = null;
        this.runFlipThree(target);
      }
    }

    async runFlipThree(target) {
      for (let step = 1; step <= 3; step++) {
        if (this.state !== 'playing' || target.roundStatus !== 'active') break;
        await new Promise(r => setTimeout(r, 1000));

        const card = this.drawCard();
        this.lastCardDrawn = card;
        const result = { card, player: target.id, step };

        if (card.type === 'number') {
          const val = card.value;
          if (target.numberCards.includes(val)) {
            if (target.hasSecondChance) {
              target.hasSecondChance = false;
              this.discardPile.push(card);
              if (target.secondChanceCard) {
                this.discardPile.push(target.secondChanceCard);
                target.secondChanceCard = null;
              }
              result.outcome = 'shield_saved';
              this.log(window.t('logShieldSaved', target.name, val));
            } else {
              target.roundStatus = 'busted';
              target.bustedCard = card;
              this.discardPile.push(card);
              if (target.handCards && target.handCards.length > 0) {
                this.discardPile.push(...target.handCards);
                target.handCards = [];
              }
              if (target.secondChanceCard) {
                this.discardPile.push(target.secondChanceCard);
                target.secondChanceCard = null;
              }
              result.outcome = 'busted';
              this.log(window.t('logBusted', target.name, val));
              this.lastDrawResult = result;
              renderLocalState();
              break;
            }
          } else {
            target.numberCards.push(val);
            target.handCards.push(card);
            result.outcome = 'safe_number';
            this.log(window.t('logHitSafe', target.name, val, target.numberCards.length));
            if (target.numberCards.length >= 7) {
              target.flippedSeven = true;
              result.outcome = 'flip_seven';
              this.log(window.t('logFlip7', target.name));
              this.lastDrawResult = result;
              renderLocalState();
              this.endRound(`${target.name} FLIP 7!`);
              renderLocalState();
              return;
            }
          }
        } else if (card.type === 'modifier') {
          target.modifierCards.push(card);
          target.handCards.push(card);
          result.outcome = 'modifier';
          this.log(window.t('logModifier', target.name, card.name));
        } else if (card.type === 'action') {
          if (card.action === 'second_chance' && !target.hasSecondChance) {
            target.hasSecondChance = true;
            target.secondChanceCard = card;
            result.outcome = 'second_chance_gained';
            this.log(window.t('logShieldGained', target.name));
          } else {
            this.discardPile.push(card);
          }
        }

        this.lastDrawResult = result;
        renderLocalState();
      }

      await new Promise(r => setTimeout(r, 800));
      if (this.state === 'playing') {
        this.advanceTurn();
        renderLocalState();
      }
    }

    endRound(reason = '') {
      clearTimeout(this.inactivityTimer);
      this.turnDeadline = null;
      this.state = 'round_recap';
      this.players.forEach(p => {
        const pts = this.computeScore(p);
        p.totalScore += pts;
      });

      this.log(window.t('logRoundEnd', this.roundNumber, reason));

      const winners = this.players.filter(p => p.totalScore >= this.targetScore);
      if (winners.length > 0) {
        this.state = 'game_over';
        this.winner = [...this.players].sort((a, b) => b.totalScore - a.totalScore)[0];
        this.log(window.t('logGameOver', this.winner.name, this.winner.totalScore));
      } else {
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
      }
    }

    scheduleInactivityTimer(actor) {
      clearTimeout(this.inactivityTimer);
      this.turnDeadline = null;
      if (this.state !== 'playing' || !actor || actor.isBot || actor.isAutoPlay) return;
      this.turnDeadline = (Date.now() / 1000) + 60;
      this.inactivityTimer = setTimeout(() => {
        if (this.state !== 'playing') return;
        const curActor = this.pendingTarget
          ? this.players.find(p => p.id === this.pendingTarget.source_id)
          : this.currentPlayer();
        if (!curActor || curActor.id !== actor.id || curActor.isBot || curActor.isAutoPlay) return;
        curActor.isAutoPlay = true;
        this.turnDeadline = null;
        this.log(`🤖 ${curActor.name} 超过 60 秒未行动，已自动进入 AI 托管模式！`);
        renderLocalState();
        if (this.pendingTarget) this.checkBotTarget();
        else this.checkBotTurn();
      }, 60000);
    }

    checkBotTurn() {
      clearTimeout(this.inactivityTimer);
      this.turnDeadline = null;
      if (this.state !== 'playing') return;
      const cur = this.currentPlayer();
      if (!cur || cur.roundStatus !== 'active') return;
      if (!cur.isBot && !cur.isAutoPlay) {
        this.scheduleInactivityTimer(cur);
        return;
      }

      setTimeout(() => {
        if (this.state !== 'playing' || this.currentPlayer() !== cur || (!cur.isBot && !cur.isAutoPlay)) return;
        const stats = this.getStats(cur);
        const pts = this.computeScore(cur);
        let shouldHit = true;

        if (cur.numberCards.length === 0) {
          shouldHit = true;
        } else if (cur.numberCards.length === 6) {
          shouldHit = cur.hasSecondChance || stats.bustRiskPct < 50 || cur.botPersonality === 'risk_taker';
        } else {
          if (cur.botPersonality === 'cautious') {
            if (pts >= 22 || (cur.numberCards.length >= 4 && stats.bustRiskPct > 25 && !cur.hasSecondChance)) shouldHit = false;
          } else if (cur.botPersonality === 'risk_taker') {
            if (pts >= 45 && stats.bustRiskPct > 50 && !cur.hasSecondChance) shouldHit = false;
            else if (stats.bustRiskPct > 65 && !cur.hasSecondChance) shouldHit = false;
          } else { // balanced
            if (cur.hasSecondChance) shouldHit = true;
            else if (pts >= 30 && stats.bustRiskPct > 38) shouldHit = false;
            else if (stats.bustRiskPct > 45) shouldHit = false;
          }
        }

        if (shouldHit) {
          executeLocalHit(this);
        } else {
          this.stay();
          renderLocalState();
        }
      }, 1200);
    }

    checkBotTarget() {
      clearTimeout(this.inactivityTimer);
      this.turnDeadline = null;
      if (!this.pendingTarget) return;
      const source = this.players.find(p => p.id === this.pendingTarget.source_id);
      if (!source) return;
      if (!source.isBot && !source.isAutoPlay) {
        this.scheduleInactivityTimer(source);
        return;
      }

      setTimeout(() => {
        if (!this.pendingTarget || (!source.isBot && !source.isAutoPlay)) return;
        const valid = this.pendingTarget.valid_targets;
        let targetId = valid[0];

        if (this.pendingTarget.type === 'TARGET_FREEZE') {
          const opps = valid.map(id => this.players.find(p => p.id === id)).filter(p => p && p.id !== source.id);
          if (opps.length > 0) {
            targetId = opps.sort((a, b) => (b.numberCards.length + b.roundScore) - (a.numberCards.length + a.roundScore))[0].id;
          }
        } else if (this.pendingTarget.type === 'TARGET_FLIP_THREE') {
          if (source.hasSecondChance && valid.includes(source.id) && source.numberCards.length <= 4) {
            targetId = source.id;
          } else {
            const opps = valid.map(id => this.players.find(p => p.id === id)).filter(p => p && p.id !== source.id);
            if (opps.length > 0) {
              targetId = opps.sort((a, b) => b.numberCards.length - a.numberCards.length)[0].id;
            }
          }
        }
        this.resolveTarget(targetId);
        renderLocalState();
      }, 1200);
    }

    getStats(player) {
      const remaining = this.deck.length;
      if (remaining === 0) return { totalRemaining: 0, duplicatesInDeck: 0, bustRiskPct: 0 };
      let dupCount = 0;
      if (player && player.numberCards.length > 0) {
        const held = new Set(player.numberCards);
        this.deck.forEach(c => {
          if (c.type === 'number' && held.has(c.value)) dupCount++;
        });
      }
      return {
        totalRemaining: remaining,
        discardCount: this.discardPile.length,
        duplicatesInDeck: dupCount,
        bustRiskPct: Math.round((dupCount / remaining) * 1000) / 10
      };
    }

    toDict() {
      const cur = this.currentPlayer();
      this.players.forEach(p => this.computeScore(p));
      return {
        roomCode: 'LOCAL',
        hostId: this.players[0].id,
        targetScore: this.targetScore,
        showOdds: this.showOdds,
        state: this.state,
        roundNumber: this.roundNumber,
        dealerId: this.players[this.dealerIndex].id,
        currentTurnPlayerId: cur ? cur.id : null,
        turnDeadline: this.turnDeadline,
        serverTime: Date.now() / 1000,
        players: this.players,
        lastCardDrawn: this.lastCardDrawn,
        lastDrawResult: this.lastDrawResult,
        pendingTarget: this.pendingTarget,
        deckStats: this.getStats(cur),
        gameLog: this.gameLog.slice(-20),
        winner: this.winner
      };
    }
  }

  async function executeLocalHit(g) {
    if (!g || g.state !== 'playing' || g.isProcessing) return;
    g.isProcessing = true;
    el.btnHit.disabled = true;
    el.btnStay.disabled = true;

    try {
      g.hit(false);
      const res = g.lastDrawResult;
      if (!res) {
        renderLocalState();
        return;
      }

      const isSafe = (res.outcome === 'safe_number' || res.outcome === 'modifier' || res.outcome === 'second_chance_gained' || res.outcome === 'flip_seven');

      if (res.outcome === 'busted') {
        sfx.playBust();
        state.animatingCard = null;
        renderLocalState();
        if (el.revealedCardContainer) {
          el.revealedCardContainer.classList.remove('card-bust-shake');
          void el.revealedCardContainer.offsetWidth;
          el.revealedCardContainer.classList.add('card-bust-shake');
        }
        await new Promise(r => setTimeout(r, 850));
      } else if (res.outcome === 'shield_saved') {
        sfx.playShieldSave();
        state.animatingCard = null;
        renderLocalState();
        await new Promise(r => setTimeout(r, 850));
      } else if (isSafe) {
        if (res.outcome === 'flip_seven') {
          sfx.playFlipSeven();
          confetti.explode(160);
        } else {
          sfx.playCardFlip();
        }

        state.animatingCard = res.card;
        renderLocalState();
        if (el.revealedCardContainer) {
          el.revealedCardContainer.classList.remove('card-reveal-pop');
          void el.revealedCardContainer.offsetWidth;
          el.revealedCardContainer.classList.add('card-reveal-pop');
        }

        // Show card clearly in center for 400ms
        await new Promise(r => setTimeout(r, 400));

        if (state.localGame === g) {
          await animateCenterCardFlyToWebBoard(res.card);
        }
      } else {
        // Pending action
        sfx.playCardFlip();
        state.animatingCard = null;
        renderLocalState();
        await new Promise(r => setTimeout(r, 650));
      }

      if (!state.localGame || state.localGame !== g) return;

      if (g.pendingTarget) {
        return;
      }

      if (g.state === 'playing') {
        g.advanceTurn();
      }
    } finally {
      if (g) g.isProcessing = false;
      state.animatingCard = null;
      renderLocalState();
      if (g && g.state === 'playing') {
        if (g.pendingTarget) g.checkBotTarget();
        else g.checkBotTurn();
      }
    }
  }

  function handleLocalAction(type, data) {
    if (!state.localGame) return;
    const g = state.localGame;
    const cur = g.currentPlayer();

    if (type === 'HIT') {
      if (cur && cur.isAutoPlay) cur.isAutoPlay = false;
      executeLocalHit(g);
      return;
    }
    else if (type === 'STAY') {
      if (cur && cur.isAutoPlay) cur.isAutoPlay = false;
      g.stay();
    }
    else if (type === 'SELECT_TARGET') {
      const src = g.pendingTarget ? g.players.find(p => p.id === g.pendingTarget.source_id) : null;
      if (src && src.isAutoPlay) src.isAutoPlay = false;
      g.resolveTarget(data.targetPlayerId);
    }
    else if (type === 'SET_AUTO_PLAY') {
      const p = g.players.find(pl => pl.id === state.playerId) || cur;
      if (p && !p.isBot) {
        p.isAutoPlay = !!data.enabled;
        if (p.isAutoPlay) {
          g.log(`🤖 ${p.name} 开启了 AI 托管模式。`);
          if (g.pendingTarget) g.checkBotTarget();
          else g.checkBotTurn();
        } else {
          g.log(`👤 ${p.name} 取消了 AI 托管，恢复手动操作。`);
          g.scheduleInactivityTimer(p);
        }
      }
    }
    else if (type === 'NEXT_ROUND') g.startNewRound();
    else if (type === 'RESTART_GAME') {
      g.players.forEach(p => {
        p.totalScore = 0;
        p.handCards = [];
        p.secondChanceCard = null;
        p.bustedCard = null;
      });
      g.deck = g.buildDeck();
      g.discardPile = [];
      g.roundNumber = 0;
      g.dealerIndex = 0;
      g.winner = null;
      g.startNewRound();
    }
    renderLocalState();
  }

  function renderLocalState() {
    if (!state.isLocalMode || !state.localGame) return;
    const dict = state.localGame.toDict();
    updateGameState(dict);
  }

  // ============================================================================
  // State Rendering Pipeline
  // ============================================================================

  function updateTurnTimerUI() {
    if (!el.turnTimerBadge) return;
    if (!state.roomData || state.roomData.state !== 'playing' || !state.turnDeadlineLocal) {
      el.turnTimerBadge.classList.add('hidden');
      return;
    }
    const rem = Math.max(0, Math.ceil((state.turnDeadlineLocal - Date.now()) / 1000));
    el.turnTimerBadge.classList.remove('hidden');
    el.turnTimerBadge.textContent = `⏳ ${rem}s`;
    el.turnTimerBadge.className = 'turn-timer-badge ' + (rem <= 10 ? 'timer-danger' : (rem <= 20 ? 'timer-warn' : ''));
  }

  setInterval(updateTurnTimerUI, 500);

  function updateGameState(room) {
    state.roomData = room;
    if (room.turnDeadline && room.serverTime && room.state === 'playing') {
      const remainingMs = (room.turnDeadline - room.serverTime) * 1000;
      state.turnDeadlineLocal = Date.now() + Math.max(0, remainingMs);
    } else {
      state.turnDeadlineLocal = null;
    }
    updateTurnTimerUI();

    const curP = room.players.find(p => p.id === room.currentTurnPlayerId);

    // In local mode, the active device user is whoever is currently on turn!
    if (state.isLocalMode) {
      state.playerId = curP ? curP.id : room.players[0].id;
      state.isHost = true;
      el.tabBtnChat.style.display = 'none';
      el.reactionsBar.style.display = 'none';
    } else {
      state.isHost = (room.hostId === state.playerId);
      el.tabBtnChat.style.display = '';
      el.reactionsBar.style.display = '';
    }

    if (room.state === 'lobby') {
      showScreen(el.screenRoomLobby);
      renderLobby(room);
    } else if (room.state === 'playing') {
      showScreen(el.screenGame);
      renderGameTable(room);
      closeModals();
    } else if (room.state === 'round_recap') {
      showScreen(el.screenGame);
      renderGameTable(room);
      renderRoundRecap(room);
    } else if (room.state === 'game_over') {
      showScreen(el.screenGame);
      renderGameTable(room);
      renderGameOver(room);
    }

    renderSidebar(room);
    checkPendingTarget(room);
  }

  function renderLobby(room) {
    el.lobbyRoomCode.textContent = room.roomCode;
    el.lobbyTargetScore.textContent = room.targetScore;
    if (el.lobbyShowOdds) {
      el.lobbyShowOdds.textContent = (room.showOdds !== false) ? window.t('oddsEnabled') : window.t('oddsHidden');
    }
    el.lobbyPlayerCount.textContent = room.players.length;

    el.lobbyPlayerList.innerHTML = room.players.map(p => `
      <div class="lobby-player-card ${p.id === room.hostId ? 'is-host' : ''} ${p.isConnected === false ? 'is-offline' : ''}">
        <span class="p-avatar">${p.avatar}</span>
        <div class="p-info">
          <span class="p-name">
            ${escapeHTML(p.name)}
            ${p.isConnected === false ? `<span class="badge-offline">${window.t('offlineTag')}</span>` : ''}
          </span>
          <span class="p-role">${p.id === room.hostId ? window.t('tableHost') : (p.isBot ? `🤖 ${window.t('botLabel')} (${p.botPersonality})` : window.t('playerLabel'))}</span>
        </div>
        ${state.isHost && p.id !== room.hostId ? `<button class="btn-remove-player" data-pid="${p.id}" title="${window.t('removeLabel')}">✕</button>` : ''}
      </div>
    `).join('');

    el.lobbyPlayerList.querySelectorAll('.btn-remove-player').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pid = e.target.getAttribute('data-pid');
        sendWS('REMOVE_PLAYER', { targetPlayerId: pid });
      });
    });

    if (state.isHost) {
      el.hostControls.classList.remove('hidden');
      el.guestControls.classList.add('hidden');
    } else {
      el.hostControls.classList.add('hidden');
      el.guestControls.classList.remove('hidden');
    }
  }

  // ============================================================================
  // Card Flight to Board Animation
  // ============================================================================

  async function animateCenterCardFlyToWebBoard(card) {
    if (!card) return;
    const isNumber = (card.type === 'number');
    const targetContainer = isNumber ? el.myNumberCards : el.mySpecialCards;
    if (!targetContainer) return;

    // 1. Measure landing slot in hand using ghost element
    const hint = targetContainer.querySelector('.empty-hint');
    if (hint) hint.style.display = 'none';

    const ghost = document.createElement('div');
    ghost.className = 'game-card card-target-ghost';
    ghost.style.cssText = 'visibility:hidden;pointer-events:none;flex-shrink:0;margin:0;';
    targetContainer.appendChild(ghost);
    const targetRect = ghost.getBoundingClientRect();
    ghost.remove();
    if (hint) hint.style.display = '';

    // 2. Measure center card
    const centerCard = el.revealedCardContainer.querySelector('.game-card') || el.revealedCardContainer;
    const srcRect = centerCard.getBoundingClientRect();

    if (srcRect.width === 0 || targetRect.width === 0) {
      state.animatingCard = null;
      if (state.isLocalMode) renderLocalState();
      else if (state.roomData) renderGameTable(state.roomData);
      return;
    }

    // 3. Create flyer matching center card exactly
    const flyer = centerCard.cloneNode(true);
    flyer.className = centerCard.className + ' flying-card-anim';
    Object.assign(flyer.style, {
      position: 'fixed',
      left: `${srcRect.left}px`,
      top: `${srcRect.top}px`,
      width: `${srcRect.width}px`,
      height: `${srcRect.height}px`,
      zIndex: '99999',
      margin: '0',
      pointerEvents: 'none',
      transformOrigin: 'top left',
      boxShadow: '0 24px 50px rgba(0,0,0,0.85), 0 0 35px rgba(245, 158, 11, 0.6)'
    });
    document.body.appendChild(flyer);

    // 4. CLEAR center card spot so user sees the card physically taking off!
    el.revealedCardContainer.classList.add('hidden');
    el.revealedCardContainer.innerHTML = '';
    el.lastCardPlaceholder.classList.remove('hidden');
    if (state.localGame) state.localGame.lastCardDrawn = null;

    // 5. Calculate trajectory and scale down to hand size
    const dx = targetRect.left - srcRect.left;
    const dy = targetRect.top - srcRect.top;
    const scaleX = targetRect.width / srcRect.width;
    const scaleY = targetRect.height / srcRect.height;

    const anim = flyer.animate([
      {
        transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
        opacity: 1
      },
      {
        transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 30}px) scale(${1 + (scaleX - 1) * 0.25}) rotate(-3deg)`,
        opacity: 1,
        offset: 0.45
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY}) rotate(0deg)`,
        opacity: 1
      }
    ], {
      duration: 520,
      easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
      fill: 'forwards'
    });

    await new Promise(r => {
      anim.onfinish = () => {
        flyer.remove();
        r();
      };
    });

    // 6. Dock the card into hand
    state.animatingCard = null;
    if (state.isLocalMode) renderLocalState();
    else if (state.roomData) renderGameTable(state.roomData);

    const newCardEl = targetContainer.querySelector('.game-card:last-of-type');
    if (newCardEl) {
      newCardEl.classList.add('card-just-landed');
      setTimeout(() => newCardEl.classList.remove('card-just-landed'), 400);
    }

    el.myHandScore.classList.add('score-pop');
    setTimeout(() => el.myHandScore.classList.remove('score-pop'), 400);

    // Wait a brief moment to see card docked
    await new Promise(r => setTimeout(r, 320));
  }

  async function animateCenterCardFlyToOpponent(card, opponentId) {
    if (!card || !opponentId) return;
    const seats = el.otherPlayersArena.querySelectorAll('.opponent-seat');
    let targetSeat = null;
    if (state.roomData && state.roomData.players) {
      const oppIdx = state.roomData.players.findIndex(p => p.id === opponentId);
      if (oppIdx !== -1 && seats[oppIdx]) targetSeat = seats[oppIdx];
    }
    if (!targetSeat && seats.length > 0) targetSeat = seats[0];
    if (!targetSeat) return;

    const targetRect = targetSeat.getBoundingClientRect();
    const centerCard = el.revealedCardContainer.querySelector('.game-card') || el.revealedCardContainer;
    const srcRect = centerCard.getBoundingClientRect();
    if (srcRect.width === 0 || targetRect.width === 0) return;

    const flyer = centerCard.cloneNode(true);
    flyer.className = centerCard.className + ' flying-card-anim';
    Object.assign(flyer.style, {
      position: 'fixed',
      left: `${srcRect.left}px`,
      top: `${srcRect.top}px`,
      width: `${srcRect.width}px`,
      height: `${srcRect.height}px`,
      zIndex: '99999',
      margin: '0',
      pointerEvents: 'none',
      transformOrigin: 'top left',
      boxShadow: '0 20px 45px rgba(0,0,0,0.75), 0 0 25px rgba(245, 158, 11, 0.5)'
    });
    document.body.appendChild(flyer);

    el.revealedCardContainer.classList.add('hidden');
    el.revealedCardContainer.innerHTML = '';
    el.lastCardPlaceholder.classList.remove('hidden');

    const dx = targetRect.left + (targetRect.width - 50) / 2 - srcRect.left;
    const dy = targetRect.top + 20 - srcRect.top;
    const scale = 50 / srcRect.width;

    const anim = flyer.animate([
      { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 20}px) scale(${1 + (scale - 1) * 0.3}) rotate(-3deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale}, ${scale}) rotate(0deg)`, opacity: 0.9 }
    ], {
      duration: 480,
      easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
      fill: 'forwards'
    });

    await new Promise(r => {
      anim.onfinish = () => {
        flyer.remove();
        targetSeat.classList.add('card-just-landed');
        setTimeout(() => targetSeat.classList.remove('card-just-landed'), 380);
        r();
      };
    });
  }

  function syncHandCards(container, cardItems, isNumbers, playerId) {
    if (!container) return;
    if (cardItems.length === 0) {
      container._lastPlayerId = playerId;
      const hintKey = isNumbers ? 'noNumbersYet' : 'none';
      if (!container.querySelector('.empty-hint')) {
        container.innerHTML = `<span class="empty-hint">${window.t(hintKey)}</span>`;
      }
      return;
    }

    const isDifferentPlayer = (container._lastPlayerId !== playerId);
    container._lastPlayerId = playerId;

    const hint = container.querySelector('.empty-hint');
    if (hint) hint.remove();

    const existingCards = Array.from(container.querySelectorAll('.game-card'));

    if (!isDifferentPlayer && existingCards.length < cardItems.length) {
      // Append only newly added cards without touching existing ones! Zero flicker!
      for (let i = existingCards.length; i < cardItems.length; i++) {
        const item = cardItems[i];
        const cardHTML = isNumbers 
          ? renderCardHTML(item, 'number')
          : (item === 'Heart' || (item && item.action === 'second_chance')
              ? renderCardHTML('Heart', 'action', { action: 'second_chance' })
              : renderCardHTML(item.name || item, 'modifier', item));
        const temp = document.createElement('div');
        temp.innerHTML = cardHTML.trim();
        const newEl = temp.firstElementChild;
        container.appendChild(newEl);
      }
    } else if (isDifferentPlayer || existingCards.length > cardItems.length) {
      // Turn changed, busted, or reset
      container.innerHTML = cardItems.map(item => {
        return isNumbers 
          ? renderCardHTML(item, 'number')
          : (item === 'Heart' || (item && item.action === 'second_chance')
              ? renderCardHTML('Heart', 'action', { action: 'second_chance' })
              : renderCardHTML(item.name || item, 'modifier', item));
      }).join('');
    }
  }

  function renderGameTable(room) {
    el.gameRoundNum.textContent = room.roundNumber;
    el.gameTargetScore.textContent = room.targetScore;

    const curPlayer = room.players.find(p => p.id === room.currentTurnPlayerId);
    const myPlayer = room.players.find(p => p.id === state.playerId);
    const isMyTurn = (room.currentTurnPlayerId === state.playerId && myPlayer && myPlayer.roundStatus === 'active');

    // Turn banner & Local Pass Device Banner
    if (curPlayer) {
      el.turnPlayerName.textContent = isMyTurn ? (state.isLocalMode ? `${curPlayer.avatar} ${curPlayer.name}` : window.t('yourTurn')) : `${curPlayer.name}`;
      if (state.isLocalMode && !curPlayer.isBot) {
        el.localPassBanner.classList.remove('hidden');
        el.localPassText.textContent = `${window.t('passToPrompt')} ${curPlayer.avatar} ${curPlayer.name}`;
      } else {
        el.localPassBanner.classList.add('hidden');
      }
    } else {
      el.localPassBanner.classList.add('hidden');
    }

    // Deck HUD
    const showOdds = (room.showOdds !== false);
    if (showOdds) {
      el.oddsHud.classList.remove('hidden');
    } else {
      el.oddsHud.classList.add('hidden');
    }

    const stats = room.deckStats || { totalRemaining: 94, duplicatesInDeck: 0, bustRiskPct: 0 };
    el.deckRemainingCount.textContent = stats.totalRemaining;
    el.discardCount.textContent = stats.discardCount || 0;
    el.hudCardsLeft.textContent = stats.totalRemaining;
    el.hudDupCount.textContent = stats.duplicatesInDeck;

    el.hudBustPct.textContent = `${stats.bustRiskPct}%`;
    el.hudBustPct.className = 'hud-value ' + (stats.bustRiskPct < 25 ? 'safe' : (stats.bustRiskPct < 50 ? 'warning' : 'danger'));

    // Player Seats (All Players on the table, including oneself)
    renderPlayerSeats(room.players, room.currentTurnPlayerId, state.playerId);

    // My Board
    if (myPlayer) {
      el.myAvatar.textContent = myPlayer.avatar;
      el.myName.textContent = myPlayer.name;

      let numbersToShow = [...myPlayer.numberCards];
      let modifiersToShow = [...myPlayer.modifierCards];
      let hasSecondChanceToShow = myPlayer.hasSecondChance;

      if (state.animatingCard) {
        if (state.animatingCard.type === 'number') {
          const idx = numbersToShow.lastIndexOf(state.animatingCard.value);
          if (idx !== -1) numbersToShow.splice(idx, 1);
        } else if (state.animatingCard.type === 'modifier') {
          const idx = modifiersToShow.findLastIndex ? modifiersToShow.findLastIndex(m => m.id === state.animatingCard.id) : (modifiersToShow.length - 1);
          if (idx !== -1) modifiersToShow.splice(idx, 1);
        } else if (state.animatingCard.type === 'action' && state.animatingCard.action === 'second_chance') {
          hasSecondChanceToShow = false;
        }
      }

      const numSum = numbersToShow.reduce((acc, v) => acc + v, 0);
      const hasX2 = modifiersToShow.some(m => m.name === 'x2');
      const addBonus = modifiersToShow.filter(m => m.name !== 'x2').reduce((acc, m) => acc + m.value, 0);
      const flip7Bonus = (numbersToShow.length >= 7) ? 15 : 0;
      const displayRoundScore = (myPlayer.roundStatus === 'busted') ? 0 : (((numSum + addBonus) * (hasX2 ? 2 : 1)) + flip7Bonus);

      el.myHandScore.textContent = displayRoundScore;
      el.myTotalScore.textContent = myPlayer.totalScore;
      el.myNumberCount.textContent = numbersToShow.length;

      el.myStatusPill.className = `my-status-pill tag-${myPlayer.roundStatus}`;
      const statusKey = `status${myPlayer.roundStatus.charAt(0).toUpperCase() + myPlayer.roundStatus.slice(1)}`;
      el.myStatusPill.textContent = window.t(statusKey);

      // AI Auto-Play Toggle & Banner
      if (el.btnToggleAutoplay) {
        if (myPlayer.isBot) {
          el.btnToggleAutoplay.classList.add('hidden');
        } else {
          el.btnToggleAutoplay.classList.remove('hidden');
          el.btnToggleAutoplay.classList.toggle('is-active', !!myPlayer.isAutoPlay);
          el.btnToggleAutoplay.textContent = myPlayer.isAutoPlay ? window.t('disableAutoPlayBtn') : window.t('enableAutoPlayBtn');
        }
      }
      if (el.autoplayBanner) {
        if (!myPlayer.isBot && myPlayer.isAutoPlay) {
          el.autoplayBanner.classList.remove('hidden');
        } else {
          el.autoplayBanner.classList.add('hidden');
        }
      }

      if (isMyTurn) {
        el.myPlayerBoard.classList.add('is-my-turn');
      } else {
        el.myPlayerBoard.classList.remove('is-my-turn');
      }

      // Hand Cards with Zero-Flicker Synchronizer
      const specialsToShow = [];
      if (hasSecondChanceToShow) {
        specialsToShow.push('Heart');
      }
      modifiersToShow.forEach(m => specialsToShow.push(m));

      syncHandCards(el.myNumberCards, numbersToShow, true, myPlayer.id);
      syncHandCards(el.mySpecialCards, specialsToShow, false, myPlayer.id);

      // Controls
      const canAct = isMyTurn && !myPlayer.isBot && !state.animatingCard;
      el.btnHit.disabled = !canAct;
      el.btnStay.disabled = !canAct;

      if (canAct) {
        if (showOdds) {
          el.hitSublabel.textContent = `${window.t('bustRiskLabel')} ${stats.bustRiskPct}%`;
        } else {
          el.hitSublabel.textContent = window.t('hitBtnSublabelNoOdds');
        }
        el.staySublabel.textContent = `${window.t('staySublabel')} (${myPlayer.roundScore})`;
      } else {
        el.hitSublabel.textContent = window.t('waitingTurn');
        el.staySublabel.textContent = window.t('locked');
      }
    }

    // Last Drawn Card Slot
    const cardToShowInCenter = state.animatingCard || room.lastCardDrawn;
    if (cardToShowInCenter) {
      el.lastCardPlaceholder.classList.add('hidden');
      el.revealedCardContainer.classList.remove('hidden');
      el.revealedCardContainer.innerHTML = renderCardLargeHTML(cardToShowInCenter);

      if (!state.isLocalMode && room.lastDrawResult && room.lastDrawResult.card && room.lastDrawResult.card.id !== state.lastSeenDrawId) {
        state.lastSeenDrawId = room.lastDrawResult.card.id;
        const out = room.lastDrawResult.outcome;
        if (out === 'busted') sfx.playBust();
        else if (out === 'shield_saved') sfx.playShieldSave();
        else if (out === 'pending_freeze') sfx.playFreeze();
        else if (out === 'flip_seven') {
          sfx.playFlipSeven();
          confetti.explode(160);
        } else {
          sfx.playCardFlip();
        }

        const isSafe = (out === 'safe_number' || out === 'modifier' || out === 'shield_gained' || out === 'second_chance_gained');
        if (isSafe && room.lastDrawResult.player === state.playerId) {
          animateCenterCardFlyToWebBoard(room.lastDrawResult.card);
        } else if (isSafe && room.lastDrawResult.player !== state.playerId) {
          animateCenterCardFlyToOpponent(room.lastDrawResult.card, room.lastDrawResult.player);
        }
      }
    } else {
      el.lastCardPlaceholder.classList.remove('hidden');
      el.revealedCardContainer.classList.add('hidden');
      el.revealedCardContainer.innerHTML = '';
    }
  }

  function renderPlayerSeats(players, turnPlayerId, myPlayerId) {
    el.otherPlayersArena.innerHTML = players.map(p => {
      const isMe = (p.id === myPlayerId);
      const isTurn = (p.id === turnPlayerId);
      const isBusted = (p.roundStatus === 'busted');
      const isFrozen = (p.roundStatus === 'frozen');
      const isStayed = (p.roundStatus === 'stayed');

      let cardsMiniHTML = '';
      if (p.hasSecondChance) {
        cardsMiniHTML += `<div class="mini-card mini-heart" title="${window.t('extraLifeTitle') || 'Extra Life'}">❤️</div>`;
      }
      p.numberCards.forEach(n => {
        cardsMiniHTML += `<div class="mini-card mini-num-${n}">${n}</div>`;
      });
      if (isBusted && p.bustedCard) {
        const bVal = (p.bustedCard.value !== undefined) ? p.bustedCard.value : (p.bustedCard.name || '?');
        cardsMiniHTML += `<div class="mini-card mini-busted" title="${window.t('bustedCardTooltip')} ${bVal}">💥${bVal}</div>`;
      }
      p.modifierCards.forEach(m => {
        const isX2 = (m.name === 'x2');
        cardsMiniHTML += `<div class="mini-card ${isX2 ? 'mini-x2' : 'mini-mod'}">${m.name}</div>`;
      });

      const statusKey = `status${p.roundStatus.charAt(0).toUpperCase() + p.roundStatus.slice(1)}`;

      return `
        <div class="opponent-seat ${isMe ? 'is-me' : ''} ${isTurn ? 'is-turn' : ''} ${isBusted ? 'is-busted' : ''} ${isFrozen ? 'is-frozen' : ''} ${isStayed ? 'is-stayed' : ''} ${p.isConnected === false ? 'is-offline' : ''}">
          <div class="seat-header">
            <div class="seat-avatar-name">
              <span class="seat-avatar">${p.avatar}</span>
              <span class="seat-name" title="${escapeHTML(p.name)}">
                ${escapeHTML(p.name)}
                ${isMe ? `<span class="seat-me-tag">${window.t('youTag')}</span>` : ''}
                ${p.isAutoPlay ? `<span class="seat-auto-tag">${window.t('autoPlayTag')}</span>` : ''}
                ${p.isConnected === false ? `<span class="seat-offline-tag">${window.t('offlineTag')}</span>` : ''}
              </span>
            </div>
            <span class="seat-score">${p.roundScore} <small style="color:#94a3b8">/ ${p.totalScore}</small></span>
          </div>
          <span class="seat-status-tag tag-${p.roundStatus}">${window.t(statusKey)}</span>
          <div class="seat-cards-mini">
            ${cardsMiniHTML || `<span style="font-size:0.7rem;color:rgba(255,255,255,0.3)">${window.t('none')}</span>`}
          </div>
        </div>
      `;
    }).join('');
  }

  const CARD_META = {
    0: { sym: '✦', count: 1, descZh: '牌库共 1 张', descEn: '1 in deck' },
    1: { sym: '☀️', count: 1, descZh: '牌库共 1 张', descEn: '1 in deck' },
    2: { sym: '☘️', count: 2, descZh: '牌库共 2 张', descEn: '2 in deck' },
    3: { sym: '🌊', count: 3, descZh: '牌库共 3 张', descEn: '3 in deck' },
    4: { sym: '💎', count: 4, descZh: '牌库共 4 张', descEn: '4 in deck' },
    5: { sym: '🔮', count: 5, descZh: '牌库共 5 张', descEn: '5 in deck' },
    6: { sym: '🌸', count: 6, descZh: '牌库共 6 张', descEn: '6 in deck' },
    7: { sym: '🌟', count: 7, descZh: '牌库共 7 张', descEn: '7 in deck' },
    8: { sym: '⚡', count: 8, descZh: '牌库共 8 张', descEn: '8 in deck' },
    9: { sym: '🔥', count: 9, descZh: '牌库共 9 张', descEn: '9 in deck' },
    10: { sym: '☄️', count: 10, descZh: '牌库共 10 张', descEn: '10 in deck' },
    11: { sym: '👑', count: 11, descZh: '牌库共 11 张', descEn: '11 in deck' },
    12: { sym: '🐉', count: 12, descZh: '牌库共 12 张', descEn: '12 in deck' },
  };

  function renderCardHTML(val, type, meta = {}) {
    const isZh = (window.getCurrentLanguage() === 'zh');
    if (type === 'number') {
      const n = parseInt(val, 10);
      const m = CARD_META[n] || { sym: '•', count: n };
      const isSeven = (n === 7);

      return `
        <div class="game-card card-num-${n} ${isSeven ? 'is-lucky-seven' : ''}">
          <div class="card-holo-sheen"></div>
          <div class="card-corner top-corner">
            <span class="corner-val">${n}</span>
            <span class="corner-sym">${m.sym}</span>
          </div>
          <div class="card-inner-frame">
            <div class="card-center">
              <span class="card-watermark">${m.sym}</span>
              <span class="card-center-num">${n}</span>
            </div>
            <div class="card-deck-indicator">×${m.count}</div>
          </div>
          <div class="card-corner bottom-corner">
            <span class="corner-val">${n}</span>
            <span class="corner-sym">${m.sym}</span>
          </div>
        </div>
      `;
    } else if (type === 'modifier') {
      const isX2 = (val === 'x2');
      if (isX2) {
        return `
          <div class="game-card card-mod-x2">
            <div class="card-holo-sheen"></div>
            <div class="card-corner top-corner">
              <span class="corner-val">✖️2</span>
              <span class="corner-sym">⚡</span>
            </div>
            <div class="card-inner-frame">
              <div class="card-center">
                <span class="card-watermark">⚡</span>
                <span class="card-center-num">✖️2</span>
              </div>
              <div class="card-deck-indicator">${isZh ? '翻倍' : 'DOUBLE'}</div>
            </div>
            <div class="card-corner bottom-corner">
              <span class="corner-val">✖️2</span>
              <span class="corner-sym">⚡</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="game-card card-mod-bonus">
            <div class="card-holo-sheen"></div>
            <div class="card-corner top-corner">
              <span class="corner-val">${val}</span>
              <span class="corner-sym">✨</span>
            </div>
            <div class="card-inner-frame">
              <div class="card-center">
                <span class="card-watermark">✨</span>
                <span class="card-center-num">${val}</span>
              </div>
              <div class="card-deck-indicator">${isZh ? '加分' : 'BONUS'}</div>
            </div>
            <div class="card-corner bottom-corner">
              <span class="corner-val">${val}</span>
              <span class="corner-sym">✨</span>
            </div>
          </div>
        `;
      }
    } else if (type === 'action') {
      let actType = meta.action || (val === 'Shield' || val === 'Heart' ? 'second_chance' : val);
      if (actType === 'second_chance') {
        return `
          <div class="game-card card-action-heart">
            <div class="card-holo-sheen"></div>
            <div class="card-corner top-corner">
              <span class="corner-val">❤️</span>
            </div>
            <div class="card-inner-frame">
              <div class="card-center">
                <span class="card-action-icon">❤️</span>
              </div>
              <div class="card-deck-indicator">${isZh ? '+1 命' : '+1 LIFE'}</div>
            </div>
            <div class="card-corner bottom-corner">
              <span class="corner-val">❤️</span>
            </div>
          </div>
        `;
      }
    }
    return '';
  }

  function renderCardLargeHTML(card) {
    const isZh = (window.getCurrentLanguage() === 'zh');
    if (!card) return '';

    if (card.type === 'number') {
      const n = card.value;
      const m = CARD_META[n] || { sym: '•', count: n, descZh: `牌库共 ${n} 张`, descEn: `${n} in deck` };
      const isSeven = (n === 7);

      return `
        <div class="game-card lg card-num-${n} ${isSeven ? 'is-lucky-seven' : ''}">
          <div class="card-holo-sheen"></div>
          <div class="card-corner top-corner">
            <span class="corner-val">${n}</span>
            <span class="corner-sym">${m.sym}</span>
          </div>
          <div class="card-inner-frame">
            <div class="card-center">
              <div class="card-motif-ring"></div>
              <span class="card-watermark">${m.sym}</span>
              <span class="card-center-num">${n}</span>
            </div>
            <div class="card-bottom-banner">
              <span class="card-desc-text">${isZh ? m.descZh : m.descEn}</span>
            </div>
          </div>
          <div class="card-corner bottom-corner">
            <span class="corner-val">${n}</span>
            <span class="corner-sym">${m.sym}</span>
          </div>
        </div>
      `;
    } else if (card.type === 'modifier') {
      const isX2 = (card.name === 'x2');
      if (isX2) {
        return `
          <div class="game-card lg card-mod-x2">
            <div class="card-holo-sheen"></div>
            <div class="card-corner top-corner">
              <span class="corner-val">✖️2</span>
              <span class="corner-sym">⚡</span>
            </div>
            <div class="card-inner-frame">
              <div class="card-center">
                <div class="card-motif-ring"></div>
                <span class="card-watermark">⚡</span>
                <span class="card-center-num">✖️2</span>
              </div>
              <div class="card-bottom-banner">
                <span class="card-desc-text">${isZh ? '数字点数总和 × 2' : 'Doubles number sum!'}</span>
              </div>
            </div>
            <div class="card-corner bottom-corner">
              <span class="corner-val">✖️2</span>
              <span class="corner-sym">⚡</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="game-card lg card-mod-bonus">
            <div class="card-holo-sheen"></div>
            <div class="card-corner top-corner">
              <span class="corner-val">${card.name}</span>
              <span class="corner-sym">✨</span>
            </div>
            <div class="card-inner-frame">
              <div class="card-center">
                <div class="card-motif-ring"></div>
                <span class="card-watermark">✨</span>
                <span class="card-center-num">${card.name}</span>
              </div>
              <div class="card-bottom-banner">
                <span class="card-desc-text">${isZh ? `额外获得 +${card.value} 分` : `Adds +${card.value} bonus pts`}</span>
              </div>
            </div>
            <div class="card-corner bottom-corner">
              <span class="corner-val">${card.name}</span>
              <span class="corner-sym">✨</span>
            </div>
          </div>
        `;
      }
    } else if (card.type === 'action') {
      let cls = 'card-action-heart';
      let icon = '❤️';
      let desc = isZh ? '抵消下一次重复爆牌 • 多一条命' : 'Absorbs your next bust (Extra Life)';

      if (card.action === 'freeze') {
        cls = 'card-action-freeze';
        icon = '❄️';
        desc = isZh ? '指定玩家立即停牌锁定' : 'Forces target player to Stay';
      } else if (card.action === 'flip_three') {
        cls = 'card-action-flip-three';
        icon = '⚡';
        desc = isZh ? '指定玩家必须连摸三张' : 'Forces target to flip 3 cards';
      }

      return `
        <div class="game-card lg ${cls}">
          <div class="card-holo-sheen"></div>
          <div class="card-corner top-corner">
            <span class="corner-val">${icon}</span>
          </div>
          <div class="card-inner-frame">
            <div class="card-center card-center-action">
              <div class="card-motif-ring"></div>
              <span class="card-action-large-icon">${icon}</span>
            </div>
            <div class="card-bottom-banner">
              <span class="card-desc-text">${desc}</span>
            </div>
          </div>
          <div class="card-corner bottom-corner">
            <span class="corner-val">${icon}</span>
          </div>
        </div>
      `;
    }
    return '';
  }

  function renderSidebar(room) {
    if (room.gameLog) {
      el.logStream.innerHTML = room.gameLog.map(logMsg => `
        <div class="log-item">${escapeHTML(logMsg)}</div>
      `).join('');
      el.logStream.scrollTop = el.logStream.scrollHeight;
    }

    const sorted = [...room.players].sort((a, b) => b.totalScore - a.totalScore);
    el.scoreboardList.innerHTML = sorted.map((p, idx) => `
      <div class="score-row">
        <span class="rank">#${idx + 1}</span>
        <span class="p-name">${p.avatar} ${escapeHTML(p.name)}</span>
        <strong style="color:var(--gold);font-family:var(--font-mono)">${p.totalScore} pts</strong>
      </div>
    `).join('');
  }

  function renderChatMessage(msg) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `
      <span class="c-author">${msg.avatar} ${escapeHTML(msg.playerName)}:</span>
      ${msg.text ? `<span>${escapeHTML(msg.text)}</span>` : ''}
      ${msg.emoji ? `<span class="c-emoji">${msg.emoji}</span>` : ''}
    `;
    el.chatMessages.appendChild(bubble);
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;

    if (msg.emoji) spawnFloatingReaction(msg.emoji);
  }

  function spawnFloatingReaction(emoji) {
    const table = document.getElementById('casino-table');
    if (!table) return;
    const div = document.createElement('div');
    div.className = 'floating-reaction';
    div.textContent = emoji;
    div.style.left = `${Math.random() * 60 + 20}%`;
    div.style.bottom = '120px';
    table.appendChild(div);
    setTimeout(() => div.remove(), 2300);
  }

  function checkPendingTarget(room) {
    if (!room.pendingTarget) {
      el.modalTarget.classList.add('hidden');
      return;
    }

    const { type, source_id, card, valid_targets } = room.pendingTarget;
    if (source_id !== state.playerId) {
      el.modalTarget.classList.add('hidden');
      return;
    }

    el.modalTarget.classList.remove('hidden');

    if (type === 'TARGET_FREEZE') {
      el.targetModalTitle.textContent = window.t('selectTargetTitle');
      el.targetModalDesc.textContent = window.t('targetFreezeDesc');
    } else if (type === 'TARGET_FLIP_THREE') {
      el.targetModalTitle.textContent = window.t('selectTargetTitle');
      el.targetModalDesc.textContent = window.t('targetFlipThreeDesc');
    } else if (type === 'GIFT_SECOND_CHANCE') {
      el.targetModalTitle.textContent = window.t('selectTargetTitle');
      el.targetModalDesc.textContent = window.t('giftSecondChanceDesc');
    }

    el.targetCardPreview.innerHTML = renderCardLargeHTML(card);

    el.targetPlayersGrid.innerHTML = valid_targets.map(pid => {
      const p = room.players.find(pl => pl.id === pid);
      if (!p) return '';
      return `
        <button class="target-player-btn" data-pid="${p.id}">
          <span style="font-size:2rem">${p.avatar}</span>
          <strong>${escapeHTML(p.name)}</strong>
          <small>${p.id === state.playerId ? `(${window.t('thPlayer')})` : `${p.roundScore} pts`}</small>
        </button>
      `;
    }).join('');

    el.targetPlayersGrid.querySelectorAll('.target-player-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-pid');
        sendWS('SELECT_TARGET', { targetPlayerId: targetId });
        el.modalTarget.classList.add('hidden');
      });
    });
  }

  function renderRoundRecap(room) {
    el.modalRecap.classList.remove('hidden');
    el.recapRoundNum.textContent = room.roundNumber;
    el.recapReason.textContent = room.gameLog && room.gameLog.length ? room.gameLog[room.gameLog.length - 1] : '';

    sfx.playRoundWin();

    el.recapTableBody.innerHTML = room.players.map(p => {
      let cardsDesc = p.numberCards.map(n => `<span class="recap-num-pill pill-num-${n}">${n}</span>`).join(' ');
      if (p.modifierCards.length) {
        const modPills = p.modifierCards.map(m => {
          const isX2 = (m.name === 'x2');
          return `<span class="recap-num-pill ${isX2 ? 'pill-x2' : 'pill-mod'}">${m.name}</span>`;
        }).join(' ');
        cardsDesc = cardsDesc ? `${cardsDesc} ${modPills}` : modPills;
      }
      if (p.roundStatus === 'busted' && p.bustedCard) {
        const bVal = (p.bustedCard.value !== undefined) ? p.bustedCard.value : (p.bustedCard.name || '?');
        const bustBadge = `<span class="recap-bust-badge" title="${window.t('bustedCardTooltip')}">💥 ${bVal} (${window.t('bustedCardTag')})</span>`;
        cardsDesc = cardsDesc ? `${cardsDesc} + ${bustBadge}` : bustBadge;
      }
      const statusKey = `status${p.roundStatus.charAt(0).toUpperCase() + p.roundStatus.slice(1)}`;
      return `
        <tr>
          <td>${p.avatar} <strong>${escapeHTML(p.name)}</strong></td>
          <td><span class="seat-status-tag tag-${p.roundStatus}">${window.t(statusKey)}</span></td>
          <td>${cardsDesc || '—'}</td>
          <td style="font-weight:800;color:var(--gold)">+${p.roundScore}</td>
          <td style="font-weight:900">${p.totalScore}</td>
        </tr>
      `;
    }).join('');

    if (state.isHost) {
      el.btnNextRound.classList.remove('hidden');
      el.recapGuestNotice.classList.add('hidden');
    } else {
      el.btnNextRound.classList.add('hidden');
      el.recapGuestNotice.classList.remove('hidden');
    }
  }

  function renderGameOver(room) {
    el.modalGameOver.classList.remove('hidden');
    confetti.explode(220);
    sfx.playFlipSeven();

    const champ = room.winner || room.players[0];
    el.championSpotlight.innerHTML = `
      <div class="champ-avatar">${champ.avatar}</div>
      <div class="champ-name">${escapeHTML(champ.name)}</div>
      <div class="champ-score">${window.t('winningScore')} ${champ.totalScore} ${window.t('points')}</div>
    `;

    const sorted = [...room.players].sort((a, b) => b.totalScore - a.totalScore);
    const medals = ['🥇', '🥈', '🥉'];
    el.podiumArea.innerHTML = sorted.map((p, i) => {
      const rankIcon = medals[i] || `#${i + 1}`;
      const rScore = p.roundScore || 0;
      const prevTotal = p.totalScore - rScore;
      const roundBadge = p.roundStatus === 'busted'
        ? `<span class="v-round-pts is-busted">💥 +0</span>`
        : `<span class="v-round-pts">+${rScore}</span>`;
      return `
        <div class="score-row ${i === 0 ? 'is-champion' : ''}">
          <span class="rank">${rankIcon}</span>
          <span class="podium-player">${p.avatar} <strong>${escapeHTML(p.name)}</strong></span>
          <span class="podium-score-detail">
            <span class="v-prev-pts">${prevTotal}</span>
            ${roundBadge}
            <strong>= ${p.totalScore} ${window.t('points')}</strong>
          </span>
        </div>
      `;
    }).join('');

    if (!state.isHost) {
      el.btnPlayAgain.classList.add('hidden');
    } else {
      el.btnPlayAgain.classList.remove('hidden');
    }
  }

  function closeModals() {
    el.modalRecap.classList.add('hidden');
    el.modalGameOver.classList.add('hidden');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // ============================================================================
  // Local Setup Screen Renderer
  // ============================================================================

  const LOCAL_AVATARS = ['🦊', '🦁', '🐼', '🦅', '🐉', '🤖', '🎲', '💎', '🍀', '🔥'];

  function renderLocalSetupList() {
    el.localPlayersList.innerHTML = state.localSetupPlayers.map((p, idx) => `
      <div class="local-player-row">
        <div class="left-info">
          <span class="p-num">P${idx + 1}</span>
          <button class="avatar-btn" data-idx="${idx}" title="${window.t('changeAvatar')}">${p.avatar}</button>
          <input type="text" class="p-name-input" data-idx="${idx}" value="${escapeHTML(p.name)}" maxlength="15">
        </div>
        <div class="right-controls">
          <button class="type-toggle-btn ${p.isBot ? 'is-bot' : ''}" data-idx="${idx}">
            ${p.isBot ? `🤖 ${window.t('botLabel')}` : `👤 ${window.t('humanLabel')}`}
          </button>
          ${state.localSetupPlayers.length > 2 ? `<button class="btn-tiny btn-danger" data-remove="${idx}" title="${window.t('removeLabel')}">✕</button>` : ''}
        </div>
      </div>
    `).join('');

    // Avatar cycle click
    el.localPlayersList.querySelectorAll('.avatar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const curAvatar = state.localSetupPlayers[idx].avatar;
        const curIdx = LOCAL_AVATARS.indexOf(curAvatar);
        const nextAvatar = LOCAL_AVATARS[(curIdx + 1) % LOCAL_AVATARS.length];
        state.localSetupPlayers[idx].avatar = nextAvatar;
        renderLocalSetupList();
      });
    });

    // Name change
    el.localPlayersList.querySelectorAll('.p-name-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        state.localSetupPlayers[idx].name = e.target.value.trim() || `Player ${idx + 1}`;
      });
    });

    // Human / Bot toggle
    el.localPlayersList.querySelectorAll('.type-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        state.localSetupPlayers[idx].isBot = !state.localSetupPlayers[idx].isBot;
        if (state.localSetupPlayers[idx].isBot && !state.localSetupPlayers[idx].personality) {
          state.localSetupPlayers[idx].personality = 'balanced';
        }
        renderLocalSetupList();
      });
    });

    // Remove player
    el.localPlayersList.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-remove'), 10);
        if (state.localSetupPlayers.length > 2) {
          state.localSetupPlayers.splice(idx, 1);
          renderLocalSetupList();
        }
      });
    });
  }

  // ============================================================================
  // Event Listeners & Binding
  // ============================================================================

  // ============================================================================
  // Theme Switcher & Management
  // ============================================================================

  function applyTheme(themeId) {
    state.theme = themeId || 'casino';
    document.body.setAttribute('data-theme', state.theme);
    localStorage.setItem('flip7_theme', state.theme);

    if (el.themeOptionsGrid) {
      el.themeOptionsGrid.querySelectorAll('.theme-option-card').forEach(card => {
        if (card.getAttribute('data-theme-id') === state.theme) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
  }

  // Theme Toggle & Picker
  if (el.btnThemeToggle) {
    el.btnThemeToggle.addEventListener('click', () => {
      sfx.playClick();
      el.modalTheme.classList.remove('hidden');
      applyTheme(state.theme);
    });
  }

  if (el.btnCloseTheme) {
    el.btnCloseTheme.addEventListener('click', () => {
      sfx.playClick();
      el.modalTheme.classList.add('hidden');
    });
  }

  if (el.themeOptionsGrid) {
    el.themeOptionsGrid.querySelectorAll('.theme-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const themeId = card.getAttribute('data-theme-id');
        sfx.playClick();
        applyTheme(themeId);
        setTimeout(() => el.modalTheme.classList.add('hidden'), 220);
      });
    });
  }

  // Language Toggle
  el.btnLangToggle.addEventListener('click', () => {
    sfx.playClick();
    const cur = window.getCurrentLanguage();
    const next = (cur === 'zh' ? 'en' : 'zh');
    window.setLanguage(next);
    if (state.roomData) updateGameState(state.roomData);
  });

  // Sound Toggle
  el.btnSoundToggle.addEventListener('click', () => {
    const isEnabled = sfx.toggle();
    el.btnSoundToggle.textContent = isEnabled ? '🔊' : '🔇';
    sfx.playClick();
  });
  el.btnSoundToggle.textContent = sfx.enabled ? '🔊' : '🔇';

  // Rules Modal
  el.btnRules.addEventListener('click', () => {
    el.modalRules.classList.remove('hidden');
    sfx.playClick();
  });
  el.btnCloseRules.addEventListener('click', () => {
    el.modalRules.classList.add('hidden');
    sfx.playClick();
  });

  // Avatar Picker & Random Profile Button
  el.avatarTrigger.addEventListener('click', () => el.avatarPicker.classList.toggle('hidden'));
  el.avatarPicker.querySelectorAll('.avatar-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      state.playerAvatar = opt.textContent;
      el.selectedAvatar.textContent = state.playerAvatar;
      sessionStorage.setItem('flip7_tab_avatar', state.playerAvatar);
      localStorage.setItem('flip7_avatar', state.playerAvatar);
      el.avatarPicker.classList.add('hidden');
    });
  });

  el.playerNameInput.addEventListener('input', () => {
    state.playerName = el.playerNameInput.value.trim() || state.playerName;
    sessionStorage.setItem('flip7_tab_name', state.playerName);
    localStorage.setItem('flip7_name', state.playerName);
  });

  if (el.btnRandomProfile) {
    el.btnRandomProfile.addEventListener('click', () => {
      sfx.playClick();
      const rand = generateRandomProfile(new Set([state.playerName]), new Set([state.playerAvatar]));
      state.playerName = rand.name;
      state.playerAvatar = rand.avatar;
      el.playerNameInput.value = rand.name;
      el.selectedAvatar.textContent = rand.avatar;
      sessionStorage.setItem('flip7_tab_name', rand.name);
      sessionStorage.setItem('flip7_tab_avatar', rand.avatar);
    });
  }

  if (el.btnReconnectNow) {
    el.btnReconnectNow.addEventListener('click', () => {
      sfx.playClick();
      triggerReconnectNow();
    });
  }

  if (el.btnToggleAutoplay) {
    el.btnToggleAutoplay.addEventListener('click', () => {
      sfx.playClick();
      if (!state.roomData) return;
      const myPlayer = state.roomData.players.find(p => p.id === state.playerId);
      if (!myPlayer) return;
      sendWS('SET_AUTO_PLAY', { enabled: !myPlayer.isAutoPlay });
    });
  }

  if (el.btnResumeManual) {
    el.btnResumeManual.addEventListener('click', () => {
      sfx.playClick();
      sendWS('SET_AUTO_PLAY', { enabled: false });
    });
  }

  // Room List Modal Buttons
  if (el.btnRoomList) {
    el.btnRoomList.addEventListener('click', () => {
      sfx.playClick();
      openRoomListModal();
    });
  }
  if (el.btnRoomListHeader) {
    el.btnRoomListHeader.addEventListener('click', () => {
      sfx.playClick();
      openRoomListModal();
    });
  }
  if (el.btnRefreshRooms) {
    el.btnRefreshRooms.addEventListener('click', () => {
      sfx.playClick();
      withButtonLock(el.btnRefreshRooms, 500, () => {
        fetchRoomList();
      });
    });
  }
  if (el.btnCloseRooms) {
    el.btnCloseRooms.addEventListener('click', () => {
      sfx.playClick();
      closeRoomListModal();
    });
  }
  if (el.modalRoomList) {
    el.modalRoomList.addEventListener('click', (e) => {
      if (e.target === el.modalRoomList) closeRoomListModal();
    });
  }

  // Create Online Room (with anti-rapid-click lock)
  el.btnCreateRoom.addEventListener('click', () => {
    if (state.roomActionPending) return;
    withButtonLock(el.btnCreateRoom, 1800, () => {
      state.roomActionPending = true;
      setTimeout(() => { state.roomActionPending = false; }, 1800);
      sfx.playClick();
      state.isLocalMode = false;
      const targetScore = parseInt(el.createTargetScore.value, 10) || 200;
      const showOdds = el.createShowOdds ? (el.createShowOdds.value === 'true') : true;
      connectWebSocket(() => {
        sendWS('CREATE_ROOM', {
          name: state.playerName,
          avatar: state.playerAvatar,
          targetScore: targetScore,
          showOdds: showOdds
        });
      });
    });
  });

  // Join Online Room (with anti-rapid-click lock)
  el.btnJoinRoom.addEventListener('click', () => {
    if (state.roomActionPending) return;
    const code = el.roomCodeInput.value.trim().toUpperCase();
    if (!code) {
      alert(window.getCurrentLanguage() === 'zh' ? '请输入4位房间代码。' : 'Please enter a 4-letter room code.');
      return;
    }
    withButtonLock(el.btnJoinRoom, 1800, () => {
      sfx.playClick();
      joinRoomByCode(code);
    });
  });

  // Open Local Setup Screen
  el.btnLocalPlayOpen.addEventListener('click', () => {
    sfx.playClick();
    showScreen(el.screenLocalSetup);
    renderLocalSetupList();
  });

  // Local Add Player
  el.btnLocalAddPlayer.addEventListener('click', () => {
    sfx.playClick();
    if (state.localSetupPlayers.length >= 8) return;
    const usedNames = new Set(state.localSetupPlayers.map(p => p.name));
    const usedAvatars = new Set(state.localSetupPlayers.map(p => p.avatar));
    const rand = generateRandomProfile(usedNames, usedAvatars);
    state.localSetupPlayers.push({ name: rand.name, avatar: rand.avatar, isBot: false });
    renderLocalSetupList();
  });

  // Local Add Bot
  el.btnLocalAddBot.addEventListener('click', () => {
    sfx.playClick();
    if (state.localSetupPlayers.length >= 8) return;
    const bots = [
      { name: 'Lucky Lucy', avatar: '🍀', personality: 'balanced' },
      { name: 'Risky Rick', avatar: '🔥', personality: 'risk_taker' },
      { name: 'Careful Carl', avatar: '💖', personality: 'cautious' },
      { name: 'Daring Dan', avatar: '🎲', personality: 'risk_taker' }
    ];
    const b = bots[state.localSetupPlayers.length % bots.length];
    state.localSetupPlayers.push({ name: b.name, avatar: b.avatar, isBot: true, personality: b.personality });
    renderLocalSetupList();
  });

  // Local Back to Home
  el.btnLocalBack.addEventListener('click', () => {
    sfx.playClick();
    showScreen(el.screenHome);
  });

  // Start Local Match
  el.btnLocalStart.addEventListener('click', () => {
    sfx.playClick();
    state.isLocalMode = true;
    const targetScore = parseInt(el.localTargetScore.value, 10) || 200;
    const showOdds = el.localShowOdds ? (el.localShowOdds.value === 'true') : true;
    state.localGame = new LocalFlip7Game(state.localSetupPlayers, targetScore, showOdds);
    renderLocalState();
  });

  // Solo Play Shortcut
  el.btnSoloPlay.addEventListener('click', () => {
    sfx.playClick();
    state.isLocalMode = true;
    const soloConfigs = [
      { name: state.playerName, avatar: state.playerAvatar, isBot: false },
      { name: 'Lucky Lucy', avatar: '🍀', isBot: true, personality: 'balanced' },
      { name: 'Risky Rick', avatar: '🔥', isBot: true, personality: 'risk_taker' },
      { name: 'Careful Carl', avatar: '💖', isBot: true, personality: 'cautious' }
    ];
    const showOdds = el.createShowOdds ? (el.createShowOdds.value === 'true') : true;
    state.localGame = new LocalFlip7Game(soloConfigs, 200, showOdds);
    renderLocalState();
  });

  // Copy Code & Link
  el.btnCopyCode.addEventListener('click', () => {
    sfx.playClick();
    if (state.roomCode) {
      navigator.clipboard.writeText(state.roomCode);
      el.btnCopyCode.textContent = window.t('copied');
      setTimeout(() => el.btnCopyCode.textContent = window.t('copyCodeBtn'), 1500);
    }
  });

  el.btnCopyLink.addEventListener('click', () => {
    sfx.playClick();
    if (state.roomCode) {
      const url = `${window.location.origin}/?room=${state.roomCode}`;
      navigator.clipboard.writeText(url);
      el.btnCopyLink.textContent = window.t('copied');
      setTimeout(() => el.btnCopyLink.textContent = window.t('copyLinkBtn'), 1500);
    }
  });

  // Lobby Host Actions
  el.btnAddBot.addEventListener('click', () => {
    withButtonLock(el.btnAddBot, 320, () => {
      sfx.playClick();
      sendWS('ADD_BOT');
    });
  });

  el.btnStartGame.addEventListener('click', () => {
    withButtonLock(el.btnStartGame, 1200, () => {
      sfx.playClick();
      sendWS('START_GAME');
    });
  });

  el.btnLeaveRoom.addEventListener('click', () => {
    sfx.playClick();
    const oldRoom = state.roomCode;
    if (oldRoom && !state.isLocalMode && state.ws && state.ws.readyState === WebSocket.OPEN) {
      try { state.ws.send(JSON.stringify({ type: 'LEAVE_ROOM', data: {} })); } catch (e) {}
    }
    clearRoomSession(oldRoom);
    state.roomCode = null;
    state.roomData = null;
    state.wasInRoomBeforeDisconnect = false;
    if (el.reconnectBanner) el.reconnectBanner.classList.add('hidden');
    history.replaceState(null, '', window.location.pathname);
    showScreen(el.screenHome);
  });

  // Play Actions (with anti-rapid-click lock)
  el.btnHit.addEventListener('click', () => {
    withButtonLock(el.btnHit, 450, () => {
      sfx.playClick();
      sendWS('HIT');
    });
  });

  el.btnStay.addEventListener('click', () => {
    withButtonLock(el.btnStay, 450, () => {
      sfx.playClick();
      sendWS('STAY');
    });
  });

  el.btnNextRound.addEventListener('click', () => {
    withButtonLock(el.btnNextRound, 1200, () => {
      sfx.playClick();
      sendWS('NEXT_ROUND');
    });
  });

  el.btnPlayAgain.addEventListener('click', () => {
    withButtonLock(el.btnPlayAgain, 1200, () => {
      sfx.playClick();
      sendWS('RESTART_GAME');
    });
  });

  el.btnReturnLobby.addEventListener('click', () => {
    sfx.playClick();
    closeModals();
    const oldRoom = state.roomCode;
    if (oldRoom && !state.isLocalMode && state.ws && state.ws.readyState === WebSocket.OPEN) {
      try { state.ws.send(JSON.stringify({ type: 'LEAVE_ROOM', data: {} })); } catch (e) {}
    }
    clearRoomSession(oldRoom);
    state.roomCode = null;
    state.roomData = null;
    state.wasInRoomBeforeDisconnect = false;
    state.isLocalMode = false;
    state.localGame = null;
    history.replaceState(null, '', window.location.pathname);
    showScreen(el.screenHome);
  });

  // Reactions & Chat
  document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      sendWS('CHAT', { emoji });
      sfx.playClick();
    });
  });

  el.chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = el.chatInput.value.trim();
    if (!text) return;
    sendWS('CHAT', { message: text });
    el.chatInput.value = '';
  });

  el.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      el.tabBtns.forEach(b => b.classList.remove('active'));
      el.tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const paneId = btn.getAttribute('data-tab');
      document.getElementById(paneId).classList.add('active');
    });
  });

  // ============================================================================
  // Initialization
  // ============================================================================

  applyTheme(state.theme);
  window.setLanguage(window.getCurrentLanguage());
  el.playerNameInput.value = state.playerName;
  el.selectedAvatar.textContent = state.playerAvatar;

  // Auto-join or Auto-Reconnect from URL param or saved session
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = (urlParams.get('room') || sessionStorage.getItem('flip7_active_room') || '').trim().toUpperCase();
  if (roomParam) {
    el.roomCodeInput.value = roomParam;
    const savedSess = loadRoomSession(roomParam);
    if (savedSess && savedSess.playerId) {
      state.playerId = savedSess.playerId;
      state.playerName = savedSess.name || state.playerName;
      state.playerAvatar = savedSess.avatar || state.playerAvatar;
      el.playerNameInput.value = state.playerName;
      el.selectedAvatar.textContent = state.playerAvatar;
      state.wasInRoomBeforeDisconnect = true;
      connectWebSocket(() => {
        sendWS('JOIN_ROOM', {
          roomCode: roomParam,
          playerId: savedSess.playerId,
          name: state.playerName,
          avatar: state.playerAvatar
        });
      });
    }
  }

})();
