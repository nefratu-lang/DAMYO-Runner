// ... importlar
import { GameObject, ObjectType, LANE_WIDTH, REMOVE_DISTANCE, GameStatus, TENSE_COLORS, QuestionType } from '../../types';
// ... 

// Yeni Geometri: Puan Kutusu (Basit Kutu)
const BONUS_BOX_GEO = new THREE.BoxGeometry(1.2, 1.2, 1.2); 

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
            const time = state.clock.elapsedTime;
            
            // Animasyonlar
            if (data.type === ObjectType.BONUS_POINT) {
                // Puan Kutusu Dönme Efekti
                groupRef.current.rotation.y += delta * 3;
                groupRef.current.rotation.x += delta;
            } else if (data.type === ObjectType.OBSTACLE_BAD) {
                 // Kapuska/Brokoli hafif sallanma
                 groupRef.current.rotation.y = Math.sin(time * 2) * 0.2;
            }
        }
    });

    return (
        <group ref={groupRef}>
            {data.type === ObjectType.ANSWER_BLOCK && (
                // ... (Answer Block kodu aynı)
                <group>
                    {/* ... */}
                </group>
            )}

            {/* REVİR KODU SİLİNDİ, YERİNE BONUS BOX GELDİ */}
            {data.type === ObjectType.BONUS_POINT && (
                 <group>
                    <mesh geometry={BONUS_BOX_GEO}>
                        <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Floating Label */}
                    <group position={[0, 1.5, 0]}>
                        <Text fontSize={0.8} color="yellow" outlineWidth={0.05} outlineColor="black">
                            +50
                        </Text>
                    </group>
                 </group>
            )}

            {data.type === ObjectType.OBSTACLE_BAD && (
                 <group>
                    {/* Tencere Modeli */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.7, 0.6, 0.8, 16]} />
                        <meshStandardMaterial color="#444" roughness={0.5} />
                    </mesh>
                    {/* İçindeki Yemek Rengi (Kapuska vs Brokoli) */}
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
  
  // ... (Ref tanımları aynı)

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    updateTimers(delta); // Timer güncelleme

    // ... (Hareket mantığı aynı)
    
    // --- SPAWN LOGIC ---
    if (currentQuestion && currentQuestion.id !== lastSpawnedQuestionId.current && canSpawn) {
        lastSpawnedQuestionId.current = currentQuestion.id;
        
        const offset = (laneCount - 1) * LANE_WIDTH / 2;
        const spawnZ = -220; 

        // Engel/Bonus Spawn (Sıklık Artırıldı: %70 şans)
        const rand = Math.random();
        if (rand > 0.3) { 
             const randomLane = Math.floor(Math.random() * laneCount);
             const puX = (randomLane * LANE_WIDTH) - offset;
             
             // %60 Kötü Yemek, %40 Puan Kutusu
             const isBad = Math.random() > 0.4;
             
             let type = ObjectType.OBSTACLE_BAD;
             let subType: 'KAPUSKA' | 'BROKOLI' | undefined = undefined;

             if (isBad) {
                 type = ObjectType.OBSTACLE_BAD;
                 // %50 Kapuska, %50 Brokoli
                 subType = Math.random() > 0.5 ? 'KAPUSKA' : 'BROKOLI';
             } else {
                 type = ObjectType.BONUS_POINT;
             }
             
             // Pozisyon: Kutular havada (zıplanarak alınır), Yemekler yerde (üstünden atlanır)
             const spawnY = type === ObjectType.BONUS_POINT ? 2.5 : 0.5;

             objectsRef.current.push({
                 id: uuidv4(),
                 type: type,
                 subType: subType, // Yeni özellik
                 position: [puX, spawnY, spawnZ + 60], 
                 active: true
             });
        }

        // ... (Soru Spawn mantığı aynı)
    }

    // --- COLLISION LOGIC ---
    // ... (Döngü başlangıcı aynı)

                if (dx < hitWidth) {
                     if (obj.type === ObjectType.ANSWER_BLOCK) {
                         // ... (Soru mantığı aynı)
                     } else if (obj.type === ObjectType.BONUS_POINT) {
                         // Puan Kutusu (Havada)
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         if (dy < 1.5) { // Zıplayıp aldı mı?
                             audio.playGemCollect();
                             collectBonus(); // +50 Puan
                             obj.active = false;
                             hasChanges = true;
                             keep = false;
                         }
                     } else if (obj.type === ObjectType.OBSTACLE_BAD) {
                         // Kötü Yemek (Yerde)
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         
                         // Eğer oyuncu yerdeyse (zıplamamışsa) çarpar
                         if (dy < 1.2) { 
                             audio.playBadCollect();
                             collectBadFood(obj.subType || 'KAPUSKA'); // İsmi gönder
                             obj.active = false;
                             hasChanges = true;
                             keep = false;
                         }
                     }
                }
    // ... (Döngü bitişi aynı)
