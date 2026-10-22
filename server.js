const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تقديم الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// القواميس المتعددة (سيبراني، عام سوداني، وهندسة كهربائية)
const dictionaries = {
  // 1. قاموس الأمن السيبراني والتقني
  cyber: [
    "جدار حماية", "شبكة افتراضية", "بوابة الشبكة", "حزمة بيانات", "محلل الحزم", "عنوان بروتوكول", "موجه الشبكة", "مبدل الشبكة",
    "بروتوكول آمن", "بوابة آمنة", "نطاق ترددي", "مزود الخدمة", "خدمة الأسماء", "نظام النطاقات", "اتصال مشفر", "قناة آمنة",
    "مسار الشبكة", "مراقبة الحركة", "تخزين مؤقت", "مخدم وهمي", "عزل الشبكة", "جسر الشبكة", "خط نقل البيانات", "تردد لاسلكي",
    "شبكة محلية", "شبكة واسعة", "منفذ الاتصال", "مقبس الشبكة", "مراقبة الحزم", "جدار حماية تطبيق", "موازن الحمل", "وكيل عكسي",
    "خادم بروكسي", "نظام التوجيه", "عنوان محلي", "عنوان عام", "شبكة فرعية", "قناع الشبكة", "بث توجيهي", "مذبذب الشبكة",
    "ثغرة صفرية", "تشفير مفتاح عام", "مفتاح خاص", "مفتاح عام", "تشفير تام", "التوقيع الرقمي", "شهادة رقمية", "بصمة رقمية",
    "خوارزمية التشفير", "دالة الهاش", "تشفير تناظري", "تشفير غير تناظري", "سلطة الإصدار", "سجل الشهادات", "إبطال الشهادة", "منع التنصت",
    "مصادقة ثنائية", "مصادقة متعددة", "رمز التحقق", "كلمة مرور مؤقتة", "بصمة الإصبع", "التعرف على الوجه", "التحقق البيومتري", "بطاقة ذكية",
    "تشفير القرص", "حاوية مشفرة", "ذاكرة مشفرة", "إدارة المفاتيح", "خزنة كلمات المرور", "تشفير الاتصال", "نظام المفتاح العام", "توقيع مصدق",
    "برمجية خبيثة", "برمجية فدية", "كود ضار", "هجوم حجب الخدمة", "هجوم الحرمان", "حصان طروادة", "فيروس حاسوبي", "دودة حاسوبية",
    "برمجية تجسس", "برمجية إعلانية", "سجيل ضربات لوحة المفاتيح", "جذر النظام", "باب خلفي", "ثغرة أمنية", "استغلال الثغرات", "حقن قواعد بيانات",
    "حقن الأوامر", "هجوم الوسيط", "تسميم ذاكرة التخزين المؤقت", "تزوير الطلبات", "تجاوز حدود المخزن المؤقت", "هجوم القوة الغاشمة", "تخمين كلمات المرور", "تصيد احتيالي",
    "اختراق اجتماعي", "خداع المستخدم", "برمجية زومبي", "شبكة الروبوتات", "التحكم عن بعد", "استخراج البيانات", "سرقة الهوية", "تسريب بيانات",
    "لغة برمجة", "مترجم أكواد", "مفسر الأكواد", "بيئة تطوير", "محرر النصوص", "إدارة الإصدارات", "مستودع الأكواد", "فرع البرمجة",
    "قاعدة بيانات", "جدول البيانات", "حقل البيانات", "مفتاح أساسي", "مفتاح أجنبي", "استعلام البيانات", "تصفية البيانات", "فرز البيانات",
    "محلل الأنظمة", "مهندس الشبكات", "مدير قواعد البيانات", "مختبر الاختراق", "مستشار الأمان", "محلل البيانات", "مبرمج النظم", "مدير المشروع"
  ],

  // 2. قاموس عام باللهجة السودانية (300+ كلمة ومصطلح)
  sudani: [
    "زول", "شاي", "قهوة", "تلاجة", "ملاسي", "عصيدة", "كمبريسر", "ركشة", "أمجد", "سوق ليبيا",
    "العربي", "الحلفاية", "بحري", "الخرطوم", "أمدرمان", "الثورة", "البركل", "مروي", "عطبرة", "بورتسودان",
    "كسلا", "القرين", "سواكن", "مدني", "الدويم", "كوستي", "البيض", "البلابل", "حقيبة", "ندوة",
    "كابلي", "ورددي", "المصطفي", "سيد خليفة", "عبد الرحيم", "عثمان حسين", "الريد", "الشوق", "الغربة", "البلد",
    "العنقريب", "البنبر", "البرش", "الزير", "القفة", "الشنطة", "المركوب", "الجلابية", "العمامة", "الشال",
    "السِعن", "اللبن", "الكسرة", "الويكة", "البامية", "الملاح", "التقلية", "الشوربة", "اللقمة", "البلة",
    "البلدي", "الشطارة", "الشهامة", "الفزع", "النفير", "الواجب", "الناس", "الحيشان", "الجيران", "البيت",
    "الحوبة", "الكتف", "الظهر", "العرضة", "السينما", "الاستديو", "الجريدة", "الإذاعة", "التلفزيون", "الراديو",
    "البطارية", "الشاحن", "اللمبة", "المروحة", "المكيف", "الباب", "الشباك", "الحيطة", "البلاط", "السقف",
    "الشارع", "الزقاق", "الميدان", "السوق", "الدكان", "الفرن", "الجزارة", "الخضري", "الترزي", "النجار",
    "الحداد", "الميكانيكي", "الرزاز", "المطر", "الخريف", "الصيف", "الشتاء", "الهواء", "الغبار", "التراب",
    "القمري", "اليمام", "العصفور", "الغراب", "الكلب", "القطو", "الحمار", "الحصان", "الجمل", "الخروف",
    "النعجة", "التور", "البقرة", "اللبانة", "الساقية", "البئر", "الترعة", "النيل", "المقرن", "التuti",
    "الصحافة", "الرياض", "المنشية", "الطائف", "المعمورة", "الامتداد", "جبرة", "العزبة", "الحته", "المنطقة",
    "الكلام", "النقاش", "الونسة", "الشمار", "الخبر", "الجريدة", "المجلة", "الكتاب", "الدفتر", "القلم",
    "المسطرة", "الممساحة", "الطباشير", "السبورة", "المدرسة", "الجامعة", "الكلية", "الدفعة", "المحاضرة", "الامتحان",
    "النتيجة", "الشهادة", "النجاح", "الرسوب", "القِسم", "العميد", "الدكتور", "المهندس", "الأستاذ", "الطالب",
    "الزامل", "الرفيق", "الصاحب", "الأخ", "الخت", "الخالة", "العم", "الخال", "الجد", "الجدة",
    "الحفيد", "الولد", "البنت", "الزولة", "الصبية", "الشاب", "الزول السمح", "الكرم", "الضيافة", "القهوة",
    "الجبنة", "البخور", "اللبان", "الفرح", "العرس", "الختان", "السبوع", "السمح", "الشين", "الكبير",
    "الصغير", "الغالي", "الرخيص", "السمين", "الضعيف", "الطويل", "القصير", "الأبيض", "الأسود", "الأحمر",
    "الأخضر", "الأزرق", "الأصفر", "الرمادي", "الذهب", "الفضة", "النحاس", "الحديد", "الخشب", "الجلود",
    "الفخار", "الطين", "الرمل", "الحصى", "الصخر", "الجبل", "الوادي", "الصحراء", "الغابة", "الروضة",
    "البستان", "النخلة", "النبق", "المنقا", "الجوافة", "الليمون", "البرتقال", "الموز", "البطيخ", "الشطة",
    "البصل", "الثوم", "الطماطم", "الباذنجان", "الجزر", "البطاطس", "الأسود", "الأبيض", "السمسم", "الفول"
  ],

  // 3. قاموس هندسة الكهرباء (200+ مصطلح تخصصي)
  engineering: [
    "محول كهربائي", "مولد ديزل", "توربينات بخارية", "شبكة نقل", "محطة فرعية", "جهد عالي", "جهد منخفض", "تيار متردد",
    "تيار مستمر", "قانون أوم", "معاوقة كهربية", "سعة كهربائية", "محاثة مغناطيسية", "فيض مغناطيسي", "قلب حديد", "ملف نحاسي",
    "قاطع مدار", "منصهر أمان", "لوحة توزيع", "كابل أرضي", "خط هوائي", "عازل بورسلين", "تأريض كهربائي", "حماية تفاضلية",
    "مرحل حماية", "لوحة تحكم", "محرك حثي", "محرك توافقي", "محول قياس", "محول جهد", "محول تيار", "عكس الطور",
    "اتزان الأحمال", "معامل القدرة", "توافقيات الشبكة", "مرشح توافقي", "مفتاح زيتي", "قاطع سداسي", "محطة طاقة", "طاقة شمسية",
    "ألواح ضوئية", "عكس الطاقة", "بطارية تخزين", "شاحن بطاريات", "منظم جهد", "حمل استقرائي", "حمل سعوي", "حمل مادي",
    "دائرة قصر", "فقد الطاقة", "كفاءة المنظومة", "تحليل الأحمال", "تيار البدء", "عزم الدوران", "سرعة التزامن", "انزلاق المحرك",
    "مجال مغناطيسي", "عضو استاتيكي", "عضو دوار", "فرشاة كربونية", "حلقات الانزلاق", "منظم السرعة", "صمام التبخير", "دائرة التحكم",
    "حساس الحرارة", "حساس الاهتزاز", "مقاومة حرارية", "جهاز قياس", "مقياس الذبذبة", "مقياس القدرة", "محلل الطاقة", "اختبار العزل",
    "فحص التفريغ", "مقاومة التأريض", "مخطط أحادي", "مخطط زمني", "رمز الهندسة", "لوحة المخططات", "كود التصميم", "معايير السلامة",
    "معدات الوقاية", "قفازات عازلة", "بدلة مقاومة", "تصريح العمل", "إيقاف الطوارئ", "تفريق الشحنات", "مأخذ أرضي", "شبكة حماية",
    "صاعقة رعدية", "مانعة الصواعق", "تفريغ كهربائي", "قوس كهربائي", "انهيار العزل", "شيخوخة الكابلات", "ارتفاع الجهد", "انخفاض الجهد",
    "انقطاع الخدمة", "استعادة التيار", "إدارة الطاقة", "ترشيد الاستهلاك", "عداد ذكي", "قراءة عن بعد", "تحكم سكادا", "نظام الإسكادا",
    "وحدة التحكم", "حاسب التحكم", "إشارات رقمية", "إشارات تناظرية", "محول إشارات", "مضخم العمليات", "بوابة منطقية", "متحكم دقيق",
    "لوحة تطوير", "حساسات المجال", "محرك خطوي", "صمام كهربي", "مضخة مياه", "حماية السخونة", "تبريد زيتي", "تبريد هوائي",
    "مبادل حراري", "توربين مائي", "سد النهضة", "خزان مائي", "محطة كهرومائية", "طاقة الرياح", "مزرعة رياح", "شاحن توربيني",
    "مقوم تيار", "عاكس تيار", "مغير التردد", "حماية الزيادة", "حماية النقص", "تتابع الأطوار", "فقد الأطوار", "تأريض مؤقت",
    "مفتاح السكين", "قاطع هوائي", "صندوق التوصيل", "ماسورة حماية", "قناة الكابلات", "غرفة الكابلات", "غرفة المحولات", "سياج أمني",
    "إضاءة الطوارئ", "مولد احتياطي", "نظام اليوبي إس", "بطاريات طوارئ", "محطة متنقلة", "عربة الصيانة", "رافعة هيدروليكية", "عدة العدة",
    "مفتاح ربط", "جهاز لحام", "قاطع كابلات", "شريط عازل", "معجون حراري", "كاشف الأعطال", "كاميرا حرارية", "منظار بصري"
  ]
};

