
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store';
import { GameObject, ObjectType, LANE_WIDTH, REMOVE_DISTANCE, GameStatus, TENSE_COLORS, QuestionType } from '../../types';
import { audio } from '../System/Audio';

// Geometry Constants
const ANSWER_BLOCK_GEO = new THREE.BoxGeometry(4.0, 4.0, 0.5); // Wider for 4.5 lane width
const POWERUP_GEO = new THREE.BoxGeometry(1, 1, 1);

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Base Position
            groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
            
            const time = state.clock.elapsedTime;
            
            if (data.type === ObjectType.POWERUP_HEAL) {
                // Spin and Bob for Floating Powerup
                groupRef.current.rotation.y += delta * 2;
                groupRef.current.rotation.x = Math.sin(time * 3) * 0.2;
                groupRef.current.position.y = data.position[1] + Math.sin(time * 4) * 0.5;
            } else if (data.type === ObjectType.OBSTACLE_BAD) {
                 // Ground Obstacle: Just spin slightly, sit on floor
                 groupRef.current.rotation.y += delta;
                 // Slight scale pulse for "bubbling" effect
                 const scale = 1 + Math.sin(time * 10) * 0.05;
                 groupRef.current.scale.set(scale, scale, scale);
            } else {
                 // Subtle bobbing for gates
                 groupRef.current.position.y = data.position[1] + Math.sin(time * 3 + data.position[0]) * 0.1;
            }
        }
    });

    return (
        <group ref={groupRef}>
            {data.type === ObjectType.ANSWER_BLOCK && (
                <group>
                    {/* The Gate Visual */}
                    <mesh geometry={ANSWER_BLOCK_GEO}>
                        <meshStandardMaterial 
                            color={data.color} 
                            transparent 
                            opacity={0.6} // Slightly higher opacity for color clarity
                            roughness={0.1}
                            metalness={0.8}
                        />
                    </mesh>
                    
                    {/* Glowing Border */}
                    <mesh>
                        <boxGeometry args={[4.05, 4.05, 0.55]} />
                        <meshBasicMaterial color={data.color} wireframe />
                    </mesh>

                    {/* Text - MASSIVE SIZE */}
                    <group position={[0, 0, 0.4]}>
                        <Text
                            color="white"
                            fontSize={1.8} 
                            maxWidth={4.0} 
                            lineHeight={1}
                            textAlign="center"
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={0.08}
                            outlineColor="black"
                        >
                            {data.text}
                        </Text>
                    </group>
                </group>
            )}

            {data.type === ObjectType.POWERUP_HEAL && (
                 <group>
                    {/* Cross Shape for Revir/Heal */}
                    <mesh>
                        <boxGeometry args={[0.3, 1.2, 0.3]} />
                        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
                    </mesh>
                    <mesh>
                        <boxGeometry args={[1.2, 0.3, 0.3]} />
                        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
                    </mesh>
                    
                    {/* Floating Label */}
                    <group position={[0, 1.2, 0]}>
                        <Text
                            fontSize={0.8}
                            color="#00ff00"
                            outlineWidth={0.05}
                            outlineColor="black"
                        >
                            REVİR
                        </Text>
                    </group>
                 </group>
            )}

            {data.type === ObjectType.OBSTACLE_BAD && (
                 <group>
                    {/* Green Cube/Pot for Kapuska/Brokoli on GROUND */}
                    {/* Main Pot */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.6, 0.5, 0.8, 16]} />
                        <meshStandardMaterial color="#2d4a10" roughness={0.9} />
                    </mesh>
                    {/* Green Slime Top */}
                    <mesh position={[0, 0.41, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <circleGeometry args={[0.55, 16]} />
                        <meshBasicMaterial color="#76ff03" />
                    </mesh>
                    
                    {/* Floating Label */}
                    <group position={[0, 1.0, 0]}>
                        <Text
                            fontSize={0.7}
                            color="#adff2f"
                            outlineWidth={0.05}
                            outlineColor="black"
                        >
                            KAPUSKA
                        </Text>
                    </group>
                 </group>
            )}
        </group>
    );
});


