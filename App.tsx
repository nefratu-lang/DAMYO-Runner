// ... importlar aynı

const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.0; // Mobil portre tespiti

    // MOBİL AYARLARI: Daha geriden ve yukarıdan bakmalı
    const heightFactor = isMobile ? 6.0 : 1.5; // Mobilde daha yüksek (Eski: 3.0 idi)
    const distFactor = isMobile ? 12.0 : 2.5;  // Mobilde daha uzak (Eski: 6.0 idi)

    const targetY = 7.0 + heightFactor; 
    const targetZ = 12.0 + distFactor;

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    camera.position.lerp(targetPos, delta * 2.0);
    
    // Kamerayı biraz daha aşağı eğiyoruz ki yerdeki engeller (Kapuska) mobilde görünsün
    camera.lookAt(0, -2, -40); 
  });
  
  return null;
};

// ... (Geri kalan App.tsx aynı)
