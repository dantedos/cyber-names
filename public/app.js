/* ==========================================================
   CyberNames - Client Application Script (Codenames & Teams)
   ========================================================== */

const socket = io(); // تعريف السوكيت أولاً وقبل كل شيء

// حالة المستخدم والغرفة الحالية
let currentUser = {
  name: '',
  avatar: null
};
let currentRoom = null;
let base64Avatar = null;
let chatVisible = true;

// متغيرات التسجيل الصوتي (Voice Notes Base64)
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

// استرجاع الحساب الثابت من localStorage إن وجد تلقائياً
window.addEventListener('DOMContentLoaded', () => {
  const savedName = localStorage.getItem('cyber_username');
  const savedAvatar = localStorage.getItem('cyber_avatar');
  if (savedName) {
    currentUser.name = savedName;
    currentUser.avatar = savedAvatar || getDefaultAvatarSVG(savedName);
    socket.emit('register_profile', { name: currentUser.name, password: 'saved', avatar: currentUser.avatar });
  }
});

/* ==========================================================
   CyberNames - Web Audio Synth Engine (Base64 Sound Effects)
   ========================================================== */
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
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.25);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'siren') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.15);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'ping') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1050, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

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

// --- 2. نظام البروفايل الثابت وتحويل الصورة إلى Base64 ---
const avatarFileInput = document.getElementById('profile-avatar-file');
const avatarPreview = document.getElementById('avatar-preview');

