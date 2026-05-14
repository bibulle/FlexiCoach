import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

// Mock speechSynthesis globally for all tests
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    getVoices: () => [],
    speak: () => {},
    cancel: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    onvoiceschanged: null,
  },
});

// Mock SpeechSynthesisUtterance globally for all tests
global.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  text: string;
  constructor(text: string) {
    this.text = text;
  }
} as any;

// Mock AudioContext globally for all tests
global.AudioContext = class MockAudioContext {
  currentTime = 0;
  destination = {};

  createOscillator() {
    return {
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { value: 0 },
      type: 'sine',
    };
  }

  createGain() {
    return {
      connect: () => {},
      disconnect: () => {},
      gain: {
        value: 0,
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
    };
  }
} as any;
