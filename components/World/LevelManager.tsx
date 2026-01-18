/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store';
import { GameObject, ObjectType, LANE_WIDTH, REMOVE_DISTANCE, GameStatus, TENSE_COLORS, QuestionType } from '../../types';
import { audio } from '../System/Audio';

const ANSWER_BLOCK_GEO = new THREE.BoxGeometry(4.0, 4.0, 0.5);
const BONUS_BOX_GEO = new THREE.BoxGeometry(1.2, 1.2, 1.2); 

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
            const time = state.clock.elapsedTime;
            
            if (data.type === ObjectType.BONUS_POINT) {
                groupRef.current.rotation.y += delta * 3;
                groupRef.current.rotation.x += delta;
            } else if (data.type === ObjectType.OBSTACLE_BAD) {
                 groupRef.current.rotation.y = Math.sin(time * 2) * 0.2;
                 const scale = 1 + Math.sin(time * 10) * 0.05;
                 groupRef.current.scale.set(scale, scale, scale);
            }
        }
    });

    return (
        <group ref={groupRef}>
            {data.type === ObjectType.ANSWER_BLOCK && (
                <group>
                    <mesh geometry={ANSWER_BLOCK_GEO}>
                        <meshStandardMaterial color={data.color} transparent opacity={0.6} roughness={0.1} metalness={0.8} />
                    </mesh>
                    <mesh><boxGeometry args={[4.05, 4.05, 0.55]} /><meshBasicMaterial color={data.color} wireframe /></mesh>
                    <group position={[0, 0, 0.4]}>
                        <Text color="white" fontSize={1.8} maxWidth={4.0} lineHeight={1} textAlign="center" anchorX="center" anchorY="middle" outlineWidth={0.08} outlineColor="black">
                            {data.text}
                        </Text>
                    </group>
                </group>
            )}

            {data.type === ObjectType.BONUS_POINT && (
                 <group>
                    <mesh geometry={BONUS_BOX_GEO}>
                        <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <group position={[0, 1.5, 0]}>
                        <Text fontSize={0.8} color="yellow" outlineWidth={0.05} outlineColor="black">+50</Text>
                    </group>
                 </group>
            )}

            {data.type === ObjectType.OBSTACLE_BAD && (
                 <group>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.7, 0.6, 0.8, 16]} />
                        <meshStandardMaterial color="#444" roughness={0.5} />
                    </mesh>
                    <mesh position={[0, 0.41, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <circleGeometry args={[0.65, 16]} />
                        <meshBasicMaterial color={data.subType === 'BROKOLI' ? '#2e7d32' : '#c6ff00'} />
                    </mesh>
                    <group position={[0, 1.2, 0]}>
                        <Text fontSize={0.7} color={data.subType === 'BROKOLI' ? '#2e7d32' : '#c6ff00'} outlineWidth={0.05} outlineColor="black">
                            {data.subType === 'BROKOLI' ? 'BROKOLİ' : 'KAPUSKA'}
                        </Text>
                    </group>
                 </group>
            )}
        </group>
    );
});

export const LevelManager: React.FC = () => {
  const { 
    status, speed, submitAnswer, collectBonus, collectBadFood, currentQuestion, laneCount, updateTimers
  } = useStore();
  
  const objectsRef = useRef<GameObject[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const lastSpawnedQuestionId = useRef<string | null>(null);

  useEffect(() => {
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
          if (group && group.children.length > 0) playerObjRef.current = group.children[0];
      }
  });

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    updateTimers(delta);

    const safeDelta = Math.min(delta, 0.05); 
    const dist = speed * safeDelta;
    
    const objectsAhead = objectsRef.current.filter(o => o.position[2] < -50);
    const canSpawn = objectsAhead.length === 0;

    if (currentQuestion && currentQuestion.id !== lastSpawnedQuestionId.current && canSpawn) {
        lastSpawnedQuestionId.current = currentQuestion.id;
        
        const offset = (laneCount - 1) * LANE_WIDTH / 2;
        const spawnZ = -220; 

        // Engel/Bonus Spawn
        const rand = Math.random();
        if (rand > 0.3) { 
             const randomLane = Math.floor(Math.random() * laneCount);
             const puX = (randomLane * LANE_WIDTH) - offset;
             
             const isBad = Math.random() > 0.4;
             let type = ObjectType.OBSTACLE_BAD;
             let subType: 'KAPUSKA' | 'BROKOLI' | undefined = undefined;

             if (isBad) {
                 type = ObjectType.OBSTACLE_BAD;
                 subType = Math.random() > 0.5 ? 'KAPUSKA' : 'BROKOLI';
             } else {
                 type = ObjectType.BONUS_POINT;
             }
             
             const spawnY = type === ObjectType.BONUS_POINT ? 2.5 : 0.5;

             objectsRef.current.push({
                 id: uuidv4(),
                 type: type,
                 subType: subType,
                 position: [puX, spawnY, spawnZ + 60], 
                 active: true
             });
        }

        const newObjects: GameObject[] = [];
        const correctColor = TENSE_COLORS[currentQuestion.type];
        const getWrongColor = () => {
            const allColors = [TENSE_COLORS[QuestionType.PRESENT], TENSE_COLORS[QuestionType.PAST], TENSE_COLORS[QuestionType.FUTURE]];
            const available = allColors.filter(c => c !== correctColor);
            return available[Math.floor(Math.random() * available.length)];
        };

        currentQuestion.options.forEach((optionText, index) => {
            if (index >= laneCount) return;
            const x = (index * LANE_WIDTH) - offset;
            const isCorrect = index === currentQuestion.correctIndex;
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

    let playerPos = new THREE.Vector3(0, 0, 0);
    if (playerObjRef.current) playerObjRef.current.getWorldPosition(playerPos);

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
                const dx = Math.abs(obj.position[0] - playerPos.x);
                const hitWidth = obj.type === ObjectType.ANSWER_BLOCK ? 1.8 : 1.0;

                if (dx < hitWidth) {
                     if (obj.type === ObjectType.ANSWER_BLOCK) {
                         if (obj.isCorrect) { audio.playLetterCollect(); submitAnswer(true); } 
                         else { audio.playDamage(); submitAnswer(false); }
                         obj.active = false;
                         hasChanges = true;
                         const zPos = obj.position[2];
                         objectsRef.current.forEach(o => { if (Math.abs(o.position[2] - zPos) < 5) o.active = false; });
                         keep = false; 
                     } else if (obj.type === ObjectType.BONUS_POINT) {
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         if (dy < 1.5) { 
                             audio.playGemCollect();
                             collectBonus();
                             obj.active = false;
                             hasChanges = true;
                             keep = false;
                         }
                     } else if (obj.type === ObjectType.OBSTACLE_BAD) {
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         if (dy < 1.2) { 
                             audio.playBadCollect();
                             collectBadFood(obj.subType || 'KAPUSKA');
                             obj.active = false;
                             hasChanges = true;
                             keep = false;
                         }
                     }
                }
            }
        }

        if (obj.position[2] > REMOVE_DISTANCE) { keep = false; hasChanges = true; }
        if (keep && obj.active) keptObjects.push(obj);
        else if (!keep) hasChanges = true;
    }

    if (hasChanges) { objectsRef.current = keptObjects; setRenderTrigger(t => t + 1); }
  });

  return (
    <group>
      {objectsRef.current.map(obj => { if (!obj.active) return null; return <GameEntity key={obj.id} data={obj} />; })}
    </group>
  );
};