export const LevelManager: React.FC = () => {
  const { 
    status, 
    speed, 
    submitAnswer,
    collectHeal,
    collectBadFood,
    currentQuestion,
    laneCount,
    updateCarsiIzni
  } = useStore();
  
  const objectsRef = useRef<GameObject[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  
  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const lastSpawnedQuestionId = useRef<string | null>(null);

  // Handle resets
  useEffect(() => {
    const isRestart = status === GameStatus.PLAYING && (prevStatus.current === GameStatus.GAME_OVER || prevStatus.current === GameStatus.VICTORY || prevStatus.current === GameStatus.MENU || prevStatus.current === GameStatus.SHOP);
    
    // Only clear objects if we came from Game Over or Menu. If from SHOP, we preserve.
    const shouldClear = status === GameStatus.PLAYING && (prevStatus.current === GameStatus.GAME_OVER || prevStatus.current === GameStatus.MENU);

    if (shouldClear) {
        objectsRef.current = [];
        lastSpawnedQuestionId.current = null;
        setRenderTrigger(t => t + 1);
    }
    
    prevStatus.current = status;
  }, [status]);

  useFrame((state) => {
      if (!playerObjRef.current) {
          const group = state.scene.getObjectByName('PlayerGroup');
          if (group && group.children.length > 0) {
              playerObjRef.current = group.children[0];
          }
      }
  });

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    // Update Timers
    updateCarsiIzni(delta);

    const safeDelta = Math.min(delta, 0.05); 
    const dist = speed * safeDelta;
    
    // --- 1. SPAWN LOGIC ---
    
    const objectsAhead = objectsRef.current.filter(o => o.position[2] < -50);
    const canSpawn = objectsAhead.length === 0;

    if (currentQuestion && currentQuestion.id !== lastSpawnedQuestionId.current && canSpawn) {
        lastSpawnedQuestionId.current = currentQuestion.id;
        
        const offset = (laneCount - 1) * LANE_WIDTH / 2;
        const spawnZ = -220; 

        // 1. Spawn Powerup OR Bad Food Chance (Between waves)
        const rand = Math.random();
        if (rand > 0.5) { // 50% chance something spawns
             const randomLane = Math.floor(Math.random() * laneCount);
             const puX = (randomLane * LANE_WIDTH) - offset;
             
             // 50/50 Split between GOOD (Revir) and BAD (Kapuska)
             const type = Math.random() > 0.5 ? ObjectType.POWERUP_HEAL : ObjectType.OBSTACLE_BAD;
             
             // Position Logic: Revir floats (2.5), Kapuska sits on ground (0.5)
             const spawnY = type === ObjectType.OBSTACLE_BAD ? 0.5 : 2.5;

             objectsRef.current.push({
                 id: uuidv4(),
                 type: type,
                 position: [puX, spawnY, spawnZ + 60], // Spawn closer than questions
                 active: true
             });
        }

        // 2. Spawn Questions
        const newObjects: GameObject[] = [];
        
        // --- COLOR LOGIC ---
        const correctColor = TENSE_COLORS[currentQuestion.type];
        
        // Helper to get a random wrong color
        const getWrongColor = () => {
            const allColors = [TENSE_COLORS[QuestionType.PRESENT], TENSE_COLORS[QuestionType.PAST], TENSE_COLORS[QuestionType.FUTURE]];
            const available = allColors.filter(c => c !== correctColor);
            return available[Math.floor(Math.random() * available.length)];
        };

        currentQuestion.options.forEach((optionText, index) => {
            if (index >= laneCount) return;

            const x = (index * LANE_WIDTH) - offset;
            const isCorrect = index === currentQuestion.correctIndex;
            
            // If it's correct, use the Tense Color (e.g. Past -> Red)
            const blockColor = isCorrect ? correctColor : getWrongColor();

            newObjects.push({
                id: uuidv4(),
                type: ObjectType.ANSWER_BLOCK,
                position: [x, 2.0, spawnZ], 
                active: true,
                text: optionText,
                isCorrect: isCorrect,
                color: blockColor 
            });
        });
        
        objectsRef.current = [...objectsRef.current, ...newObjects];
        setRenderTrigger(t => t + 1);
    }


    // --- 2. MOVE & COLLIDE LOGIC ---
    let playerPos = new THREE.Vector3(0, 0, 0);
    if (playerObjRef.current) {
        playerObjRef.current.getWorldPosition(playerPos);
    }

    const keptObjects: GameObject[] = [];
    let hasChanges = false;

    for (const obj of objectsRef.current) {
        const prevZ = obj.position[2];
        obj.position[2] += dist;

        let keep = true;

        if (obj.active) {
            const zThreshold = 1.0; 
            const inZZone = (prevZ < playerPos.z + zThreshold) && (obj.position[2] > playerPos.z - zThreshold);

            if (inZZone) {
                // Horizontal Check
                const dx = Math.abs(obj.position[0] - playerPos.x);
                // Box collision logic
                const hitWidth = obj.type === ObjectType.ANSWER_BLOCK ? 1.8 : 1.0;

                if (dx < hitWidth) {
                     // HIT LOGIC
                     if (obj.type === ObjectType.ANSWER_BLOCK) {
                         if (obj.isCorrect) {
                             audio.playLetterCollect(); 
                             submitAnswer(true);
                         } else {
                             audio.playDamage(); 
                             submitAnswer(false);
                         }
                         
                         obj.active = false;
                         hasChanges = true;
                         
                         // Clear others in row
                         const zPos = obj.position[2];
                         objectsRef.current.forEach(o => {
                             if (Math.abs(o.position[2] - zPos) < 5) o.active = false;
                         });
                         keep = false; 

                     } else if (obj.type === ObjectType.POWERUP_HEAL) {
                         // Must intersect in Y too roughly (Flying)
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         if (dy < 1.5) {
                             audio.playGemCollect();
                             collectHeal();
                             obj.active = false;
                             hasChanges = true;
                             keep = false;
                         }
                     } else if (obj.type === ObjectType.OBSTACLE_BAD) {
                         // Must intersect in Y too (Ground)
                         // Player Y is approx 1.1 at center. Object is at 0.5. 
                         // Collision happens if player is LOW (walking)
                         // If Player jumps high (Y > 2.0), no collision
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         
                         if (dy < 1.2) { // Hit range
                             audio.playBadCollect();
                             collectBadFood();
                             obj.active = false;
                             hasChanges = true;
                             keep = false;
                         }
                     }
                }
            }
        }

        if (obj.position[2] > REMOVE_DISTANCE) {
            keep = false;
            hasChanges = true;
        }

        if (keep && obj.active) {
            keptObjects.push(obj);
        } else if (!keep) {
            hasChanges = true;
        }
    }

    if (hasChanges) {
        objectsRef.current = keptObjects;
        setRenderTrigger(t => t + 1);
    }
  });

  return (
    <group>
      {objectsRef.current.map(obj => {
        if (!obj.active) return null;
        return <GameEntity key={obj.id} data={obj} />;
      })}
    </group>
  );
};
