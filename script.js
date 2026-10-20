// ==========================================
// 1. HIỆU ỨNG CÁNH HOA RƠI (CANVAS NỀN)
// ==========================================
const petalCanvas = document.getElementById('petal-canvas');
const petalCtx = petalCanvas.getContext('2d');

let petals = [];
const PETAL_COUNT = 35;

function resizePetalCanvas() {
  petalCanvas.width = window.innerWidth;
  petalCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizePetalCanvas);
resizePetalCanvas();

class Petal {
  constructor() {
    this.reset(true);
  }
  reset(initial = false) {
    this.x = Math.random() * petalCanvas.width;
    this.y = initial ? Math.random() * petalCanvas.height : -25;
    this.size = 7 + Math.random() * 9;
    this.speedY = 0.7 + Math.random() * 1.25;
    this.speedX = -0.5 + Math.random() * 1.0;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.025;
    this.opacity = 0.4 + Math.random() * 0.45;
    const colors = ['#ff80ab', '#ff4081', '#f8bbd0', '#ce93d8', '#ec407a'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.angle) * 0.4;
    this.angle += this.spin;
    if (this.y > petalCanvas.height + 30 || this.x < -40 || this.x > petalCanvas.width + 40) {
      this.reset(false);
    }
  }
  draw() {
    petalCtx.save();
    petalCtx.translate(this.x, this.y);
    petalCtx.rotate(this.angle);
    petalCtx.globalAlpha = this.opacity;
    petalCtx.fillStyle = this.color;
    petalCtx.beginPath();
    petalCtx.moveTo(0, 0);
    petalCtx.bezierCurveTo(this.size * 0.6, -this.size * 0.5, this.size, this.size * 0.3, 0, this.size);
    petalCtx.bezierCurveTo(-this.size, this.size * 0.3, -this.size * 0.6, -this.size * 0.5, 0, 0);
    petalCtx.fill();
    petalCtx.restore();
  }
}

for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal());

function animatePetals() {
  petalCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
  for (const p of petals) {
    p.update();
    p.draw();
  }
  requestAnimationFrame(animatePetals);
}
animatePetals();

// ==========================================
// 2. ÂM THANH & HỘP NHẠC WEB AUDIO API
// ==========================================
let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;

function ensureAudioCtx() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

const melodyNotes = [
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25,
  587.33, 698.46, 880.00, 1046.50, 880.00, 698.46,
  493.88, 587.33, 783.99, 987.77, 783.99, 587.33,
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25
];
let noteIndex = 0;

function playTone(freq, duration = 0.35, volume = 0.07, type = 'sine') {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.04);
}

function playWinChime() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
    setTimeout(() => playTone(f, 0.4, 0.09, 'triangle'), idx * 90);
  });
}

function startMusic() {
  if (isMusicPlaying) return;
  if (!ensureAudioCtx()) return;
  isMusicPlaying = true;
  const musicBtn = document.getElementById('music-toggle');
  const musicLabel = document.getElementById('music-label');
  musicBtn.classList.add('playing');
  if (musicLabel) musicLabel.textContent = 'Đang phát';

  playTone(melodyNotes[noteIndex], 1.2, 0.06);
  musicInterval = setInterval(() => {
    noteIndex = (noteIndex + 1) % melodyNotes.length;
    playTone(melodyNotes[noteIndex], 1.2, 0.06);
  }, 450);
}

function stopMusic() {
  isMusicPlaying = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  const musicBtn = document.getElementById('music-toggle');
  const musicLabel = document.getElementById('music-label');
  musicBtn.classList.remove('playing');
  if (musicLabel) musicLabel.textContent = 'Giai điệu';
}

document.getElementById('music-toggle').addEventListener('click', () => {
  if (isMusicPlaying) stopMusic();
  else startMusic();
});

// ==========================================
// 3. MỞ PHONG THƯ & BẮN HOA / TRÀ SỮA COMBO
// ==========================================
const openEnvelopeBtn = document.getElementById('open-envelope-btn');
const envelope = document.getElementById('envelope');
const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');

