/* ================================================================
   Life Dashboard — script.js
   Ikhwan Marditya Nurhidayat
   ================================================================ */

'use strict';

/* ================================================================
   1. JAM & GREETING REAL-TIME
   ================================================================ */

const greetingText  = document.getElementById('greeting-text');
const clockHours    = document.getElementById('clock-hours');
const clockMinutes  = document.getElementById('clock-minutes');
const clockSeconds  = document.getElementById('clock-seconds');
const dateDisplay   = document.getElementById('date-display');

/**
 * Pad angka jadi 2 digit, misal 9 → "09"
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Tentukan sapaan berdasarkan jam
 * @param {number} hour
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return '☀️ Selamat Pagi, Ikhwan!';
  if (hour >= 12 && hour < 15) return '🌤️ Selamat Siang, Ikhwan!';
  if (hour >= 15 && hour < 19) return '🌇 Selamat Sore, Ikhwan!';
  return '🌙 Selamat Malam, Ikhwan!';
}

/**
 * Format tanggal ke Bahasa Indonesia
 * @param {Date} date
 * @returns {string}
 */
function formatDateID(date) {
  const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** Update jam, tanggal, dan sapaan setiap detik */
function updateClock() {
  const now = new Date();
  const h   = now.getHours();

  clockHours.textContent   = pad(h);
  clockMinutes.textContent = pad(now.getMinutes());
  clockSeconds.textContent = pad(now.getSeconds());
  dateDisplay.textContent  = formatDateID(now);
  greetingText.textContent = getGreeting(h);
}

// Jalankan sekarang + setiap 1 detik
updateClock();
setInterval(updateClock, 1000);


/* ================================================================
   2. POMODORO TIMER 25 MENIT
   ================================================================ */

const POMO_DURATION   = 25 * 60; // detik

const pomoMinEl   = document.getElementById('pomo-minutes');
const pomoSecEl   = document.getElementById('pomo-seconds');
const pomoStatus  = document.getElementById('pomodoro-status');
const pomoProgress= document.getElementById('pomo-progress');
const btnStart    = document.getElementById('pomo-start');
const btnPause    = document.getElementById('pomo-pause');
const btnReset    = document.getElementById('pomo-reset');

let pomoSecondsLeft = POMO_DURATION;
let pomoInterval    = null;
let pomoRunning     = false;

/** Render tampilan timer */
function renderPomo() {
  const m = Math.floor(pomoSecondsLeft / 60);
  const s = pomoSecondsLeft % 60;
  pomoMinEl.textContent = pad(m);
  pomoSecEl.textContent = pad(s);

  // Progress bar: persentase sisa waktu
  const pct = (pomoSecondsLeft / POMO_DURATION) * 100;
  pomoProgress.style.width = pct + '%';
}

/** Tick setiap detik */
function pomoTick() {
  if (pomoSecondsLeft <= 0) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoStatus.textContent = '✅ Sesi selesai! Istirahat dulu.';
    pomoStatus.classList.add('text-emerald-400');
    pomoStatus.classList.remove('text-slate-400', 'text-yellow-400');
    // Notifikasi browser (jika diizinkan)
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Selesai! 🎉', {
        body: 'Waktu fokus 25 menit sudah habis. Istirahat dulu ya!'
      });
    }
    return;
  }
  pomoSecondsLeft--;
  renderPomo();
}

// Tombol Start
btnStart.addEventListener('click', () => {
  if (pomoRunning) return;
  if (pomoSecondsLeft <= 0) return; // sudah habis, harus reset dulu

  // Minta izin notifikasi
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  pomoRunning = true;
  pomoStatus.textContent = '🔴 Fokus sedang berjalan...';
  pomoStatus.classList.remove('text-slate-400', 'text-emerald-400');
  pomoStatus.classList.add('text-rose-400');
  pomoInterval = setInterval(pomoTick, 1000);
});

// Tombol Pause
btnPause.addEventListener('click', () => {
  if (!pomoRunning) return;
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoStatus.textContent = '⏸ Dijeda';
  pomoStatus.classList.remove('text-rose-400', 'text-emerald-400');
  pomoStatus.classList.add('text-yellow-400');
});

