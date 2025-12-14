
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { Heart, Zap, GraduationCap, Gift, Flame, ShoppingBag, Shield, Activity, ArrowUpCircle, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, RUN_SPEED_BASE, ShopItem } from '../../types';
import { audio } from '../System/Audio';


export const HUD: React.FC = () => {
  const { score, lives, maxLives, status, restartGame, startGame, gemsCollected, currentQuestion, questionsAnswered, speed, milestoneMessage, carsiIzniActive, carsiIzniTimer, buyItem, resumeFromShop, hasDoubleJump } = useStore();

  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  // Control Helper
  const triggerControl = (action: 'LEFT' | 'RIGHT' | 'JUMP') => {
      window.dispatchEvent(new CustomEvent('game-control', { detail: action }));
  };

  // IMMORTALITY / COMBO OVERLAY
  // MOVED Z-INDEX HIGHER (z-[70]) to be above questions (z-40)
  const comboOverlay = carsiIzniActive ? (
      <div className="absolute inset-0 z-[70] pointer-events-none animate-pulse">
           <div className="absolute inset-0 border-[20px] border-yellow-500/50 blur-sm"></div>
           <div className="absolute top-24 left-0 w-full text-center">
                <h1 className="text-4xl md:text-6xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] font-cyber animate-bounce">
                    ŞAFAK DOĞAN GÜNEŞ!
                </h1>
                <p className="text-white text-xl md:text-2xl font-bold bg-black/50 inline-block px-4 py-1 rounded">
                    ÇARŞI İZNİ: {Math.ceil(carsiIzniTimer)}s
                </p>
           </div>
      </div>
  ) : null;

  if (status === GameStatus.SHOP) {
      const items: ShopItem[] = [
          { id: 'heal', name: 'TAVUK DÖNER', description: '+1 CAN YENİLER', price: 300, iconType: 'HEAL' },
          { id: 'double_jump', name: 'BES KIDEMLİSİ', description: 'ÇİFT ZIPLAMA ÖZELLİĞİ', price: 500, iconType: 'JUMP' },
          { id: 'immortal', name: 'MÜKAFAT ÇARŞI İZNİ', description: '10 SN DOKUNULMAZLIK', price: 800, iconType: 'IMMORTAL' },
      ];

      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md flex flex-col items-center justify-center p-4">
               <div className="w-full max-w-2xl bg-gray-900 border-2 border-yellow-500 rounded-xl p-6 shadow-[0_0_50px_rgba(255,200,0,0.2)]">
                   <div className="flex items-center justify-center mb-6 border-b border-yellow-500/30 pb-4">
                       <ShoppingBag className="w-10 h-10 text-yellow-500 mr-3" />
                       <h1 className="text-3xl md:text-4xl font-black text-yellow-400 font-cyber tracking-wider">ÇİPA KAFETERYA</h1>
                   </div>

                   <div className="text-center mb-8">
                       <p className="text-gray-400 text-sm uppercase tracking-widest">MEVCUT BAKİYE</p>
                       <div className="text-4xl font-bold text-green-400 font-mono">{score} COF</div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                       {items.map(item => {
                           // Double jump is one-time purchase
                           const isOwned = item.id === 'double_jump' && hasDoubleJump;
                           const canAfford = score >= item.price;
                           
                           let Icon = Activity;
                           if (item.iconType === 'JUMP') Icon = ArrowUpCircle;
                           if (item.iconType === 'IMMORTAL') Icon = Shield;
                           if (item.iconType === 'HEAL') Icon = Heart;

                           return (
                               <div key={item.id} className={`bg-gray-800 p-4 rounded-lg border ${isOwned ? 'border-green-500 opacity-75' : 'border-gray-700'} flex flex-col items-center text-center hover:bg-gray-750 transition-colors`}>
                                   <Icon className={`w-12 h-12 mb-2 ${isOwned ? 'text-green-500' : 'text-cyan-400'}`} />
                                   <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                   <p className="text-xs text-gray-400 mb-4 h-8">{item.description}</p>
                                   
                                   {isOwned ? (
                                       <div className="px-4 py-2 bg-green-500/20 text-green-400 font-bold rounded w-full">ALINDI</div>
                                   ) : (
                                       <button 
                                           onClick={() => buyItem(item.id)}
                                           disabled={!canAfford}
                                           className={`w-full py-2 px-4 rounded font-bold transition-all ${canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                       >
                                           {item.price} COF
                                       </button>
                                   )}
                               </div>
                           );
                       })}
                   </div>

                   <button 
                       onClick={() => resumeFromShop()}
                       className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:brightness-110 text-white font-bold text-xl rounded-xl shadow-lg"
                   >
                       BES KOŞUSUNA GERİ DÖN
                   </button>
               </div>
          </div>
      );
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.2)] border border-white/10 animate-in zoom-in-95 duration-500">
                <div className="relative w-full bg-gray-900 p-8 flex flex-col items-center">
                     <GraduationCap className="w-24 h-24 text-cyan-400 mb-6" />
                     <h1 className="text-3xl md:text-4xl font-black text-white mb-2 font-cyber text-center leading-tight">KAÇ BİRİNCİ SINIFIM KAÇ</h1>
                     <p className="text-gray-400 text-center mb-8 text-sm md:text-base">
                        İkinci sınıflardan kaçmak için doğru cevapları bil ve yarışmayı tamamla.<br/>
                        <span className="text-red-400 mt-2 block">Yoksa numaran alınacak ve haftasonu dışarı çıkamayacaksın!</span>
                     </p>
                     
                     <button 
                        onClick={() => { audio.init(); startGame(); }}
                        className="w-full px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] flex items-center justify-center"
                     >
                        BES KOŞUSU BAŞLASIN
                     </button>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <h1 className="text-3xl md:text-5xl font-black text-red-500 mb-6 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] font-cyber text-center leading-tight">
                    İKİNCİ SINIFLAR SENİ YAKALADI VE ÇARPILDIN
                </h1>
                <p className="text-xl md:text-2xl text-yellow-300 font-bold mb-8 text-center border-b-2 border-yellow-300 pb-2">
                    ARTIK HAYATINA JUKEBOX OLARAK DEVAM EDECEKSİN
                </p>
                
                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 text-sm md:text-base"><GraduationCap className="mr-2 w-4 h-4 md:w-5 md:h-5"/> DOĞRU CEVAP</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{gemsCollected}</div>
                    </div>
                     <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg flex items-center justify-between mt-2">
                        <div className="flex items-center text-white text-sm md:text-base">COF GÜCÜ</div>
                        <div className="text-2xl md:text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{score.toLocaleString()}</div>
                    </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                >
                    TEKRAR DENE
                </button>
              </div>
          </div>
      );
  }

  // --- PLAYING STATE ---
  return (
    <>
        {comboOverlay}
        <div className={containerClass}>
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full">
                <div className="flex flex-col">
                    <div className="text-xl md:text-3xl font-bold text-cyan-400 font-cyber">
                        COF GÜCÜ: {score.toLocaleString()}
                    </div>
                </div>
                
                <div className="flex space-x-1 md:space-x-2">
                    {[...Array(maxLives)].map((_, i) => (
                        <Heart 
                            key={i} 
                            className={`w-6 h-6 md:w-8 md:h-8 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-800 fill-gray-800'} drop-shadow-[0_0_5px_#ff0054]`} 
                        />
                    ))}
                </div>
            </div>
            
            {/* MILESTONE POPUP */}
            {milestoneMessage && (
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-[60] w-full px-4 flex justify-center">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-[0_0_50px_rgba(255,215,0,0.6)] animate-bounce border-4 border-white">
                        <div className="flex items-center text-lg md:text-2xl font-black font-cyber text-center">
                            <Gift className="mr-3 w-8 h-8" />
                            {milestoneMessage}
                        </div>
                    </div>
                </div>
            )}
            
            {/* QUESTION DISPLAY */}
            {currentQuestion && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[70%] z-40">
                    <div className="bg-black/70 backdrop-blur-md border border-cyan-500/50 p-4 md:p-6 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                        <div className="text-center">
                            <span className="block text-cyan-300 text-xs md:text-sm tracking-widest mb-2 font-mono uppercase">BOŞLUĞU DOLDUR</span>
                            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight break-words font-cyber">
                                {currentQuestion.sentence.split('______').map((part, i, arr) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block border-b-4 border-yellow-400 min-w-[60px] mx-2 animate-pulse text-yellow-400">?</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </h2>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Info */}
            <div className="w-full flex justify-between items-end pointer-events-none mb-24 md:mb-0">
                <div className="flex items-center text-cyan-500/70">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    <span className="font-mono text-sm md:text-base uppercase">DOĞRU CEVAP: {questionsAnswered}</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-500 opacity-70">
                    <Zap className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
                    <span className="font-mono text-sm md:text-xl uppercase">COFLAMA HIZI %{Math.round((speed / RUN_SPEED_BASE) * 100)}</span>
                </div>
            </div>
            
            {/* MOBILE CONTROLS */}
            <div className="absolute bottom-8 left-0 w-full px-4 flex justify-between pointer-events-auto md:hidden z-[60]">
                <div className="flex space-x-4">
                     <button 
                        onPointerDown={() => triggerControl('LEFT')} 
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center active:bg-white/40 active:scale-95 transition-all border-2 border-white/30"
                     >
                        <ChevronLeft className="w-10 h-10 text-white" />
                     </button>
                     <button 
                        onPointerDown={() => triggerControl('RIGHT')} 
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center active:bg-white/40 active:scale-95 transition-all border-2 border-white/30"
                     >
                        <ChevronRight className="w-10 h-10 text-white" />
                     </button>
                </div>
                
                <button 
                   onPointerDown={() => triggerControl('JUMP')} 
                   className="w-20 h-20 bg-cyan-500/30 backdrop-blur-sm rounded-full flex items-center justify-center active:bg-cyan-500/50 active:scale-95 transition-all border-2 border-cyan-400/50"
                >
                   <ArrowUp className="w-10 h-10 text-white" />
                </button>
            </div>
        </div>
    </>
  );
};