if (avatarFileInput) {
  avatarFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function() {
        base64Avatar = reader.result;
        if (avatarPreview) {
          avatarPreview.innerHTML = `<img src="${base64Avatar}" class="w-full h-full object-cover rounded-full">`;
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

document.getElementById('profile-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const nameInput = document.getElementById('profile-name').value.trim();
  const passInput = document.getElementById('profile-pass').value.trim();
  
  if (!nameInput || !passInput) return alert('يرجى إدخال اسم الهكر وكلمة المرور!');

  currentUser.name = nameInput;
  currentUser.avatar = base64Avatar || getDefaultAvatarSVG(nameInput);

  // حفظ الحساب في الذاكرة المحلية حتى لا يضيع عند التحديث
  localStorage.setItem('cyber_username', currentUser.name);
  localStorage.setItem('cyber_avatar', currentUser.avatar);

  socket.emit('register_profile', { name: currentUser.name, password: passInput, avatar: currentUser.avatar });
});

socket.on('profile_registered', (profile) => {
  currentUser = profile;
  const usernameEl = document.getElementById('menu-username');
  if (usernameEl) usernameEl.innerText = currentUser.name;
  
  const menuAvatarDisplay = document.getElementById('menu-avatar-display');
  if (menuAvatarDisplay) {
    menuAvatarDisplay.innerHTML = `<img src="${currentUser.avatar}" class="w-full h-full object-cover rounded-full">`;
  }
  
  showView('view-menu');
});

function getDefaultAvatarSVG(name) {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2306b6d4" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M4.2 19.5a8 8 0 0 1 15.6 0"/></svg>`;
}

// --- 3. إنشاء وإنضمام الغرف وتوزيع الفرق ---
document.getElementById('create-room-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const settings = {
    dictionaryType: document.getElementById('room-dictionary').value,
    wordCount: parseInt(document.getElementById('room-wordcount').value) || 25,
    timer: parseInt(document.getElementById('room-timer')?.value) || 60,
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

function setupLobby(roomCode) {
  document.getElementById('display-room-code').innerText = roomCode;
  showView('view-lobby');
  updateRoomUI(currentRoom);
}

// تحديث حالة الغرفة والفرق والأدوار عبر السوكيت
socket.on('update_room_state', (room) => {
  currentRoom = room;
  updateRoomUI(room);
});

function updateRoomUI(room) {
  // تحديث الفريق الأحمر
  const redPlayers = room.teams.red.players || [];
  document.getElementById('red-count').innerText = `${redPlayers.length} لاعبين`;
  const redSpy = redPlayers.find(p => p.id === room.teams.red.spymaster);
  document.getElementById('red-spy').innerText = redSpy ? redSpy.name : 'غير مسمى';
  document.getElementById('red-players-list').innerHTML = redPlayers.map(p => `<li>- ${escapeHtml(p.name)}</li>`).join('');

  // تحديث الفريق الأزرق
  const bluePlayers = room.teams.blue.players || [];
  document.getElementById('blue-count').innerText = `${bluePlayers.length} لاعبين`;
  const blueSpy = bluePlayers.find(p => p.id === room.teams.blue.spymaster);
  document.getElementById('blue-spy').innerText = blueSpy ? blueSpy.name : 'غير مسمى';
  document.getElementById('blue-players-list').innerHTML = bluePlayers.map(p => `<li>- ${escapeHtml(p.name)}</li>`).join('');

  // تحديث قائمة الأصدقاء الحقيقيين المتصلين في الغرفة
  const friendsList = document.getElementById('friends-list');
  if (friendsList) {
    friendsList.innerHTML = room.players.map(p => `
      <div class="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-gray-800 text-xs">
        <div class="flex items-center space-x-2 space-x-reverse">
          <div class="w-7 h-7 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
            ${p.avatar ? `<img src="${p.avatar}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-[10px] text-cyan-400"></i>`}
          </div>
          <span class="text-cyan-300 font-bold">${escapeHtml(p.name)}</span>
        </div>
        <span class="text-green-400 font-mono">متصل</span>
      </div>
    `).join('');
  }
}

// اختيار الفريق والدور (Spymaster أو Operative)
function joinTeamRole(team, role) {
  socket.emit('change_team_role', { team, role });
}

// محاولة بدء الجيم
function tryStartGame() {
  socket.emit('start_game');
}

socket.on('game_started', (room) => {
  currentRoom = room;
  document.getElementById('team-selection-area').classList.add('hidden');
  document.getElementById('start-game-container').classList.add('hidden');
  document.getElementById('gameplay-area').classList.remove('hidden');
  
  // إذا كان المستخدم الحالي هو Spymaster لأي من الفريقين، نظهر له خانة إرسال التلميحات
  if (room.teams.red.spymaster === socket.id || room.teams.blue.spymaster === socket.id) {
    document.getElementById('spymaster-clue-box').classList.remove('hidden');
  }

  renderGameBoard(room.board);
});

// إرسال التلميح من القائد
function sendClueToTeam() {
  const clue = document.getElementById('clue-word-input').value.trim();
  const count = document.getElementById('clue-count-select').value;
  if (!clue) return alert('الرجاء كتابة التلميح أولاً!');
  socket.emit('submit_clue', { clue, count });
  document.getElementById('clue-word-input').value = '';
}

socket.on('receive_clue', (data) => {
  document.getElementById('current-clue-text').innerText = data.clue;
  document.getElementById('current-clue-count').innerText = data.count;
  document.getElementById('active-clue-display').classList.remove('hidden');
});

// رسم شبكة الكروت (حتى 50 كلمة)
function renderGameBoard(board) {
  const boardEl = document.getElementById('game-board');
  if (!board || board.length === 0) return;
  
  boardEl.innerHTML = board.map(card => `
    <div onclick="selectCard(${card.id})" class="game-card bg-gray-900 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-center text-center font-mono text-xs sm:text-sm font-bold text-cyan-300 shadow-lg hover:border-cyan-400 transition cursor-pointer h-16">
      <span>${card.word}</span>
    </div>
  `).join('');
}

function selectCard(cardId) {
  console.log(`Selected card ID: ${cardId}`);
  playSound('click');
}

function leaveRoom() {
  window.location.reload();
}

// --- 4. الشات العام (نصي وفويس نوت Base64 مع خيار الإخفاء والإظهار) ---
function toggleChatBox() {
  chatVisible = !chatVisible;
  const container = document.getElementById('chat-container');
  const btn = document.getElementById('chat-toggle-btn');
  if (chatVisible) {
    container.classList.remove('hidden');
    btn.innerText = 'إخفاء الشات';
  } else {
    container.classList.add('hidden');
    btn.innerText = 'إظهار الشات';
  }
}

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
      if (micIcon) {
        micIcon.classList.remove('fa-microphone');
        micIcon.classList.add('fa-stop', 'text-red-500', 'animate-pulse');
      }
    } catch (err) {
      alert('عفواً، لا يمكن الوصول إلى الميكروفون!');
      console.error(err);
    }
  } else {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    isRecordingActive = false;
    if (micIcon) {
      micIcon.classList.remove('fa-stop', 'text-red-500', 'animate-pulse');
      micIcon.classList.add('fa-microphone');
    }
  }
}

socket.on('receive_chat_message', (msg) => {
  playSound('ping');
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
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
  playSound('siren');
  document.body.classList.add('animate-bounce');
  setTimeout(() => document.body.classList.remove('animate-bounce'), 1000);

  if (antiCheatMsg) antiCheatMsg.innerText = data.message;
  if (antiCheatOverlay) antiCheatOverlay.classList.remove('hidden');

  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    const alertEl = document.createElement('div');
    alertEl.className = 'bg-red-950/80 border border-red-800 p-3 rounded-xl text-red-300 font-mono text-xs animate-pulse';
    alertEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation ml-1"></i> ${data.message}`;
    chatMessages.appendChild(alertEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

function dismissAntiCheat() {
  if (antiCheatOverlay) antiCheatOverlay.classList.add('hidden');
}

// --- 6. نظام الأصدقاء الحقيقيين ---
function addFriend() {
  const input = document.getElementById('friend-name-input');
  if (!input) return;
  const friendName = input.value.trim();
  if (!friendName) return;

  const friendsList = document.getElementById('friends-list');
  if (friendsList && friendsList.querySelector('.text-center')) {
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

  if (friendsList) friendsList.appendChild(friendItem);
  input.value = '';
}

function inviteFriend(friendName) {
  alert(`تم إرسال دعوة عمليات مباشرة إلى الهكر (${friendName}) بنجاح!`);
}