// تخزين الغرف النشطة في الذاكرة
const rooms = {};

// دالة لتوليد كود غرفة عشوائي من 5 أحرف
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

// دالة لتوليد الكروت عشوائياً بناءً على نوع القاموس والعدد
function generateBoard(dictionaryType, totalWords) {
  const pool = [...dictionaries[dictionaryType] || dictionaries.cyber];
  const shuffled = pool.sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, totalWords);
  
  return selectedWords.map((word, index) => ({
    id: index,
    word: word,
    revealed: false,
    type: 'neutral'
  }));
}

io.on('connection', (socket) => {
  console.log(`[CONNECTION] User connected: ${socket.id}`);

  // تسجيل البروفايل (الاسم، كلمة المرور، والصورة Base64)
  socket.on('register_profile', (profileData) => {
    socket.userProfile = {
      id: socket.id,
      name: profileData.name || 'Hacker_Anonymous',
      password: profileData.password || '',
      avatar: profileData.avatar || null
    };
    socket.emit('profile_registered', socket.userProfile);
  });

  // إنشاء غرفة جديدة مع اختيار القاموس والفرق
  socket.on('create_room', (settings) => {
    const roomCode = generateRoomCode();
    const wordCount = parseInt(settings.wordCount) || 25;
    const dictionaryType = settings.dictionaryType || 'cyber';
    
    rooms[roomCode] = {
      code: roomCode,
      host: socket.id,
      password: settings.password || '',
      settings: {
        dictionaryType: dictionaryType,
        wordCount: wordCount,
        timer: parseInt(settings.timer) || 60
      },
      players: [socket.userProfile],
      teams: {
        red: { spymaster: null, players: [socket.userProfile] },
        blue: { spymaster: null, players: [] }
      },
      board: generateBoard(dictionaryType, wordCount),
      gameState: 'waiting'
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    
    socket.emit('room_created', { roomCode, room: rooms[roomCode] });
    console.log(`[ROOM CREATED] Code: ${roomCode} by ${socket.userProfile.name}`);
  });

  // الانضمام إلى غرفة موجودة
  socket.on('join_room', ({ roomCode, password }) => {
    const room = rooms[roomCode];
    
    if (!room) {
      return socket.emit('error_message', 'عفواً، هذه الغرفة غير موجودة!');
    }

    if (room.password && room.password !== password) {
      return socket.emit('error_message', 'كلمة مرور الغرفة غير صحيحة!');
    }

    if (!socket.userProfile) {
      return socket.emit('error_message', 'يرجى تسجيل البروفايل أولاً!');
    }

    socket.join(roomCode);
    socket.roomCode = roomCode;
    room.players.push(socket.userProfile);
    room.teams.blue.players.push(socket.userProfile); // انضمام افتراضي للفريق الأزرق

    io.to(roomCode).emit('update_room_state', room);
    socket.emit('room_joined', room);
    console.log(`[USER JOINED] ${socket.userProfile.name} joined room ${roomCode}`);
  });

  // تغيير الفريق أو الدور (قائد Spymaster أو لاعب ميداني Operative)
  socket.on('change_team_role', ({ team, role }) => {
    const room = rooms[socket.roomCode];
    if (!room) return;

    // إزالة اللاعب من جميع الفرق والأدوار السابقة
    room.teams.red.players = room.teams.red.players.filter(p => p.id !== socket.id);
    room.teams.blue.players = room.teams.blue.players.filter(p => p.id !== socket.id);
    if (room.teams.red.spymaster === socket.id) room.teams.red.spymaster = null;
    if (room.teams.blue.spymaster === socket.id) room.teams.blue.spymaster = null;

    // إضافة اللاعب للفريق الجديد والدور الجديد
    room.teams[team].players.push(socket.userProfile);
    if (role === 'spymaster') {
      room.teams[team].spymaster = socket.id;
    }

    io.to(socket.roomCode).emit('update_room_state', room);
  });

  // محاولة بدء اللعبة (التحقق من اكتمال الفريقين، أقل شيء لاعبين لكل فريق)
  socket.on('start_game', () => {
    const room = rooms[socket.roomCode];
    if (!room) return;

    const redCount = room.teams.red.players.length;
    const blueCount = room.teams.blue.players.length;

    if (redCount < 2 || blueCount < 2) {
      return socket.emit('error_message', 'لا يمكن بدء اللعبة! يجب أن يحتوي كل فريق على لاعبين اثنين على الأقل.');
    }

    room.gameState = 'playing';
    io.to(socket.roomCode).emit('game_started', room);
  });

  // إرسال تلميح من قائد الفريق (Spymaster)
  socket.on('submit_clue', (data) => {
    const room = rooms[socket.roomCode];
    if (!room) return;

    io.to(socket.roomCode).emit('receive_clue', {
      sender: socket.userProfile.name,
      clue: data.clue,
      count: data.count
    });
  });

  // الشات العام
  socket.on('send_chat_message', (data) => {
    if (!socket.roomCode || !rooms[socket.roomCode]) return;
    
    const messagePayload = {
      sender: socket.userProfile.name,
      avatar: socket.userProfile.avatar,
      type: data.type,
      content: data.content,
      timestamp: new Date().toLocaleTimeString()
    };

    io.to(socket.roomCode).emit('receive_chat_message', messagePayload);
  });

  // نظام مكافحة الغش
  socket.on('anti_cheat_violation', (reason) => {
    if (!socket.roomCode || !rooms[socket.roomCode]) return;
    
    const playerName = socket.userProfile ? socket.userProfile.name : 'مستخدم مجهول';
    io.to(socket.roomCode).emit('anti_cheat_alert', {
      player: playerName,
      reason: reason,
      message: `[إنذار أمني]: اللاعب (${playerName}) حاول الغش (انتقل إلى تطبيق خارجي أو غادر المتصفح)!`
    });
  });

  // قطع الاتصال
  socket.on('disconnect', () => {
    console.log(`[DISCONNECT] User disconnected: ${socket.id}`);
    if (socket.roomCode && rooms[socket.roomCode]) {
      const room = rooms[socket.roomCode];
      room.players = room.players.filter(p => p.id !== socket.id);
      room.teams.red.players = room.teams.red.players.filter(p => p.id !== socket.id);
      room.teams.blue.players = room.teams.blue.players.filter(p => p.id !== socket.id);
      if (room.teams.red.spymaster === socket.id) room.teams.red.spymaster = null;
      if (room.teams.blue.spymaster === socket.id) room.teams.blue.spymaster = null;
      
      if (room.players.length === 0) {
        delete rooms[socket.roomCode];
        console.log(`[ROOM DELETED] Room ${socket.roomCode} is empty.`);
      } else {
        io.to(socket.roomCode).emit('update_room_state', room);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[SERVER RUNNING] CyberNames server is active on port ${PORT}`);
});
