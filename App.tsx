
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense } from 'react';
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
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2; 

    // With 4 lanes, we need to be higher and further back
    const heightFactor = isMobile ? 3.0 : 1.5; // Increased height
    const distFactor = isMobile ? 6.0 : 2.5; // Increased distance

    // Base target
    const targetY = 7.0 + heightFactor; // Higher base Y for better text visibility
    const targetZ = 12.0 + distFactor;  // Further back

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);
    
    // Look further down the track
    camera.lookAt(0, 0, -40); 
  });
  
  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
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
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD />
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
            shadows
            dpr={[1, 1.5]} 
            gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
            // Initial camera
            camera={{ position: [0, 8, 15], fov: 60 }}
        >
            <CameraController />
            <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default App;
