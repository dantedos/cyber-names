/* ==========================================================
   CyberNames - Client Application Script (Socket.io & Anti-Cheat)
   ========================================================== */
/* ==========================================================
   CyberNames - Web Audio Synth Engine (Base64 Sound Effects)
   ========================================================== */

// توليد مؤثرات صوتية سيبرانية مباشرة باستخدام Web Audio API (بدون ملفات خارجية)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

function playSound(type) {
  if (!soundEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'click') {
    // صوت نقرة أزرار هيدروليكية
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);

  } else if (type === 'success') {
    // صوت نجاح اختيار كارت صحيح
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);

  } else if (type === 'error') {
    // صوت خطأ أو انقضاء الوقت
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.25);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);

  } else if (type === 'siren') {
    // صفارة إنذار الغش (Anti-Cheat Siren)
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.15);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);

  } else if (type === 'ping') {
    // صوت وصول رسالة أو فويس نوت
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1050, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

// تشغيل صفارة الإنذار وتأثير هز الشاشة عند الغش
socket.on('anti_cheat_alert', (data) => {
  playSound('siren');
  document.body.classList.add('animate-bounce');
  setTimeout(() => document.body.classList.remove('animate-bounce'), 1000);
  
  antiCheatMsg.innerText = data.message;
  antiCheatOverlay.classList.remove('hidden');

  const chatMessages = document.getElementById('chat-messages');
  const alertEl = document.createElement('div');
  alertEl.className = 'bg-red-950/80 border border-red-800 p-3 rounded-xl text-red-300 font-mono text-xs animate-pulse';
  alertEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation ml-1"></i> ${data.message}`;
  chatMessages.appendChild(alertEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// تشغيل صوت التنبيه عند وصول فويس أو رسالة
socket.on('receive_chat_message', (msg) => {
  playSound('ping');
  // باقي كود الشات الأصلي كما هو...
});
const socket = io();

// حالة المستخدم والغرفة الحالية
let currentUser = {
  name: '',
  avatar: null
};
let currentRoom = null;
let base64Avatar = null;

// متغيرات التسجيل الصوتي (Voice Notes Base64)
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false; // تم تصحيح الخطأ المطبعي هنا

// --- 1. التنقل بين الشاشات (View Controller) ---
function showView(viewId) {
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.add('hidden');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('hidden');
  }
}

// --- 2. نظام البروفايل وتحويل الصورة إلى Base64 ---
const avatarFileInput = document.getElementById('profile-avatar-file');
const avatarPreview = document.getElementById('avatar-preview');

if (avatarFileInput) {
  avatarFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function() {
        base64Avatar = reader.result; // تخزين الصورة بصيغة Base64
        avatarPreview.innerHTML = `<img src="${base64Avatar}" class="w-full h-full object-cover rounded-full">`;
      };
      reader.readAsDataURL(file);
    }
  });
}

document.getElementById('profile-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const nameInput = document.getElementById('profile-name').value.trim();
  
  if (!nameInput) return alert('يرجى إدخال اسم هكر صالح!');

  currentUser.name = nameInput;
  currentUser.avatar = base64Avatar || getDefaultAvatarSVG(nameInput);

  // إرسال بيانات البروفايل للسيرفر
  socket.emit('register_profile', currentUser);
});

socket.on('profile_registered', (profile) => {
  currentUser = profile;
  // تحديث بيانات القائمة الرئيسية
  document.getElementById('menu-username').innerText = currentUser.name;
  const menuAvatarDisplay = document.getElementById('menu-avatar-display');
  menuAvatarDisplay.innerHTML = `<img src="${currentUser.avatar}" class="w-full h-full object-cover rounded-full">`;
  
  // الانتقال للقائمة الرئيسية
  showView('view-menu');
});