function spawnFloatingBurst(centerX, centerY, count = 12) {
  const emojis = ['💐', '🧋', '🌸', '💻', '💖', '🌷', '✨', '👑', '🎁'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'floating-burst';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const offsetX = (Math.random() - 0.5) * 280;
    const offsetY = (Math.random() - 0.5) * 110;
    el.style.left = `${centerX + offsetX}px`;
    el.style.top = `${centerY + offsetY}px`;
    el.style.animationDuration = `${1.2 + Math.random() * 0.9}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
}

function openEnvelope() {
  if (envelope.classList.contains('open')) return;
  envelope.classList.add('open');
  startMusic();
  spawnFloatingBurst(window.innerWidth / 2, window.innerHeight / 2, 18);
  setTimeout(() => {
    introScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');
  }, 900);
}

openEnvelopeBtn.addEventListener('click', openEnvelope);

let flowerCount = 0;
const sendFlowersBtn = document.getElementById('send-flowers-btn');
const flowerCounterEl = document.getElementById('flower-counter');
const comboRankText = document.getElementById('combo-rank-text');

sendFlowersBtn.addEventListener('click', () => {
  flowerCount++;
  flowerCounterEl.textContent = flowerCount;
  const rect = sendFlowersBtn.getBoundingClientRect();
  spawnFloatingBurst(rect.left + rect.width / 2, rect.top, 14);
  playTone(587.33 + (flowerCount % 6) * 60, 0.25, 0.08);

  if (flowerCount < 5) {
    comboRankText.textContent = `🌸 Đã gửi ${flowerCount} combo hoa & trà sữa tới chị em CNTT.B!`;
  } else if (flowerCount < 15) {
    comboRankText.textContent = `🔥 Danh hiệu: "Chuyên Gia Chiều Chị Em CNTT.B" (${flowerCount} combo)!`;
  } else if (flowerCount < 30) {
    comboRankText.textContent = `👑 Danh hiệu: "Nhà Tài Trợ Trà Sữa Kim Cương CNTT.B" (${flowerCount} combo)!`;
  } else {
    comboRankText.textContent = `🚀 Danh hiệu: "Huyền Thoại Ga-Lăng Nhất Lịch Sử CNTT.B" (${flowerCount} combo)!`;
  }
});

// ==========================================
// 4. CHUYỂN TAB TÂM THƯ & CHẠY CODE IT
// ==========================================
const tabNormalBtn = document.getElementById('tab-normal-btn');
const tabCodeBtn = document.getElementById('tab-code-btn');
const letterNormalView = document.getElementById('letter-normal-view');
const letterCodeView = document.getElementById('letter-code-view');
const runCodeBtn = document.getElementById('run-code-btn');
const codeOutput = document.getElementById('code-output');

tabNormalBtn.addEventListener('click', () => {
  tabNormalBtn.classList.add('active');
  tabCodeBtn.classList.remove('active');
  letterNormalView.classList.remove('hidden');
  letterCodeView.classList.add('hidden');
});

tabCodeBtn.addEventListener('click', () => {
  tabCodeBtn.classList.add('active');
  tabNormalBtn.classList.remove('active');
  letterCodeView.classList.remove('hidden');
  letterNormalView.classList.add('hidden');
});

runCodeBtn.addEventListener('click', () => {
  codeOutput.classList.remove('hidden');
  codeOutput.innerHTML = `> Compiling chuc_mung_20_10_cntt_b.js...<br/>
> ✅ Build Succeeded: 0 Errors, 0 Warnings, 0 Bugs!<br/>
> 🌸 Output: { lop: "CNTT.B", nhanSac: "1000/10", GPA: 4.0, hanhPhuc: "Trọn vẹn 365 ngày!" }`;
  playWinChime();
  const rect = runCodeBtn.getBoundingClientRect();
  spawnFloatingBurst(rect.left, rect.top, 14);
});

// ==========================================
// 5. TRÒ CHƠI #1: MÁY QUÉT NHAN SẮC & ĐỘ ĐÁNG YÊU AI
// ==========================================
const scannerInput = document.getElementById('scanner-name-input');
const scannerBtn = document.getElementById('scanner-btn');
const scannerLoading = document.getElementById('scanner-loading');
const scannerProgress = document.getElementById('scanner-progress');
const scannerStatus = document.getElementById('scanner-status-text');
const scannerResult = document.getElementById('scanner-result');

const aiTitles = [
  '👑 Nữ Thần Diệt Bug Phòng Lab',
  '🌸 Công Chúa Giao Diện Lớp CNTT.B',
  '🧋 Chiến Thần Trà Sữa Full Topping',
  '💎 Hoa Khôi Thuật Toán CNTT.B',
  '✨ Nàng Thơ Code Mượt Không Lỗi',
  '🚀 Tổng Tài Gánh Team Đồ Án',
  '🌷 Thiên Thần Nụ Cười Tỏa Nắng CNTT.B'
];

const sweetLevels = ['Full Topping 100%', 'Ngọt hơn trà sữa', 'Siêu cấp đáng yêu', 'Đỉnh nóc kịch trần'];
const luckLevels = ['Auto Qua Môn A+', 'Học bổng về tay', 'Code 1 phát ăn ngay', '10 điểm thực hành'];

function runBeautyScanner() {
  const rawName = scannerInput.value.trim();
  const girlName = rawName || 'Bạn Nữ Xinh Đẹp CNTT.B';

  scannerResult.classList.add('hidden');
  scannerLoading.classList.remove('hidden');
  scannerProgress.style.width = '15%';
  scannerStatus.textContent = `🔍 Đang quét dữ liệu nụ cười của ${girlName}...`;
  playTone(523.25, 0.2, 0.06);

  setTimeout(() => {
    scannerProgress.style.width = '55%';
    scannerStatus.textContent = '💻 Đang đo chỉ số dễ thương & khả năng khắc chế Bug...';
    playTone(659.25, 0.2, 0.06);
  }, 450);

  setTimeout(() => {
    scannerProgress.style.width = '95%';
    scannerStatus.textContent = '✨ Đang tổng hợp chứng nhận 20/10 từ Server CNTT.B...';
    playTone(783.99, 0.2, 0.06);
  }, 900);

  setTimeout(() => {
    scannerLoading.classList.add('hidden');
    scannerResult.classList.remove('hidden');

    // Hash nhẹ theo tên để vừa thú vị vừa đa dạng
    let hash = 0;
    for (let i = 0; i < girlName.length; i++) {
      hash = (hash * 31 + girlName.charCodeAt(i)) % 1000;
    }

    const title = aiTitles[Math.abs(hash + Math.floor(Math.random() * 3)) % aiTitles.length];
    const beautyScore = 999 + (hash % 901);

    document.getElementById('res-girl-name').textContent = girlName;
    document.getElementById('res-title-badge').textContent = title;
    document.getElementById('res-beauty').textContent = `${beautyScore}%`;
    document.getElementById('res-code').textContent = `${99 + (hash % 2)}.9%`;
    document.getElementById('res-sweet').textContent = sweetLevels[hash % sweetLevels.length];
    document.getElementById('res-luck').textContent = luckLevels[hash % luckLevels.length];

    document.getElementById('res-personal-wish').innerHTML =
      `💌 <strong>Lời nhắn gửi ${girlName}:</strong> Hệ thống AI lớp <strong>CNTT.B</strong> xác nhận <strong>${girlName}</strong> sở hữu năng lượng tích cực và sự đáng yêu vượt mức quy định! Chúc bạn ngày 20/10 ngập tràn niềm vui, luôn xinh đẹp rạng ngời và đạt điểm <strong>A+</strong> mọi môn học nhé!`;

    playWinChime();
    const rect = scannerResult.getBoundingClientRect();
    spawnFloatingBurst(rect.left + rect.width / 2, rect.top + 40, 15);
  }, 1350);
}

scannerBtn.addEventListener('click', runBeautyScanner);
scannerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runBeautyScanner();
});

// ==========================================
// 6. TRÒ CHƠI #2: VÒNG QUAY NHÂN PHẨM 20/10
// ==========================================
const wheelCanvas = document.getElementById('wheel-canvas');
const wheelCtx = wheelCanvas.getContext('2d');
const spinWheelBtn = document.getElementById('spin-wheel-btn');
const wheelResultBox = document.getElementById('wheel-result-box');

let wheelPrizes = [
  '🧋 1 Ly Trà Sữa Full Topping',
  '💯 Bùa Auto Qua Môn A+',
  '🍰 1 Phần Bánh Ngọt / Ăn Vặt',
  '👑 Nữ Hoàng CNTT.B Hôm Nay',
  '🛠️ 1 Vé Nhờ Nam Gánh Đồ Án',
  '💐 Ngàn Hoa & Tràng Pháo Tay',
  '🎁 Món Quà Bí Mật Từ Lớp',
  '✨ Miễn Bị Gọi Tên Lên Bảng'
];

const wheelColors = [
  '#e11d74', '#ff5c97', '#9333ea', '#ec4899',
  '#d946ef', '#f43f5e', '#7c3aed', '#fb7185'
];

let currentWheelAngle = 0;
let isSpinning = false;

function drawWheel() {
  const num = wheelPrizes.length;
  const arc = (Math.PI * 2) / num;
  const radius = wheelCanvas.width / 2;

  wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

  for (let i = 0; i < num; i++) {
    const angle = currentWheelAngle + i * arc;
    wheelCtx.beginPath();
    wheelCtx.fillStyle = wheelColors[i % wheelColors.length];
    wheelCtx.moveTo(radius, radius);
    wheelCtx.arc(radius, radius, radius - 4, angle, angle + arc);
    wheelCtx.lineTo(radius, radius);
    wheelCtx.fill();

    wheelCtx.strokeStyle = 'rgba(255,255,255,0.6)';
    wheelCtx.lineWidth = 2;
    wheelCtx.stroke();

    // Vẽ chữ trên từng ô
    wheelCtx.save();
    wheelCtx.translate(radius, radius);
    wheelCtx.rotate(angle + arc / 2);
    wheelCtx.textAlign = 'right';
    wheelCtx.fillStyle = '#ffffff';
    wheelCtx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
    const label = wheelPrizes[i].length > 22 ? wheelPrizes[i].slice(0, 21) + '…' : wheelPrizes[i];
    wheelCtx.fillText(label, radius - 16, 4);
    wheelCtx.restore();
  }

  // Tâm vòng quay
  wheelCtx.beginPath();
  wheelCtx.arc(radius, radius, 26, 0, Math.PI * 2);
  wheelCtx.fillStyle = '#ffffff';
  wheelCtx.fill();
  wheelCtx.lineWidth = 4;
  wheelCtx.strokeStyle = '#e11d74';
  wheelCtx.stroke();

  wheelCtx.fillStyle = '#e11d74';
  wheelCtx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
  wheelCtx.textAlign = 'center';
  wheelCtx.fillText('20/10', radius, radius + 4);
}

drawWheel();

spinWheelBtn.addEventListener('click', () => {
  if (isSpinning) return;
  isSpinning = true;
  spinWheelBtn.disabled = true;
  wheelResultBox.innerHTML = '🎡 Vòng quay đang xoay... Chờ xem nhân phẩm 20/10 của bạn nhé!';

  const extraSpins = 5 + Math.random() * 4;
  const totalRotation = extraSpins * Math.PI * 2 + Math.random() * Math.PI * 2;
  const startAngle = currentWheelAngle;
  const duration = 3600;
  const startTime = performance.now();
  let lastTickSlice = -1;

  function animateWheel(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4);

    currentWheelAngle = startAngle + totalRotation * easeOut;
    drawWheel();

    const num = wheelPrizes.length;
    const arc = (Math.PI * 2) / num;
    const currentSlice = Math.floor((currentWheelAngle % (Math.PI * 2)) / arc);
    if (currentSlice !== lastTickSlice && progress < 0.96) {
      lastTickSlice = currentSlice;
      playTone(440 + (currentSlice % 4) * 50, 0.06, 0.04);
    }

    if (progress < 1) {
      requestAnimationFrame(animateWheel);
    } else {
      isSpinning = false;
      spinWheelBtn.disabled = false;

      // Kim chỉ ở góc -PI/2 (12 giờ)
      const normalized = ((Math.PI * 1.5 - (currentWheelAngle % (Math.PI * 2))) + Math.PI * 2) % (Math.PI * 2);
      const winningIndex = Math.floor(normalized / arc) % num;
      const prize = wheelPrizes[winningIndex];

      wheelResultBox.innerHTML = `🎉 <strong>Chúc mừng! Bạn quay trúng:</strong><br/><span style="font-size:1.2rem;color:#e11d74;font-weight:800;">${prize}</span>`;
      playWinChime();
      const rect = wheelCanvas.getBoundingClientRect();
      spawnFloatingBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
    }
  }

  requestAnimationFrame(animateWheel);
});

// ==========================================
// 7. TRÒ CHƠI #3: KHUI TÚI MÙ 20/10 (BLIND BOXES)
// ==========================================
const blindBoxSecrets = [
  {
    emoji: '🍀',
    title: 'Bùa Code Mượt Không Bug',
    desc: 'Mọi đồ án và bài tập lớn trong kỳ này đều chạy xanh mượt ngay từ lần Build đầu tiên!'
  },
  {
    emoji: '🧋',
    title: 'Bùa Ăn Uống Không Tăng Cân',
    desc: 'Uống trà sữa, ăn bánh tráng, lẩu nướng thả ga mà dáng vẫn chuẩn, da vẫn xinh!'
  },
  {
    emoji: '💯',
    title: 'Bùa Học Bổng & GPA 4.0',
    desc: 'Đi thi khoanh đâu trúng đó, thầy cô quý mến, điểm tổng kết toàn A với A+!'
  },
  {
    emoji: '👑',
    title: 'Secret Rare: Nữ Thần CNTT.B',
    desc: 'Bạn mở trúng túi mù hiếm nhất! Chúc bạn luôn tỏa sáng rực rỡ và gặp vạn điều may!'
  },
  {
    emoji: '💖',
    title: 'Bùa Tình Duyên & Hạnh Phúc',
    desc: 'Luôn được yêu thương, chiều chuộng và mỗi ngày đi học cùng lớp CNTT.B đều là một ngày vui!'
  },
  {
    emoji: '💎',
    title: 'Bùa Tài Lộc Đầy Túi',
    desc: 'Ví lúc nào cũng rủng rỉnh, săn sale 0đ bách phát bách trúng, nhận quà mỏi tay!'
  }
];

const blindboxGrid = document.getElementById('blindbox-grid');
const resetBlindboxBtn = document.getElementById('reset-blindbox-btn');

function renderBlindBoxes() {
  blindboxGrid.innerHTML = '';
  const shuffled = [...blindBoxSecrets].sort(() => Math.random() - 0.5);

  shuffled.forEach((secret, index) => {
    const box = document.createElement('div');
    box.className = 'blindbox-item';
    box.innerHTML = `
      <div class="box-emoji">🎀</div>
      <div class="box-title">Túi Mù CNTT.B #${index + 1}</div>
      <div class="box-sub">Chạm để xé túi mù xem bùa may mắn 20/10!</div>
    `;

    box.addEventListener('click', () => {
      if (box.classList.contains('opened')) return;
      box.classList.add('opened');
      box.innerHTML = `
        <div class="box-emoji">${secret.emoji}</div>
        <div class="box-title">${secret.title}</div>
        <div class="box-sub">${secret.desc}</div>
      `;
      playWinChime();
      const rect = box.getBoundingClientRect();
      spawnFloatingBurst(rect.left + rect.width / 2, rect.top + 30, 10);
    });

    blindboxGrid.appendChild(box);
  });
}

renderBlindBoxes();
resetBlindboxBtn.addEventListener('click', () => {
  renderBlindBoxes();
  playTone(659.25, 0.2, 0.06);
});

// ==========================================
// 8. TRÒ CHƠI #4: MINI-GAME HỨNG QUÀ 20/10 — NÉ BUG ĐỎ
// ==========================================
const arcadeCanvas = document.getElementById('arcade-canvas');
const arcadeCtx = arcadeCanvas.getContext('2d');
const arcadeOverlay = document.getElementById('arcade-overlay');
const startGameBtn = document.getElementById('start-game-btn');
const scoreEl = document.getElementById('game-score');
const timeEl = document.getElementById('game-time');
const bestEl = document.getElementById('game-best');
const arcadeTitle = document.getElementById('arcade-title');
const arcadeSubtitle = document.getElementById('arcade-subtitle');
const arcadeIcon = document.getElementById('arcade-icon');

let gameRunning = false;
let gameScore = 0;
let bestScore = 0;
let timeLeft = 25;
let gameTimerInterval = null;
let fallingItems = [];
let popups = [];

const basket = {
  x: 250,
  y: 290,
  width: 105,
  height: 34
};

const itemTypes = [
  { emoji: '💐', points: 15, speed: 2.6, good: true },
  { emoji: '🧋', points: 15, speed: 2.8, good: true },
  { emoji: '🎁', points: 20, speed: 3.1, good: true },
  { emoji: '🅰️', points: 30, speed: 3.6, good: true },
  { emoji: '🐛', points: -15, speed: 3.2, good: false },
  { emoji: '⏰', points: -10, speed: 3.0, good: false }
];

function updateBasketPosition(clientX) {
  const rect = arcadeCanvas.getBoundingClientRect();
  const scaleX = arcadeCanvas.width / rect.width;
  const relX = (clientX - rect.left) * scaleX;
  basket.x = Math.max(8, Math.min(arcadeCanvas.width - basket.width - 8, relX - basket.width / 2));
}

arcadeCanvas.addEventListener('mousemove', (e) => {
  if (gameRunning) updateBasketPosition(e.clientX);
});

arcadeCanvas.addEventListener('touchmove', (e) => {
  if (gameRunning && e.touches.length > 0) {
    e.preventDefault();
    updateBasketPosition(e.touches[0].clientX);
  }
}, { passive: false });

function spawnGameItem() {
  const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  fallingItems.push({
    x: 24 + Math.random() * (arcadeCanvas.width - 48),
    y: -20,
    emoji: type.emoji,
    points: type.points,
    speed: type.speed + Math.random() * 1.2,
    good: type.good
  });
}

function endGame() {
  gameRunning = false;
  clearInterval(gameTimerInterval);
  if (gameScore > bestScore) {
    bestScore = gameScore;
    bestEl.textContent = bestScore;
  }

  arcadeOverlay.classList.remove('hidden');
  arcadeIcon.textContent = '🏆';
  arcadeTitle.textContent = `Hoàn thành! Bạn đạt ${gameScore} điểm!`;

  let rankMsg = 'Chiến thần săn quà thực thụ của lớp CNTT.B! 💖';
  if (gameScore >= 180) {
    rankMsg = '👑 Đỉnh cao! Không một con Bug nào làm khó được nữ thần CNTT.B!';
  } else if (gameScore < 60) {
    rankMsg = '🌸 Chơi lại thử thách kỷ lục cao hơn nha!';
  }
  arcadeSubtitle.textContent = rankMsg;
  startGameBtn.textContent = '🔄 Chơi Lại Lần Nữa';
  playWinChime();
}

function gameLoop() {
  if (!gameRunning) return;

  arcadeCtx.clearRect(0, 0, arcadeCanvas.width, arcadeCanvas.height);

  // Tỉ lệ sinh vật phẩm
  if (Math.random() < 0.065) spawnGameItem();

  // Vẽ giỏ hứng quà CNTT.B
  arcadeCtx.fillStyle = '#ff4785';
  arcadeCtx.beginPath();
  arcadeCtx.roundRect(basket.x, basket.y, basket.width, basket.height, 14);
  arcadeCtx.fill();
  arcadeCtx.strokeStyle = '#ffffff';
  arcadeCtx.lineWidth = 2;
  arcadeCtx.stroke();

  arcadeCtx.fillStyle = '#ffffff';
  arcadeCtx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
  arcadeCtx.textAlign = 'center';
  arcadeCtx.fillText('🧺 CNTT.B', basket.x + basket.width / 2, basket.y + 22);

  // Cập nhật các vật phẩm rơi
  for (let i = fallingItems.length - 1; i >= 0; i--) {
    const item = fallingItems[i];
    item.y += item.speed;

    arcadeCtx.font = '26px sans-serif';
    arcadeCtx.textAlign = 'center';
    arcadeCtx.fillText(item.emoji, item.x, item.y);

    // Kiểm tra va chạm với giỏ
    if (
      item.y >= basket.y - 6 &&
      item.y <= basket.y + basket.height + 8 &&
      item.x >= basket.x - 10 &&
      item.x <= basket.x + basket.width + 10
    ) {
      gameScore = Math.max(0, gameScore + item.points);
      scoreEl.textContent = gameScore;

      popups.push({
        x: item.x,
        y: basket.y - 10,
        text: item.points > 0 ? `+${item.points}` : `${item.points}`,
        color: item.good ? '#50fa7b' : '#ff5555',
        alpha: 1
      });

      if (item.good) playTone(783.99, 0.15, 0.07);
      else playTone(196.0, 0.25, 0.08, 'sawtooth');

      fallingItems.splice(i, 1);
      continue;
    }

    if (item.y > arcadeCanvas.height + 30) {
      fallingItems.splice(i, 1);
    }
  }

  // Hiệu ứng chữ điểm bay lên
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y -= 1.2;
    p.alpha -= 0.03;
    arcadeCtx.save();
    arcadeCtx.globalAlpha = Math.max(0, p.alpha);
    arcadeCtx.fillStyle = p.color;
    arcadeCtx.font = 'bold 15px "JetBrains Mono", monospace';
    arcadeCtx.fillText(p.text, p.x, p.y);
    arcadeCtx.restore();
    if (p.alpha <= 0) popups.splice(i, 1);
  }

  requestAnimationFrame(gameLoop);
}

startGameBtn.addEventListener('click', () => {
  gameScore = 0;
  timeLeft = 25;
  fallingItems = [];
  popups = [];
  scoreEl.textContent = '0';
  timeEl.textContent = '25';
  arcadeOverlay.classList.add('hidden');
  gameRunning = true;

  clearInterval(gameTimerInterval);
  gameTimerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);

  requestAnimationFrame(gameLoop);
});

// ==========================================
// 9. KHẢO SÁT 10 ĐIỂM (NÚT "1 ĐIỂM" CHẠY TRỐN)
// ==========================================
const yesLoveBtn = document.getElementById('yes-love-btn');
const noLoveBtn = document.getElementById('no-love-btn');
const celebrationModal = document.getElementById('celebration-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

const funnyNoTexts = [
  'Ơ kìa bấm nhầm nút rồi 😂',
  'Lỗi 404: Không tìm thấy nút chê!',
  'Thôi cho 9.9 điểm làm tròn 10 nha 🥺',
  'Nút này bị khóa quyền Admin rồi 😜',
  'Chị em CNTT.B ai lại bấm nút này 💕'
];
let noClickCount = 0;

function dodgeNoButton() {
  noClickCount++;
  noLoveBtn.textContent = funnyNoTexts[noClickCount % funnyNoTexts.length];
  const scale = Math.min(1 + noClickCount * 0.1, 1.55);
  yesLoveBtn.style.transform = `scale(${scale})`;

  const randomX = (Math.random() - 0.5) * 150;
  const randomY = (Math.random() - 0.5) * 55;
  noLoveBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
}

noLoveBtn.addEventListener('mouseover', dodgeNoButton);
noLoveBtn.addEventListener('click', dodgeNoButton);

yesLoveBtn.addEventListener('click', () => {
  celebrationModal.classList.remove('hidden');
  playWinChime();
  spawnFloatingBurst(window.innerWidth / 2, window.innerHeight / 2, 26);
});

closeModalBtn.addEventListener('click', () => {
  celebrationModal.classList.add('hidden');
});

// ==========================================
// 10. TUỲ CHỈNH NỘI DUNG & VÒNG QUAY
// ==========================================
const customizeToggle = document.getElementById('customize-toggle');
const customizeModal = document.getElementById('customize-modal');
const saveCustomBtn = document.getElementById('save-custom-btn');
const cancelCustomBtn = document.getElementById('cancel-custom-btn');
const inputSender = document.getElementById('input-sender');
const inputWheelItems = document.getElementById('input-wheel-items');

customizeToggle.addEventListener('click', () => {
  inputWheelItems.value = wheelPrizes.join('\n');
  customizeModal.classList.remove('hidden');
});

cancelCustomBtn.addEventListener('click', () => {
  customizeModal.classList.add('hidden');
});

saveCustomBtn.addEventListener('click', () => {
  const sender = inputSender.value.trim();
  if (sender) {
    document.getElementById('display-sender').textContent = sender;
  }

  const customPrizes = inputWheelItems.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  if (customPrizes.length >= 2) {
    wheelPrizes = customPrizes;
    drawWheel();
  }

  customizeModal.classList.add('hidden');
  spawnFloatingBurst(window.innerWidth / 2, window.innerHeight / 2, 10);
});
