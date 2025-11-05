// Coach Dos - Gestion des données locales

class ProgressManager {
  constructor() {
    this.storageKey = "coach-dos-data";
    this.init();
  }

  init() {
    // Initialize storage if needed
    const data = this.getData();
    if (!data.sessions) {
      this.setData({
        sessions: [],
        preferences: {
          voice: { rate: 1.0, pitch: 1.0, volume: 0.8 },
          notifications: false,
          favoriteRoutine: "douce-10min",
          reminders: [{ time: "08:00", enabled: true }],
        },
        stats: {
          totalSessions: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      });
    }
  }

  getData() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch (e) {
      console.error("Error reading data:", e);
      return {};
    }
  }

  setData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Error saving data:", e);
      return false;
    }
  }

  // Sessions
  addSession(session) {
    const data = this.getData();
    const sessionData = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      routine: session.routine,
      duration: session.duration,
      completed: session.completed,
      feeling: session.feeling || null,
      timestamp: new Date().toISOString(),
    };

    data.sessions.push(sessionData);
    data.stats.totalSessions++;

    // Update streak
    this.updateStreak(data);

    this.setData(data);
    return sessionData;
  }

  updateStreak(data) {
    if (!data.sessions.length) return;

    // Sort sessions by date
    const sessionsByDate = {};
    data.sessions.forEach((session) => {
      if (session.completed) {
        sessionsByDate[session.date] = true;
      }
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (sessionsByDate[dateStr]) {
        currentStreak++;
      } else if (i > 0) {
        // Don't break on today if no session yet
        break;
      }
    }

    data.stats.currentStreak = currentStreak;
    data.stats.bestStreak = Math.max(data.stats.bestStreak, currentStreak);
  }

  getSessionsInPeriod(days = 7) {
    const data = this.getData();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return data.sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= cutoff;
    });
  }

  getWeeklyStats() {
    const sessions = this.getSessionsInPeriod(7);
    const totalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

    return {
      sessions: sessions.length,
      minutes: totalMinutes,
      streak: this.getData().stats.currentStreak,
    };
  }

  getCalendarData(year, month) {
    const data = this.getData();
    const calendar = {};

    data.sessions.forEach((session) => {
      const date = new Date(session.date);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        if (!calendar[day]) {
          calendar[day] = { sessions: [], completed: false, partial: false };
        }

        calendar[day].sessions.push(session);
        if (session.completed) {
          calendar[day].completed = true;
        } else {
          calendar[day].partial = true;
        }
      }
    });

    return calendar;
  }

  // Preferences
  getPreferences() {
    return this.getData().preferences || {};
  }

  updatePreferences(updates) {
    const data = this.getData();
    data.preferences = { ...data.preferences, ...updates };
    this.setData(data);
  }

  // Export/Import
  exportData() {
    return JSON.stringify(this.getData(), null, 2);
  }

  importData(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      this.setData(importedData);
      return true;
    } catch (e) {
      console.error("Error importing data:", e);
      return false;
    }
  }

  clearData() {
    localStorage.removeItem(this.storageKey);
    this.init();
  }
}

// Global instance
window.progressManager = new ProgressManager();
