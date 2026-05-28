// ── State ──────────────────────────────────────────────
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let checks = JSON.parse(localStorage.getItem('checks')) || {};
let weekOffset = 0;

// ── Helpers ────────────────────────────────────────────
function getWeekDates(offset = 0) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function todayKey() {
  return dateKey(new Date());
}

function getStreak(habitId) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${habitId}_${dateKey(d)}`;
    if (checks[key]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function saveData() {
  localStorage.setItem('habits', JSON.stringify(habits));
  localStorage.setItem('checks', JSON.stringify(checks));
}

// ── Stats ──────────────────────────────────────────────
function updateStats() {
  document.getElementById('totalHabits').textContent = habits.length;
  const best = habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0);
  document.getElementById('totalStreaks').textContent = best;
}

// ── Daily Quote ────────────────────────────────────────
const quotes = [
  "Small steps every day lead to big changes.",
  "Consistency is the key to achievement.",
  "You don't have to be great to start, but you have to start to be great.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Motivation gets you started. Habit keeps you going.",
  "The secret of your future is hidden in your daily routine.",
  "Every day is a new opportunity to grow.",
  "Build the habit. Live the life.",
];

function showQuote() {
  const idx = new Date().getDate() % quotes.length;
  const el = document.getElementById('dailyQuote');
  if (el) el.textContent = `"${quotes[idx]}"`;
}

// ── Confetti ───────────────────────────────────────────
function launchConfetti() {
  const colors = ['#7c6ff7', '#a78bfa', '#60a5fa', '#34d399', '#fb923c'];
  for (let i = 0; i < 40; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    dot.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${0.8 + Math.random() * 1}s;
      animation-delay: ${Math.random() * 0.3}s;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 2000);
  }
}

// ── Render ─────────────────────────────────────────────
function render() {
  const weekDates = getWeekDates(weekOffset);
  const todayStr = todayKey();
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Week label
  const first = weekDates[0];
  const last = weekDates[6];
  document.getElementById('weekLabel').textContent =
    `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Empty state
  document.getElementById('emptyState').style.display =
    habits.length === 0 ? 'block' : 'none';

  // Build grid
  const grid = document.getElementById('habitGrid');
  grid.innerHTML = '';

  if (habits.length === 0) {
    updateStats();
    return;
  }

  // Header row
  const header = document.createElement('div');
  header.className = 'grid-header';
  header.innerHTML = '<div class="habit-name-col"></div>';
  weekDates.forEach((d, i) => {
    const isToday = dateKey(d) === todayStr;
    header.innerHTML += `<div class="day-col ${isToday ? 'today' : ''}">${DAY_NAMES[i]}<br/><span>${d.getDate()}</span></div>`;
  });
  header.innerHTML += '<div class="streak-col">🔥</div>';
  grid.appendChild(header);

  // Habit rows
  habits.forEach(habit => {
    const row = document.createElement('div');
    row.className = 'grid-row';

    // Habit name + delete
    const nameCell = document.createElement('div');
    nameCell.className = 'habit-name-col';
    nameCell.innerHTML = `
      <span class="habit-name" ondblclick="renameHabit('${habit.id}')">${habit.name}</span>
      <button class="delete-btn" onclick="deleteHabit('${habit.id}')">×</button>
    `;
    row.appendChild(nameCell);

    // Day cells
    weekDates.forEach(d => {
      const key = `${habit.id}_${dateKey(d)}`;
      const checked = !!checks[key];
      const isToday = dateKey(d) === todayStr;
      const isFuture = dateKey(d) > todayStr;

      const cell = document.createElement('div');
      cell.className = `day-cell ${isToday ? 'today' : ''} ${checked ? 'checked' : ''} ${isFuture ? 'future' : ''}`;
      cell.textContent = checked ? '✓' : '';
      if (!isFuture) {
        cell.onclick = () => toggleCheck(habit.id, dateKey(d));
      }
      row.appendChild(cell);
    });

    // Streak
    const streakCell = document.createElement('div');
    streakCell.className = 'streak-col';
    const s = getStreak(habit.id);
    streakCell.textContent = s > 0 ? `${s}d` : '-';
    row.appendChild(streakCell);

    grid.appendChild(row);

    // Progress bar
    const completedDays = weekDates.filter(d => {
      const key = `${habit.id}_${dateKey(d)}`;
      return !!checks[key];
    }).length;
    const totalDays = weekDates.filter(d => dateKey(d) <= todayStr).length;
    const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    const progressRow = document.createElement('div');
    progressRow.className = 'progress-row';
    progressRow.innerHTML = `
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
      </div>
      <span class="progress-label">${completedDays}/${totalDays} this week · ${progressPercent}%</span>
    `;
    grid.appendChild(progressRow);
  });

  updateStats();
}

// ── Actions ────────────────────────────────────────────
function addHabit() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) return;
  habits.push({ id: Date.now().toString(), name });
  input.value = '';
  saveData();
  render();
}

function deleteHabit(id) {
  habits = habits.filter(h => h.id !== id);
  saveData();
  render();
}

function renameHabit(id) {
  const habit = habits.find(h => h.id === id);
  const newName = prompt('Rename habit:', habit.name);
  if (newName && newName.trim()) {
    habit.name = newName.trim();
    saveData();
    render();
  }
}

function toggleCheck(habitId, dateStr) {
  const key = `${habitId}_${dateStr}`;
  const wasChecked = checks[key];
  checks[key] = !checks[key];
  if (!wasChecked) launchConfetti();
  saveData();
  render();
}

// ── Event Listeners ────────────────────────────────────
document.getElementById('addBtn').onclick = addHabit;
document.getElementById('habitInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});
document.getElementById('prevWeek').onclick = () => { weekOffset--; render(); };
document.getElementById('nextWeek').onclick = () => { weekOffset++; render(); };
document.getElementById('todayBtn').onclick = () => { weekOffset = 0; render(); };

// ── Init ───────────────────────────────────────────────
showQuote();
render();