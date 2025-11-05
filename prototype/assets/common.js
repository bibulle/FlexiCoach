// Coach Dos - Logique commune

// Available routines
const ROUTINES = [
  {
    id: "douce-10min",
    name: "Routine douce",
    duration: 10,
    level: "Débutant",
    description: "Mobilité douce et étirements pour soulager les tensions.",
    file: "routines/douce-10min.html",
  },
  {
    id: "bureau-5min",
    name: "Pause bureau",
    duration: 5,
    level: "Tous niveaux",
    description: "Étirements rapides pour la nuque, épaules et dos.",
    file: "routines/bureau-5min.html",
  },
  {
    id: "tonique-15min",
    name: "Routine tonique",
    duration: 15,
    level: "Intermédiaire",
    description: "Renforcement musculaire et gainage pour un dos solide.",
    file: "routines/tonique-15min.html",
  },
  {
    id: "etirements-20min",
    name: "Étirements profonds",
    duration: 20,
    level: "Tous niveaux",
    description: "Relaxation complète et assouplissement en profondeur.",
    file: "routines/etirements-20min.html",
  },
];

// Shared coaching engine utilities
class CoachEngine {
  constructor() {
    this.currentSession = null;
  }

  startSession(routineId, onSessionEnd = null) {
    const routine = ROUTINES.find((r) => r.id === routineId);
    if (!routine) {
      console.error("Routine not found:", routineId);
      return;
    }

    this.currentSession = {
      routine: routineId,
      startTime: Date.now(),
      onSessionEnd: onSessionEnd,
    };

    // Navigate to routine
    window.location.href = routine.file;
  }

  endSession(completed = true, feeling = null) {
    if (!this.currentSession) return;

    const duration = Math.round((Date.now() - this.currentSession.startTime) / 1000);

    const sessionData = {
      routine: this.currentSession.routine,
      duration: duration,
      completed: completed,
      feeling: feeling,
    };

    // Save session
    window.progressManager.addSession(sessionData);

    // Callback
    if (this.currentSession.onSessionEnd) {
      this.currentSession.onSessionEnd(sessionData);
    }

    this.currentSession = null;

    return sessionData;
  }
}

// Voice synthesis utilities
class VoiceManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.settings = window.progressManager.getPreferences().voice || {};
  }

  speak(text, options = {}) {
    if (!this.synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = options.rate || this.settings.rate || 1.0;
    utterance.pitch = options.pitch || this.settings.pitch || 1.0;
    utterance.volume = options.volume || this.settings.volume || 0.8;

    this.synth.cancel(); // Stop current speech
    this.synth.speak(utterance);
  }

  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    window.progressManager.updatePreferences({ voice: this.settings });
  }
}

// Date utilities
const DateUtils = {
  formatDate(date) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  },

  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },

  getMonthName(month) {
    const names = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return names[month];
  },

  getDayName(day) {
    const names = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    return names[day];
  },
};

// Notification utilities
class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
  }

  async requestPermission() {
    if ("Notification" in window) {
      this.permission = await Notification.requestPermission();
      return this.permission === "granted";
    }
    return false;
  }

  showNotification(title, options = {}) {
    if (this.permission === "granted") {
      const notification = new Notification(title, {
        icon: "assets/icons/icon-192.png",
        badge: "assets/icons/icon-192.png",
        ...options,
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    }
  }

  scheduleReminder(time, message) {
    // This would be enhanced with Service Worker for background notifications
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification("Coach Dos", {
        body: message,
        tag: "daily-reminder",
        requireInteraction: true,
      });
    }, delay);
  }
}

// Global instances
window.coachEngine = new CoachEngine();
window.voiceManager = new VoiceManager();
window.notificationManager = new NotificationManager();

// Export utilities
window.ROUTINES = ROUTINES;
window.DateUtils = DateUtils;
