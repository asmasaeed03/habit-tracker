// ── State ──────────────────────────────────────────────
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let checks = JSON.parse(localStorage.getItem('checks')) || {};
let weekOffset = 0;

// ── Helpers ────────────────────────────────────────────
function getWeekDates(offset = 0) {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function dateKey(date) {
  return date.toISOString().slice(0, 10); // "2026-05-28"
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

  if (habits.length === 0) return;

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
  });
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
  checks[key] = !checks[key];
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
render();