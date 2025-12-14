
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, LANE_COLORS } from '../../types';

const StarField: React.FC = () => {
  const speed = useStore(state => state.speed);
  const count = 600; // Optimized: Reduced from 3000 to 600 for mobile performance
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 400;
      let y = (Math.random() - 0.5) * 200 + 50; 
      let z = -550 + Math.random() * 650;

      if (Math.abs(x) < 20 && y > -5 && y < 20) {
          if (x < 0) x -= 20;
          else x += 20;
      }

      pos[i * 3] = x;     
      pos[i * 3 + 1] = y; 
      pos[i * 3 + 2] = z; 
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 2; 

    for (let i = 0; i < count; i++) {
        let z = positions[i * 3 + 2];
        z += activeSpeed * delta * 2.0; 
        
        if (z > 100) {
            z = -550 - Math.random() * 50; 
            let x = (Math.random() - 0.5) * 400;
            let y = (Math.random() - 0.5) * 200 + 50;
            
            if (Math.abs(x) < 20 && y > -5 && y < 20) {
                if (x < 0) x -= 20;
                else x += 20;
            }

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
        }
        positions[i * 3 + 2] = z;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const LaneGuides: React.FC = () => {
    const { laneCount } = useStore();
    
    // Draw lines between lanes
    const separators = useMemo(() => {
        const lines: number[] = [];
        const totalWidth = laneCount * LANE_WIDTH;
        const startX = -totalWidth / 2;
        
        for (let i = 0; i <= laneCount; i++) {
            lines.push(startX + (i * LANE_WIDTH));
        }
        return lines;
    }, [laneCount]);

    return (
        <group position={[0, 0.02, 0]}>
            {/* Lane Floor */}
            <mesh position={[0, -0.02, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[laneCount * LANE_WIDTH + 4, 200]} />
                <meshBasicMaterial color="#1a0b2e" transparent opacity={0.9} />
            </mesh>
            
            {/* Colored Lane Underglow */}
            {separators.length === 5 && LANE_COLORS.map((color, idx) => (
                <mesh key={`glow-${idx}`} position={[separators[idx] + (LANE_WIDTH/2), -0.01, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                     <planeGeometry args={[LANE_WIDTH - 0.2, 200]} />
                     <meshBasicMaterial color={color} transparent opacity={0.05} />
                </mesh>
            ))}

            {/* Separator Lines */}
            {separators.map((x, i) => (
                <mesh key={`sep-${i}`} position={[x, 0, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.05, 200]} /> 
                    <meshBasicMaterial 
                        color="#00ffff" 
                        transparent 
                        opacity={0.4} 
                    />
                </mesh>
            ))}
        </group>
    );
};

const RetroSun: React.FC = () => {
    return (
        <group position={[0, 10, -200]}>
            <mesh>
                <sphereGeometry args={[12, 16, 16]} /> 
                <meshBasicMaterial color="#ff0080" />
            </mesh>
        </group>
    );
};

const MovingGrid: React.FC = () => {
    const speed = useStore(state => state.speed);
    const meshRef = useRef<THREE.Mesh>(null);
    const offsetRef = useRef(0);
    
    useFrame((state, delta) => {
        if (meshRef.current) {
             const activeSpeed = speed > 0 ? speed : 5;
             offsetRef.current += activeSpeed * delta;
             const cellSize = 10;
             const zPos = -100 + (offsetRef.current % cellSize);
             meshRef.current.position.z = zPos;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -100]}>
            <planeGeometry args={[300, 400, 20, 20]} /> 
            <meshBasicMaterial 
                color="#8800ff" 
                wireframe 
                transparent 
                opacity={0.15} 
            />
        </mesh>
    );
};

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#050011']} />
      <fog attach="fog" args={['#050011', 40, 300]} />
      
      <ambientLight intensity={0.6} color="#400080" />
      <directionalLight position={[0, 20, -10]} intensity={1.2} color="#00ffff" />
      
      <StarField />
      <MovingGrid />
      <LaneGuides />
      
      <RetroSun />
    </>
  );
};