// Tombol Reset
btnReset.addEventListener('click', () => {
  clearInterval(pomoInterval);
  pomoRunning     = false;
  pomoSecondsLeft = POMO_DURATION;
  pomoStatus.textContent = 'Siap untuk memulai';
  pomoStatus.className   = 'text-slate-400 text-sm font-medium';
  renderPomo();
});

// Render awal
renderPomo();


/* ================================================================
   3. TO-DO LIST (dengan LocalStorage)
   ================================================================ */

const todoInput      = document.getElementById('todo-input');
const todoAddBtn     = document.getElementById('todo-add-btn');
const todoList       = document.getElementById('todo-list');
const todoCount      = document.getElementById('todo-count');
const todoEmptyState = document.getElementById('todo-empty-state');
const filterBtns     = document.querySelectorAll('.todo-filter-btn');

let todos       = JSON.parse(localStorage.getItem('ld-todos')) || [];
let activeFilter = 'all';

/** Simpan todos ke LocalStorage */
function saveTodos() {
  localStorage.setItem('ld-todos', JSON.stringify(todos));
}

/** Render ulang daftar tugas sesuai filter */
function renderTodos() {
  // Filter data
  const filtered = todos.filter(t => {
    if (activeFilter === 'active') return !t.done;
    if (activeFilter === 'done')   return t.done;
    return true;
  });

  // Kosongkan list (kecuali empty state)
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    todoList.innerHTML = `
      <li class="text-slate-500 text-sm text-center py-6" id="todo-empty-state">
        ${activeFilter === 'done' ? 'Belum ada tugas selesai.' : 'Belum ada tugas. Tambahkan sekarang!'}
      </li>`;
  } else {
    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'flex items-center gap-3 bg-slate-700/60 rounded-xl px-4 py-3 group';
      li.dataset.id = todo.id;

      li.innerHTML = `
        <button class="todo-check flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${todo.done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-500 hover:border-emerald-400'}"
          aria-label="Tandai selesai">
          ${todo.done ? '✓' : ''}
        </button>
        <span class="flex-1 text-sm ${todo.done ? 'line-through text-slate-500' : 'text-white'}">
          ${escapeHTML(todo.text)}
        </span>
        <button class="todo-delete opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition text-lg leading-none" aria-label="Hapus tugas">
          ×
        </button>
      `;

      // Event: toggle selesai
      li.querySelector('.todo-check').addEventListener('click', () => {
        const idx = todos.findIndex(t => t.id === todo.id);
        if (idx !== -1) {
          todos[idx].done = !todos[idx].done;
          saveTodos();
          renderTodos();
        }
      });

      // Event: hapus
      li.querySelector('.todo-delete').addEventListener('click', () => {
        todos = todos.filter(t => t.id !== todo.id);
        saveTodos();
        renderTodos();
      });

      todoList.appendChild(li);
    });
  }

  // Update count
  const remaining = todos.filter(t => !t.done).length;
  todoCount.textContent = `${remaining} tugas tersisa`;
}

/** Tambah tugas baru */
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    todoInput.classList.add('ring-2', 'ring-rose-500');
    setTimeout(() => todoInput.classList.remove('ring-2', 'ring-rose-500'), 1200);
    return;
  }
  todos.unshift({ id: Date.now(), text, done: false });
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
}

/** Sanitasi HTML untuk mencegah XSS */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Event: tombol tambah
todoAddBtn.addEventListener('click', addTodo);

// Event: Enter di input
todoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// Event: filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;

    // Update style tombol filter
    filterBtns.forEach(b => {
      b.classList.remove('bg-emerald-500', 'text-white');
      b.classList.add('bg-slate-700', 'text-slate-400');
    });
    btn.classList.remove('bg-slate-700', 'text-slate-400');
    btn.classList.add('bg-emerald-500', 'text-white');

    renderTodos();
  });
});

// Render awal
renderTodos();


/* ================================================================
   4. QUICK LINKS (dengan LocalStorage)
   ================================================================ */

