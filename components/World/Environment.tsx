// ... importlar aynı

const StarField: React.FC = () => {
  const speed = useStore(state => state.speed);
  const count = 200; // OPTİMİZASYON: 600'den 200'e düşürdük. Çok fark etmez ama rahatlatır.
  
  // ... (logic aynı)
  
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
        size={0.8} // Sayı azaldığı için boyutu biraz büyüttük
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// ... (LaneGuides ve MovingGrid aynı kalabilir, onlar hafif)

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#050011']} />
      {/* OPTİMİZASYON: Fog mesafesini azalttık, uzaktaki nesneler daha erken kaybolsun */}
      <fog attach="fog" args={['#050011', 20, 180]} /> 
      
      <ambientLight intensity={0.5} />
      {/* Shadow map kapalı, basit ışıklandırma */}
      <directionalLight position={[0, 20, -10]} intensity={1.0} color="#00ffff" />
      
      <StarField />
      <MovingGrid />
      <LaneGuides />
      
      <RetroSun />
    </>
  );
};
