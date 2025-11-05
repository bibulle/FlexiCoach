# FlexiCoach - AI Coding Agent Instructions

## Project Overview

This is a French-language Progressive Web App (PWA) for guided exercise routines with daily tracking, progress visualization, and multiple training programs. The current `coach_dos_routine_douce_10_min.html` file is **one example training routine** demonstrating the core coaching engine - a 10-minute gentle back routine with timer and voice guidance.

## Architecture Pattern

**Training Routine Engine** - The current HTML file demonstrates the core pattern for guided exercise sessions:

- Self-contained training modules (HTML + embedded CSS/JS)
- Step-based timer system with voice coaching
- Standardized exercise configuration format

The full app vision includes:

- Multiple training routines (different durations, difficulty levels, focus areas)
- User progress tracking and daily adherence recording
- Streak visualization and calendar views
- PWA capabilities for offline use and app-like experience

## Core Application Logic

### Timer System Architecture

The app uses a **step-based timer** with two types of intervals:

- **Exercise steps**: Defined in the `plan` array with name, duration, mode, and voice cues
- **Rest periods**: Automatic 10-second transitions between exercises (`REST_SECONDS`)

Key state variables:

- `idx`: Current step index in the plan array
- `timeLeft`: Remaining seconds for current step
- `resting`: Boolean flag for transition periods vs actual exercises

### Voice Coaching System

Dual-mode audio feedback:

- **Primary**: Web Speech API (`speechSynthesis`) for French voice instructions
- **Fallback**: WebAudio API beeps when speech synthesis unavailable

Voice cue timing is based on **elapsed time within step**, not remaining time:

```javascript
const elapsed = s.seconds - timeLeft;
processCues(s, elapsed);
```

### Exercise Configuration Pattern

Each exercise in the `plan` array follows this structure:

```javascript
{
  name: "Exercise name",
  seconds: 60,
  mode: "mouvement" | "statique" | "respiration",
  text: "Instructions shown to user",
  cues: [{ at: 30, say: "Voice instruction at 30s elapsed" }]
}
```

## French Language Conventions

- All UI text, voice instructions, and comments are in French
- Exercise terminology follows physiotherapy conventions ("kiné" style)
- Voice cues use informal "tu" form for personal coaching feel

## Key Files

- `coach_dos_routine_douce_10_min.html`: Example training routine showcasing the coaching engine
- `specification.md`: Full app vision and requirements (currently abbreviated)

## Current Implementation Status

The existing HTML file serves as a **proof of concept** for the coaching system:

- ✅ Core timer and voice coaching functionality
- ✅ Exercise sequencing with transitions
- ✅ French physiotherapy terminology and UX
- ⏳ **Planned**: Multiple routines, progress tracking, PWA features

## Development Patterns

- **No build tools**: Direct HTML/CSS/JS editing
- **CSS Custom Properties**: Consistent theming via `:root` variables
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with timers and voice
- **Responsive Design**: Grid-based layout that adapts to mobile/desktop

## Testing Approach

Since this is a single-file app, test by:

1. Opening HTML file directly in browser
2. Testing voice synthesis (requires user interaction to activate)
3. Verifying timer accuracy and step transitions
4. Checking mobile responsiveness and PWA capabilities

## Adding New Exercises

Extend the `plan` array following the established pattern. Consider:

- Voice cue timing for mid-exercise guidance
- Appropriate mode classification
- Clear, concise instruction text
- Reasonable duration for target audience (beginner-friendly)

## Creating Additional Training Routines

When building new training modules, follow the established coaching engine pattern:

- Self-contained HTML files with embedded CSS/JS
- Reuse the timer system architecture and voice coaching logic
- Maintain consistent French terminology and UX patterns
- Consider different target durations, difficulty levels, or focus areas (upper back, lower back, flexibility, strength)