const quicklinksGrid = document.getElementById('quicklinks-grid');
const qlNameInput    = document.getElementById('ql-name-input');
const qlUrlInput     = document.getElementById('ql-url-input');
const qlAddBtn       = document.getElementById('ql-add-btn');

/** Link bawaan default */
const DEFAULT_LINKS = [
  { id: 'google',    name: 'Google',    url: 'https://google.com',         icon: '🔍' },
  { id: 'github',    name: 'GitHub',    url: 'https://github.com',         icon: '🐙' },
  { id: 'youtube',   name: 'YouTube',   url: 'https://youtube.com',        icon: '▶️' },
  { id: 'chatgpt',   name: 'ChatGPT',   url: 'https://chat.openai.com',    icon: '🤖' },
  { id: 'mdn',       name: 'MDN Docs',  url: 'https://developer.mozilla.org', icon: '📚' },
  { id: 'tailwind',  name: 'Tailwind',  url: 'https://tailwindcss.com',    icon: '🎨' },
  { id: 'codepen',   name: 'CodePen',   url: 'https://codepen.io',         icon: '✏️' },
  { id: 'netlify',   name: 'Netlify',   url: 'https://netlify.com',        icon: '🚀' },
];

// Muat dari LocalStorage, fallback ke default jika belum ada
let quickLinks = JSON.parse(localStorage.getItem('ld-quicklinks'));
if (!quickLinks) {
  quickLinks = DEFAULT_LINKS;
  localStorage.setItem('ld-quicklinks', JSON.stringify(quickLinks));
}

/** Simpan quick links ke LocalStorage */
function saveLinks() {
  localStorage.setItem('ld-quicklinks', JSON.stringify(quickLinks));
}

/** Render kartu quick links */
function renderLinks() {
  quicklinksGrid.innerHTML = '';

  quickLinks.forEach(link => {
    const card = document.createElement('a');
    card.href      = link.url;
    card.target    = '_blank';
    card.rel       = 'noopener noreferrer';
    card.className = `
      relative group flex flex-col items-center justify-center gap-2 p-4
      bg-slate-700 hover:bg-violet-600 border border-slate-600 hover:border-violet-500
      rounded-xl transition-all duration-200 text-center cursor-pointer
      hover:-translate-y-1 hover:shadow-lg
    `;
    card.dataset.id = link.id;

    card.innerHTML = `
      <span class="text-2xl">${link.icon || '🔗'}</span>
      <span class="text-xs font-semibold text-slate-200 group-hover:text-white truncate w-full text-center">
        ${escapeHTML(link.name)}
      </span>
      <button class="ql-delete absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100
        text-slate-400 hover:text-rose-400 transition text-base leading-none w-5 h-5 flex items-center justify-center"
        aria-label="Hapus link"
        title="Hapus">
        ×
      </button>
    `;

    // Cegah klik delete memicu navigasi
    card.querySelector('.ql-delete').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      quickLinks = quickLinks.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    quicklinksGrid.appendChild(card);
  });
}

/** Tambah link kustom baru */
function addLink() {
  const name = qlNameInput.value.trim();
  let   url  = qlUrlInput.value.trim();

  if (!name || !url) {
    if (!name) qlNameInput.classList.add('ring-2', 'ring-rose-500');
    if (!url)  qlUrlInput.classList.add('ring-2', 'ring-rose-500');
    setTimeout(() => {
      qlNameInput.classList.remove('ring-2', 'ring-rose-500');
      qlUrlInput.classList.remove('ring-2', 'ring-rose-500');
    }, 1200);
    return;
  }

  // Pastikan URL punya protokol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  quickLinks.push({
    id:   'custom-' + Date.now(),
    name,
    url,
    icon: '🔗',
  });

  saveLinks();
  renderLinks();
  qlNameInput.value = '';
  qlUrlInput.value  = '';
  qlNameInput.focus();
}

// Event: tombol tambah link
qlAddBtn.addEventListener('click', addLink);

// Event: Enter di input URL
qlUrlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addLink();
});

// Render awal
renderLinks();
