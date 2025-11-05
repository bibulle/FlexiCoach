// Coach Dos - Application principale

let currentPage = "home";
let currentCalendarDate = new Date();

// Page management
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  // Show target page
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.remove("hidden");
  }

  // Update navigation
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.page === pageId) {
      btn.classList.add("active");
    }
  });

  currentPage = pageId;

  // Initialize page-specific content
  switch (pageId) {
    case "calendar":
      updateCalendar();
      break;
    case "stats":
      updateStatsPage();
      break;
    case "settings":
      updateSettingsPage();
      break;
  }
}

// Initialize app
function initApp() {
  updateHomeStats();
  updateRoutinesList();
  setupEventListeners();

  // Initialize settings from storage
  const preferences = window.progressManager.getPreferences();
  if (preferences.reminders && preferences.reminders.length > 0) {
    setupReminders();
  }
}

// Update home page statistics
function updateHomeStats() {
  const stats = window.progressManager.getWeeklyStats();
  const data = window.progressManager.getData();

  // Update streak
  document.getElementById("streakCount").textContent = data.stats.currentStreak;

  // Update weekly stats
  document.getElementById("weekSessions").textContent = stats.sessions;
  document.getElementById("weekMinutes").textContent = stats.minutes;
  document.getElementById("weekStreak").textContent = data.stats.currentStreak;

  // Update today's routine
  const preferences = window.progressManager.getPreferences();
  const todayRoutine = ROUTINES.find((r) => r.id === preferences.favoriteRoutine) || ROUTINES[0];

  document.getElementById("todayRoutineName").textContent = todayRoutine.name;
}

// Update routines list
function updateRoutinesList() {
  const container = document.getElementById("routinesList");
  container.innerHTML = "";

  ROUTINES.forEach((routine) => {
    const card = document.createElement("div");
    card.className = "routine-card";
    card.innerHTML = `
      <h3>${routine.name}</h3>
      <div class="routine-meta">
        <span class="badge badge-time">${routine.duration} min</span>
        <span class="badge badge-level">${routine.level}</span>
      </div>
      <p class="routine-desc">${routine.description}</p>
    `;

    card.addEventListener("click", () => startRoutine(routine.id));
    container.appendChild(card);
  });
}

// Start a routine
function startRoutine(routineId) {
  window.coachEngine.startSession(routineId, (sessionData) => {
    // Show completion modal or redirect back to home
    showCompletionModal(sessionData);
  });
}

// Show completion modal (simplified for now)
function showCompletionModal(sessionData) {
  const message = sessionData.completed ? `Bravo ! Séance de ${Math.round(sessionData.duration / 60)} minutes terminée.` : `Séance interrompue après ${Math.round(sessionData.duration / 60)} minutes.`;

  alert(message);
  updateHomeStats();
}

// Calendar functions
function updateCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  // Update title
  document.getElementById("calendarTitle").textContent = `${DateUtils.getMonthName(month)} ${year}`;

  // Clear calendar
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  // Add day headers
  for (let i = 0; i < 7; i++) {
    const dayHeader = document.createElement("div");
    dayHeader.className = "calendar-day header";
    dayHeader.textContent = DateUtils.getDayName(i);
    calendar.appendChild(dayHeader);
  }

  // Get calendar data
  const calendarData = window.progressManager.getCalendarData(year, month);

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = DateUtils.getDaysInMonth(year, month);
  const today = new Date();

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day other-month";
    calendar.appendChild(emptyDay);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.textContent = day;

    // Check if it's today
    if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
      dayElement.classList.add("today");
    }

    // Check if there are sessions
    if (calendarData[day]) {
      if (calendarData[day].completed) {
        dayElement.classList.add("completed");
      } else if (calendarData[day].partial) {
        dayElement.classList.add("partial");
      }
    }

    dayElement.addEventListener("click", () => showDayDetail(year, month, day));
    calendar.appendChild(dayElement);
  }
}

function showDayDetail(year, month, day) {
  // Simplified day detail - could be enhanced with a modal
  const date = new Date(year, month, day);
  const calendarData = window.progressManager.getCalendarData(year, month);
  const dayData = calendarData[day];

  if (dayData) {
    const sessions = dayData.sessions;
    const message =
      `${DateUtils.formatDate(date)}\n\n` +
      `Séances: ${sessions.length}\n` +
      sessions.map((s) => `• ${ROUTINES.find((r) => r.id === s.routine)?.name || s.routine} (${Math.round(s.duration / 60)}min)`).join("\n");
    alert(message);
  } else {
    alert(`${DateUtils.formatDate(date)}\n\nAucune séance ce jour-là.`);
  }
}