function getDefaultAvatarSVG(name) {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2306b6d4" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M4.2 19.5a8 8 0 0 1 15.6 0"/></svg>`;
}

// --- 3. إنشاء وإنضمام الغرف ---
document.getElementById('create-room-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const settings = {
    dictionaryType: document.getElementById('room-dictionary').value, // cyber, sudani, engineering
    wordCount: parseInt(document.getElementById('room-wordcount').value) || 25,
    timer: parseInt(document.getElementById('room-timer').value) || 60,
    password: document.getElementById('room-password').value.trim()
  };

  socket.emit('create_room', settings);
});

document.getElementById('join-room-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const roomCode = document.getElementById('join-code').value.trim().toUpperCase();
  const password = document.getElementById('join-password').value.trim();

  if (!roomCode) return alert('يرجى إدخال كود الغرفة!');

  socket.emit('join_room', { roomCode, password });
});

socket.on('room_created', (data) => {
  currentRoom = data.room;
  setupLobby(data.roomCode);
});

socket.on('room_joined', (room) => {
  currentRoom = room;
  setupLobby(room.code);
});

socket.on('error_message', (msg) => {
  alert(msg);
});

// تهيئة اللوبي وغرفة العمليات
function setupLobby(roomCode) {
  document.getElementById('display-room-code').innerText = roomCode;
  showView('view-lobby');
  renderPlayers(currentRoom.players);
  renderGameBoard(currentRoom.board);
}

// تحديث قائمة اللاعبين
socket.on('update_players', (players) => {
  if (currentRoom) currentRoom.players = players;
  renderPlayers(players);
});

function renderPlayers(players) {
  const listEl = document.getElementById('players-list');
  const countEl = document.getElementById('player-count');
  countEl.innerText = players.length;

  listEl.innerHTML = players.map(p => `
    <li class="flex items-center space-x-3 space-x-reverse bg-black/40 p-2.5 rounded-xl border border-gray-800">
      <div class="w-9 h-9 rounded-full bg-gray-800 border border-cyan-500/50 overflow-hidden flex items-center justify-center shrink-0">
        ${p.avatar ? `<img src="${p.avatar}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-xs text-cyan-400"></i>`}
      </div>
      <div class="truncate">
        <span class="text-sm font-bold text-gray-200 block truncate">${p.name}</span>
        <span class="text-[10px] text-green-400 font-mono">متصل بالشبكة</span>
      </div>
    </li>
  `).join('');
}

// رسم شبكة الكروت (حتى 50 كلمة)
function renderGameBoard(board) {
  const boardEl = document.getElementById('game-board');
  const waitingMsg = document.getElementById('waiting-host-msg');

  if (!board || board.length === 0) {
    waitingMsg.classList.remove('hidden');
    boardEl.innerHTML = '';
    return;
  }

  waitingMsg.classList.add('hidden');
  
  boardEl.innerHTML = board.map(card => `
    <div onclick="selectCard(${card.id})" class="game-card bg-gray-900 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-center text-center font-mono text-xs sm:text-sm font-bold text-cyan-300 shadow-lg hover:border-cyan-400 transition">
      <span>${card.word}</span>
    </div>
  `).join('');
}

function selectCard(cardId) {
  console.log(`Selected card ID: ${cardId}`);
}

function leaveRoom() {
  window.location.reload();
}

// --- 4. الشات العام (نصي وفويس نوت Base64) ---
function sendTextMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  socket.emit('send_chat_message', {
    type: 'text',
    content: text
  });

  input.value = '';
}

document.getElementById('chat-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendTextMessage();
});

// تسجيل الفويس نوت وتحويلها لـ Base64
let isRecordingActive = false;

async function toggleVoiceRecording() {
  const micIcon = document.getElementById('mic-icon');
  
  if (!isRecordingActive) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result;
          socket.emit('send_chat_message', {
            type: 'voice',
            content: base64Audio
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      isRecordingActive = true;
      micIcon.classList.remove('fa-microphone');
      micIcon.classList.add('fa-stop', 'text-red-500', 'animate-pulse');
    } catch (err) {
      alert('عفواً، لا يمكن الوصول إلى الميكروفون!');
      console.error(err);
    }
  } else {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    isRecordingActive = false;
    micIcon.classList.remove('fa-stop', 'text-red-500', 'animate-pulse');
    micIcon.classList.add('fa-microphone');
  }
}

// استقبال رسائل الشات العام
socket.on('receive_chat_message', (msg) => {
  const chatMessages = document.getElementById('chat-messages');
  
  let contentHtml = '';
  if (msg.type === 'text') {
    contentHtml = `<p class="text-gray-200 mt-1">${escapeHtml(msg.content)}</p>`;
  } else if (msg.type === 'voice') {
    contentHtml = `
      <div class="mt-2">
        <audio controls src="${msg.content}" class="w-full h-8 max-w-[220px]"></audio>
      </div>
    `;
  }

  const messageEl = document.createElement('div');
  messageEl.className = 'bg-black/40 border border-gray-800 p-3 rounded-xl';
  messageEl.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2 space-x-reverse">
        <div class="w-6 h-6 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
          ${msg.avatar ? `<img src="${msg.avatar}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-[10px] text-cyan-400"></i>`}
        </div>
        <span class="font-bold text-cyan-400 text-xs">${escapeHtml(msg.sender)}</span>
      </div>
      <span class="text-[10px] text-gray-500 font-mono">${msg.timestamp}</span>
    </div>
    ${contentHtml}
  `;

  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function escapeHtml(text) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// --- 5. نظام مكافحة الغش الصارم (Anti-Cheat Engine) ---
const antiCheatOverlay = document.getElementById('anti-cheat-overlay');
const antiCheatMsg = document.getElementById('anti-cheat-msg');

document.addEventListener('visibilitychange', () => {
  if (document.hidden && currentRoom) {
    socket.emit('anti_cheat_violation', 'Visibility Hidden / Switched App');
  }
});

window.addEventListener('blur', () => {
  if (currentRoom) {
    socket.emit('anti_cheat_violation', 'Window Lost Focus / External App Opened');
  }
});

socket.on('anti_cheat_alert', (data) => {
  antiCheatMsg.innerText = data.message;
  antiCheatOverlay.classList.remove('hidden');

  const chatMessages = document.getElementById('chat-messages');
  const alertEl = document.createElement('div');
  alertEl.className = 'bg-red-950/80 border border-red-800 p-3 rounded-xl text-red-300 font-mono text-xs';
  alertEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation ml-1"></i> ${data.message}`;
  chatMessages.appendChild(alertEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function dismissAntiCheat() {
  antiCheatOverlay.classList.add('hidden');
}

// --- 6. نظام الأصدقاء (Friend System) ---
function addFriend() {
  const input = document.getElementById('friend-name-input');
  const friendName = input.value.trim();
  if (!friendName) return;

  const friendsList = document.getElementById('friends-list');
  if (friendsList.querySelector('.text-center')) {
    friendsList.innerHTML = '';
  }

  const friendItem = document.createElement('div');
  friendItem.className = 'flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-gray-800';
  friendItem.innerHTML = `
    <div class="flex items-center space-x-2 space-x-reverse">
      <div class="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
        ${friendName.charAt(0).toUpperCase()}
      </div>
      <div>
        <span class="text-xs font-bold text-gray-200 block">${escapeHtml(friendName)}</span>
        <span class="text-[10px] text-green-400">متصل (Online)</span>
      </div>
    </div>
    <button onclick="inviteFriend('${escapeHtml(friendName)}')" class="px-3 py-1 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition">دعوة</button>
  `;

  friendsList.appendChild(friendItem);
  input.value = '';
}

function inviteFriend(friendName) {
  alert(`تم إرسال دعوة عمليات مباشرة إلى الهكر (${friendName}) بنجاح!`);
}