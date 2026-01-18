import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, GrammarQuestion, QuestionType } from './types';
import { v4 as uuidv4 } from 'uuid';

// ... (QUESTIONS dizisi aynı kalıyor)

interface GameState {
  // ... (eski state'ler aynı)
  scoreMultiplier: number; // Yeni: Puan çarpanı
  multiplierTimer: number;
  
  // ... (fonksiyon tanımları aynı)
  updateTimers: (delta: number) => void; // updateCarsiIzni yerine genel timer
}

export const useStore = create<GameState>((set, get) => ({
  // ... (başlangıç değerleri aynı)
  scoreMultiplier: 1,
  multiplierTimer: 0,

  // ... (pickNextQuestion aynı)

  startGame: () => {
    set({ 
        status: GameStatus.PLAYING, 
        score: 0, 
        lives: 5, 
        maxLives: 5,
        speed: RUN_SPEED_BASE,
        level: 1,
        // ... (diğer resetler)
        scoreMultiplier: 1,
        multiplierTimer: 0
    });
    get().pickNextQuestion();
  },

  // ... (restartGame, takeDamage aynı)

  // collectHeal siliyoruz çünkü revir kalktı, yerine collectBonus geliyor
  collectBonus: () => {
      const { score, scoreMultiplier } = get();
      set({ 
          score: score + (50 * scoreMultiplier),
          milestoneMessage: "+50 PUAN!" 
      });
      setTimeout(() => set({ milestoneMessage: null }), 1000);
  },

  collectBadFood: (foodName: string) => {
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
      
      // Ölümsüzlük Timer (Sadece marketten alınırsa çalışır artık)
      if (carsiIzniActive) {
          const newTime = carsiIzniTimer - delta;
          if (newTime <= 0) set({ carsiIzniActive: false, carsiIzniTimer: 0 });
          else set({ carsiIzniTimer: newTime });
      }

      // Çarpan Timer
      if (scoreMultiplier > 1) {
          const newMTime = multiplierTimer - delta;
          if (newMTime <= 0) set({ scoreMultiplier: 1, multiplierTimer: 0 });
          else set({ multiplierTimer: newMTime });
      }
  },

  submitAnswer: (isCorrect) => {
      const { speed, score, scoreMultiplier, gemsCollected, questionsAnswered, comboCount, shopThreshold } = get();
      
      if (isCorrect) {
          // Çarpan varsa puanı katla
          const points = 100 * scoreMultiplier;
          const newScore = score + points;
          const newCombo = comboCount + 1;
          
          // "ŞAFAK DOĞAN GÜNEŞ" BUFFI KALDIRILDI (Sadece mesaj kaldı)
          let msg = null;
          if (newScore === 500) msg = "Çipa kafeteryadan pasto kazandın!";
          // ... (diğer mesajlar aynı)

          set((state) => ({ 
              score: newScore,
              gemsCollected: gemsCollected + 1, 
              questionsAnswered: questionsAnswered + 1,
              speed: Math.min(speed + 5.0, 90), 
              milestoneMessage: msg || state.milestoneMessage,
              comboCount: newCombo,
              // carsiIzniActive buradana tetiklenmiyor artık
          }));
          
          if (msg) setTimeout(() => set({ milestoneMessage: null }), 4000);

      } else {
          get().takeDamage();
          set({ comboCount: 0, speed: Math.max(speed - 5, RUN_SPEED_BASE) });
      }

      // Shop Logic aynı...
      const currentQ = get().questionsAnswered;
      if (currentQ >= shopThreshold) {
           set({ 
               status: GameStatus.SHOP, 
               milestoneMessage: "ÇİPA KAFETERYA - MOLA!",
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

      // Yeni Shop Listesi
      if (itemId === 'double_jump') cost = 500;
      if (itemId === 'energy_drink') cost = 400; // Yeni: 2x Puan
      if (itemId === 'immortal') cost = 1000; // Fiyat arttı

      if (score >= cost) {
          if (itemId === 'double_jump') {
              if (get().hasDoubleJump) return false;
              set({ hasDoubleJump: true });
              success = true;
          }
          if (itemId === 'energy_drink') { // Yeni Buff
              set({ scoreMultiplier: 2, multiplierTimer: 15 }); // 15 saniye 2x puan
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
  
  // ... (resumeFromShop aynı)
  // ... (diğerleri aynı)
}));
