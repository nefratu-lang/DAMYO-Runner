/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, GrammarQuestion, QuestionType } from './types';
import { v4 as uuidv4 } from 'uuid';

const QUESTIONS: GrammarQuestion[] = [
    { id: '1', sentence: "I usually ______ early in the morning.", options: ["wake up", "wakes up", "woke up", "is waking"], correctIndex: 0, type: QuestionType.PRESENT },
    { id: '2', sentence: "She ______ to school by bus every day.", options: ["go", "goes", "went", "going"], correctIndex: 1, type: QuestionType.PRESENT },
    { id: '5', sentence: "He ______ not like pizza.", options: ["do", "does", "did", "is"], correctIndex: 1, type: QuestionType.PRESENT },
    { id: '7', sentence: "______ you visit your grandmother often?", options: ["Do", "Does", "Did", "Are"], correctIndex: 0, type: QuestionType.PRESENT },
    { id: '9', sentence: "The sun ______ in the east.", options: ["rise", "rises", "rose", "rising"], correctIndex: 1, type: QuestionType.PRESENT },
    { id: '10', sentence: "Look! It ______ right now.", options: ["rain", "rains", "rained", "is raining"], correctIndex: 3, type: QuestionType.PRESENT },
    { id: '11', sentence: "I ______ busy right now.", options: ["am", "is", "are", "be"], correctIndex: 0, type: QuestionType.PRESENT },
    { id: '13', sentence: "My father ______ work on Sundays.", options: ["don't", "isn't", "doesn't", "didn't"], correctIndex: 2, type: QuestionType.PRESENT },
    { id: '15', sentence: "______ she like ice cream?", options: ["Do", "Does", "Is", "Are"], correctIndex: 1, type: QuestionType.PRESENT },
    { id: '17', sentence: "Water ______ at 100 degrees Celsius.", options: ["boil", "boils", "boiled", "boiling"], correctIndex: 1, type: QuestionType.PRESENT },
    
    { id: '3', sentence: "They ______ football yesterday.", options: ["play", "plays", "played", "playing"], correctIndex: 2, type: QuestionType.PAST },
    { id: '4', sentence: "We ______ happy to see you last night.", options: ["was", "were", "are", "is"], correctIndex: 1, type: QuestionType.PAST },
    { id: '6', sentence: "I ______ buy a new car last week.", options: ["didn't", "don't", "doesn't", "wasn't"], correctIndex: 0, type: QuestionType.PAST },
    { id: '8', sentence: "Where ______ she go yesterday?", options: ["do", "does", "did", "is"], correctIndex: 2, type: QuestionType.PAST },
    { id: '12', sentence: "They ______ ready for the exam two days ago.", options: ["aren't", "weren't", "wasn't", "didn't"], correctIndex: 1, type: QuestionType.PAST },
    { id: '14', sentence: "We ______ a great movie last weekend.", options: ["watch", "watches", "watched", "watching"], correctIndex: 2, type: QuestionType.PAST },
    { id: '16', sentence: "I ______ my keys yesterday.", options: ["lose", "loses", "lost", "losing"], correctIndex: 2, type: QuestionType.PAST },
    { id: '18', sentence: "______ you tired last night?", options: ["Do", "Did", "Are", "Were"], correctIndex: 3, type: QuestionType.PAST },
    { id: '20', sentence: "Why ______ you crying?", options: ["do", "did", "are", "have"], correctIndex: 2, type: QuestionType.PAST },
    { id: '21', sentence: "She ______ Paris in 2010.", options: ["visit", "visits", "visited", "visiting"], correctIndex: 2, type: QuestionType.PAST },

    { id: '22', sentence: "I ______ call you tomorrow.", options: ["will", "did", "am", "do"], correctIndex: 0, type: QuestionType.FUTURE },
    { id: '23', sentence: "We ______ to the cinema tonight.", options: ["go", "are going", "went", "gone"], correctIndex: 1, type: QuestionType.FUTURE },
    { id: '24', sentence: "It ______ rain tomorrow.", options: ["is", "did", "will", "has"], correctIndex: 2, type: QuestionType.FUTURE },
    { id: '25', sentence: "______ you help me later?", options: ["Do", "Did", "Will", "Are"], correctIndex: 2, type: QuestionType.FUTURE },
];

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  
  currentQuestion: GrammarQuestion | null;
  questionsAnswered: number;
  
  shopThreshold: number;
  milestoneMessage: string | null;
  
  comboCount: number;
  carsiIzniActive: boolean; 
  carsiIzniTimer: number;
  
  // Yeni Bufflar
  scoreMultiplier: number;
  multiplierTimer: number;

  hasDoubleJump: boolean;

  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  submitAnswer: (isCorrect: boolean) => void;
  collectBonus: () => void; // Revir yerine geldi
  collectBadFood: (name: string) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  
  updateTimers: (delta: number) => void; // Genel timer
  
  pickNextQuestion: () => void;
  clearMilestone: () => void;
  
  buyItem: (itemId: string) => boolean;
  resumeFromShop: () => void;
}

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 5,
  maxLives: 5,
  speed: 0,
  level: 1,
  laneCount: 4, 
  gemsCollected: 0,
  distance: 0,
  
  currentQuestion: null,
  questionsAnswered: 0,
  shopThreshold: 5,
  milestoneMessage: null,
  
  comboCount: 0,
  carsiIzniActive: false,
  carsiIzniTimer: 0,
  scoreMultiplier: 1,
  multiplierTimer: 0,
  hasDoubleJump: false,

  pickNextQuestion: () => {
      const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      set({ currentQuestion: { ...q, id: uuidv4() } }); 
  },

  startGame: () => {
    set({ 
        status: GameStatus.PLAYING, 
        score: 0, 
        lives: 5, 
        maxLives: 5,
        speed: RUN_SPEED_BASE,
        level: 1,
        laneCount: 4, 
        gemsCollected: 0,
        distance: 0,
        questionsAnswered: 0,
        shopThreshold: 5,
        milestoneMessage: null,
        comboCount: 0,
        carsiIzniActive: false,
        carsiIzniTimer: 0,
        scoreMultiplier: 1,
        multiplierTimer: 0,
        hasDoubleJump: false
    });
    get().pickNextQuestion();
  },

  restartGame: () => {
    get().startGame();
  },

  takeDamage: () => {
    const { lives, carsiIzniActive } = get();
    if (carsiIzniActive) return;

    if (lives > 1) {
      set({ lives: lives - 1, comboCount: 0 });
    } else {
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0, comboCount: 0 });
    }
  },

  collectBonus: () => {
      const { score, scoreMultiplier } = get();
      set({ 
          score: score + (50 * scoreMultiplier),
          milestoneMessage: "+50 PUAN!" 
      });
      setTimeout(() => set({ milestoneMessage: null }), 1000);
  },

  collectBadFood: (foodName) => {
      const { score } = get();
      const penalty = 100;
      const newScore = Math.max(0, score - penalty);
      set({ 
          score: newScore,
          milestoneMessage: `${foodName} YEDİN! (-100 COF)` 
      });
      setTimeout(() => set({ milestoneMessage: null }), 2000);
  },

  updateTimers: (delta) => {
      const { carsiIzniActive, carsiIzniTimer, scoreMultiplier, multiplierTimer } = get();
      
      if (carsiIzniActive) {
          const newTime = carsiIzniTimer - delta;
          if (newTime <= 0) set({ carsiIzniActive: false, carsiIzniTimer: 0 });
          else set({ carsiIzniTimer: newTime });
      }

      if (scoreMultiplier > 1) {
          const newMTime = multiplierTimer - delta;
          if (newMTime <= 0) set({ scoreMultiplier: 1, multiplierTimer: 0 });
          else set({ multiplierTimer: newMTime });
      }
  },

  submitAnswer: (isCorrect) => {
      const { speed, score, scoreMultiplier, gemsCollected, questionsAnswered, comboCount, shopThreshold } = get();
      
      let newScore = score;
      let newSpeed = speed;

      if (isCorrect) {
          const points = 100 * scoreMultiplier;
          newScore = score + points;
          let msg = null;
          let newCombo = comboCount + 1;

          if (newScore >= 500 && newScore < 600) msg = "Çipa kafeteryadan pasto kazandın!";
          else if (newScore >= 1000 && newScore < 1100) msg = "Derste 10 dakika uyuyabilirsin!";
          else if (newScore >= 1500 && newScore < 1600) msg = "Kaşarlı tost almaya hak kazandın!";
          else if (newScore >= 2000 && newScore < 2100) msg = "Extra çarşı izni kazandın!";
          else if (newScore >= 2500 && score < 2500) msg = "SÜPER EVCİ!!!";

          set({ 
              score: newScore,
              gemsCollected: gemsCollected + 1, 
              questionsAnswered: questionsAnswered + 1,
              speed: Math.min(speed + 5.0, 90), 
              milestoneMessage: msg || get().milestoneMessage,
              comboCount: newCombo,
          });

          if (msg) setTimeout(() => set({ milestoneMessage: null }), 4000);

      } else {
          get().takeDamage();
          newSpeed = Math.max(speed - 5, RUN_SPEED_BASE);
          set({ comboCount: 0, speed: newSpeed });
      }

      const currentQ = get().questionsAnswered;
      if (currentQ >= shopThreshold) {
           set({ 
               status: GameStatus.SHOP, 
               milestoneMessage: "ÇİPA KAFETERYA MOLA!",
               speed: 0, 
               shopThreshold: shopThreshold * 2 
           });
           setTimeout(() => set({ milestoneMessage: null }), 3000);
      } else {
           get().pickNextQuestion();
      }
  },

  buyItem: (itemId) => {
      const { score, lives, maxLives } = get();
      let cost = 0;
      let success = false;

      if (itemId === 'double_jump') cost = 500;
      if (itemId === 'energy_drink') cost = 400; // Puan x2
      if (itemId === 'immortal') cost = 1000;

      if (score >= cost) {
          if (itemId === 'double_jump') {
              if (get().hasDoubleJump) return false;
              set({ hasDoubleJump: true });
              success = true;
          }
          if (itemId === 'energy_drink') {
              set({ scoreMultiplier: 2, multiplierTimer: 15 });
              success = true;
          }
          if (itemId === 'immortal') {
              set({ carsiIzniActive: true, carsiIzniTimer: 15 });
              success = true;
          }

          if (success) {
              set({ score: score - cost });
              return true;
          }
      }
      return false;
  },

  resumeFromShop: () => {
      const { speed } = get();
      set({ 
          status: GameStatus.PLAYING,
          speed: Math.max(RUN_SPEED_BASE, speed) 
      });
      get().pickNextQuestion();
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  setDistance: (dist) => set({ distance: dist }),
  setStatus: (status) => set({ status }),
  clearMilestone: () => set({ milestoneMessage: null }),
}));
