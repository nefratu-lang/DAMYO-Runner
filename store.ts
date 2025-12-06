
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, GrammarQuestion, QuestionType } from './types';
import { v4 as uuidv4 } from 'uuid';

// --- QUESTION BANK ---
const QUESTIONS: GrammarQuestion[] = [
    // PRESENT (Green)
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
    
    // PAST (Red)
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

    // FUTURE (Blue)
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
  
  // Grammar Logic
  currentQuestion: GrammarQuestion | null;
  questionsAnswered: number;
  
  // Shop Logic
  shopThreshold: number; // Next question count to trigger shop
  
  // Reward Logic
  milestoneMessage: string | null;
  
  // Combo / Abilities
  comboCount: number;
  carsiIzniActive: boolean; // Immortality
  carsiIzniTimer: number;

  hasDoubleJump: boolean;

  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  submitAnswer: (isCorrect: boolean) => void;
  collectHeal: () => void;
  collectBadFood: () => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  
  updateCarsiIzni: (delta: number) => void;
  
  pickNextQuestion: () => void;
  clearMilestone: () => void;
  
  // Shop
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
  shopThreshold: 5, // Starts at 5 questions
  milestoneMessage: null,
  
  comboCount: 0,
  carsiIzniActive: false,
  carsiIzniTimer: 0,
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
        shopThreshold: 5, // Reset threshold
        milestoneMessage: null,
        comboCount: 0,
        carsiIzniActive: false,
        carsiIzniTimer: 0,
        hasDoubleJump: false
    });
    get().pickNextQuestion();
  },

  restartGame: () => {
    get().startGame();
  },

  takeDamage: () => {
    const { lives, carsiIzniActive } = get();
    if (carsiIzniActive) return; // Immortality active!

    if (lives > 1) {
      set({ lives: lives - 1, comboCount: 0 }); // Reset combo on hit
    } else {
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0, comboCount: 0 });
    }
  },

  collectHeal: () => {
      const { lives, maxLives } = get();
      if (lives < maxLives) {
          set({ lives: lives + 1, milestoneMessage: "REVİRDEN RAPOR ALDIN! (+1 CAN)" });
          setTimeout(() => set({ milestoneMessage: null }), 2000);
      } else {
           set({ milestoneMessage: "ZATEN TURP GİBİSİN ASKER!" });
           setTimeout(() => set({ milestoneMessage: null }), 2000);
      }
  },

  collectBadFood: () => {
      // Bad food (Kapuska/Brokoli) reduces score
      const { score } = get();
      const penalty = 100;
      const newScore = Math.max(0, score - penalty);
      set({ 
          score: newScore,
          milestoneMessage: "KAPUSKA YEDİN! (-100 COF)" 
      });
      setTimeout(() => set({ milestoneMessage: null }), 2000);
  },

  updateCarsiIzni: (delta) => {
      const { carsiIzniActive, carsiIzniTimer } = get();
      if (carsiIzniActive) {
          const newTime = carsiIzniTimer - delta;
          if (newTime <= 0) {
              // Removed the notification message here
              set({ carsiIzniActive: false, carsiIzniTimer: 0 });
          } else {
              set({ carsiIzniTimer: newTime });
          }
      }
  },

  submitAnswer: (isCorrect) => {
      const { speed, score, gemsCollected, questionsAnswered, comboCount, shopThreshold } = get();
      
      let newScore = score;
      let newSpeed = speed;

      if (isCorrect) {
          newScore = score + 100;
          let msg = null;
          let newCombo = comboCount + 1;
          let activateCarsi = false;

          // Combo Logic
          if (newCombo === 3) {
              activateCarsi = true;
              msg = "ŞAFAK DOĞAN GÜNEŞ! ÇARŞI İZNİ KAZANDIN!";
          }

          // Milestone Logic (Text only)
          if (newScore === 500) msg = "Çipa kafeteryadan pasto kazandın!";
          else if (newScore === 1000) msg = "Derste 10 dakika uyuyabilirsin!";
          else if (newScore === 1500) msg = "Kaşarlı tost almaya hak kazandın!";
          else if (newScore === 2000) msg = "Extra çarşı izni kazandın!";
          else if (newScore >= 2500 && score < 2500) msg = "SÜPER EVCİ!!!";

          set((state) => ({ 
              score: newScore,
              gemsCollected: gemsCollected + 1, 
              questionsAnswered: questionsAnswered + 1,
              speed: Math.min(speed + 5.0, 90), 
              milestoneMessage: msg || state.milestoneMessage,
              comboCount: newCombo,
              carsiIzniActive: activateCarsi ? true : state.carsiIzniActive,
              carsiIzniTimer: activateCarsi ? 10 : state.carsiIzniTimer
          }));

          if (msg) {
              setTimeout(() => {
                  set({ milestoneMessage: null });
              }, 4000);
          }

      } else {
          get().takeDamage();
          // Reset combo
          newSpeed = Math.max(speed - 5, RUN_SPEED_BASE);
          set({ 
              comboCount: 0, 
              speed: newSpeed 
          });
      }

      // --- CHECKPOINT / SHOP LOGIC (Exponential) ---
      // Check if we hit the dynamic threshold
      const currentQ = get().questionsAnswered;
      if (currentQ >= shopThreshold) {
           set({ 
               status: GameStatus.SHOP, 
               milestoneMessage: "ÇİPA KAFETERYAYA HOŞGELDİN!",
               speed: 0, // Stop the world
               shopThreshold: shopThreshold * 2 // Double the requirement for next shop
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
      if (itemId === 'heal') cost = 300;
      if (itemId === 'immortal') cost = 800;

      if (score >= cost) {
          if (itemId === 'double_jump') {
              if (get().hasDoubleJump) return false; // Already has it
              set({ hasDoubleJump: true });
              success = true;
          }
          if (itemId === 'heal') {
              if (lives >= maxLives) return false;
              set({ lives: lives + 1 });
              success = true;
          }
          if (itemId === 'immortal') {
              set({ carsiIzniActive: true, carsiIzniTimer: 10 });
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
          speed: Math.max(RUN_SPEED_BASE, speed) // Ensure we have speed
      });
      get().pickNextQuestion();
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  setDistance: (dist) => set({ distance: dist }),
  setStatus: (status) => set({ status }),
  clearMilestone: () => set({ milestoneMessage: null }),
}));
