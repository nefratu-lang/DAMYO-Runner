/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.0; 

    // MOBİL İÇİN AYARLAR
    const heightFactor = isMobile ? 6.0 : 1.5; 
    const distFactor = isMobile ? 12.0 : 2.5; 

    const targetY = 7.0 + heightFactor; 
    const targetZ = 12.0 + distFactor;

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    camera.position.lerp(targetPos, delta * 2.0);
    camera.lookAt(0, -2, -40); 
  });
  
  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

const LoadingScreen = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-cyan-400 font-bold text-xl font-cyber animate-pulse">BES KOŞUSU YÜKLENİYOR...</h2>
        </div>
    </div>
);

function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- FULL SCREEN FONKSİYONU ---
  const toggleFullscreen = () => {
    const doc = window.document as any;
    const docEl = doc.documentElement as any;

    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (requestFullScreen) requestFullScreen.call(docEl);
    } else {
      if (cancelFullScreen) cancelFullScreen.call(doc);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = window.document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari için
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none" style={{ width: '100vw', height: '100vh' }}>
      
      <HUD />

      {/* --- TAM EKRAN BUTONU (Sağ Üst) --- */}
      <button 
        onClick={toggleFullscreen}
        className="fixed top-4 right-4 z-[9999] p-3 bg-slate-900/80 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-500/50 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95 group backdrop-blur-sm"
        title="Tam Ekran Yap"
      >
        {isFullscreen ? (
           // Küçült İkonu
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
        ) : (
           // Büyüt İkonu
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        )}
      </button>

      <Suspense fallback={<LoadingScreen />}>
        <Canvas
            dpr={[1, 1.5]} 
            gl={{ 
                antialias: false, 
                stencil: false, 
                depth: true, 
                powerPreference: "high-performance" 
            }}
            camera={{ position: [0, 8, 15], fov: 60 }}
            style={{ width: '100%', height: '100%' }}
        >
            <CameraController />
            <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default App;