// Stats page
function updateStatsPage() {
  // This would be enhanced with actual charts
  // For now, just update the active period button
  const activePeriod = document.querySelector(".period-btn.active")?.dataset.period || "7";
  const sessions = window.progressManager.getSessionsInPeriod(parseInt(activePeriod));

  console.log(`Stats for last ${activePeriod} days:`, sessions);
}

// Settings page
function updateSettingsPage() {
  const preferences = window.progressManager.getPreferences();

  // Voice settings
  document.getElementById("voiceRate").value = preferences.voice?.rate || 1.0;
  document.getElementById("voiceRateValue").textContent = preferences.voice?.rate || 1.0;

  document.getElementById("voiceVolume").value = preferences.voice?.volume || 0.8;
  document.getElementById("voiceVolumeValue").textContent = Math.round((preferences.voice?.volume || 0.8) * 100) + "%";

  // Reminders
  document.getElementById("reminderEnabled").checked = preferences.notifications || false;

  updateReminderTimes();
}

function updateReminderTimes() {
  const preferences = window.progressManager.getPreferences();
  const container = document.getElementById("reminderTimes");
  container.innerHTML = "";

  (preferences.reminders || []).forEach((reminder, index) => {
    const reminderDiv = document.createElement("div");
    reminderDiv.className = "reminder-time";
    reminderDiv.innerHTML = `
      <input type="time" value="${reminder.time}" onchange="updateReminderTime(${index}, this.value)">
      <button class="btn-remove" onclick="removeReminder(${index})">×</button>
    `;
    container.appendChild(reminderDiv);
  });
}

function updateReminderTime(index, newTime) {
  const preferences = window.progressManager.getPreferences();
  preferences.reminders[index].time = newTime;
  window.progressManager.updatePreferences(preferences);
}

function removeReminder(index) {
  const preferences = window.progressManager.getPreferences();
  preferences.reminders.splice(index, 1);
  window.progressManager.updatePreferences(preferences);
  updateReminderTimes();
}

function addReminder() {
  const preferences = window.progressManager.getPreferences();
  if (!preferences.reminders) preferences.reminders = [];

  preferences.reminders.push({ time: "08:00", enabled: true });
  window.progressManager.updatePreferences(preferences);
  updateReminderTimes();
}

// Setup reminders
function setupReminders() {
  const preferences = window.progressManager.getPreferences();
  if (preferences.notifications && preferences.reminders) {
    preferences.reminders.forEach((reminder) => {
      if (reminder.enabled) {
        window.notificationManager.scheduleReminder(reminder.time, "C'est l'heure de votre séance Coach Dos !");
      }
    });
  }
}

// Event listeners
function setupEventListeners() {
  // Start today's routine
  document.getElementById("startTodayBtn").addEventListener("click", () => {
    const preferences = window.progressManager.getPreferences();
    const routineId = preferences.favoriteRoutine || ROUTINES[0].id;
    startRoutine(routineId);
  });

  // Navigation
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      showPage(btn.dataset.page);
    });
  });

  // Calendar navigation
  document.getElementById("prevMonth").addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    updateCalendar();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    updateCalendar();
  });

  // Stats period buttons
  document.querySelectorAll(".period-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".period-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateStatsPage();
    });
  });

  // Settings - Voice
  document.getElementById("voiceRate").addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById("voiceRateValue").textContent = value;
    window.voiceManager.updateSettings({ rate: value });
  });

  document.getElementById("voiceVolume").addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById("voiceVolumeValue").textContent = Math.round(value * 100) + "%";
    window.voiceManager.updateSettings({ volume: value });
  });

  // Settings - Reminders
  document.getElementById("reminderEnabled").addEventListener("change", (e) => {
    const enabled = e.target.checked;
    window.progressManager.updatePreferences({ notifications: enabled });

    if (enabled) {
      window.notificationManager.requestPermission().then(() => {
        setupReminders();
      });
    }
  });

  document.getElementById("addReminderBtn").addEventListener("click", addReminder);

  // Settings - Data
  document.getElementById("exportDataBtn").addEventListener("click", () => {
    const data = window.progressManager.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coach-dos-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("clearDataBtn").addEventListener("click", () => {
    if (confirm("Êtes-vous sûr de vouloir effacer toutes vos données ? Cette action est irréversible.")) {
      window.progressManager.clearData();
      updateHomeStats();
      alert("Données effacées.");
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);
