import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Exoplanet } from '../types';
import PlanetDetailPanel from './PlanetDetailPanel';
import { useAppContext } from '../AppContext';

interface PlanetSphereProps {
  planet: Exoplanet;
  position: [number, number, number];
  onSelect: (planet: Exoplanet) => void;
}

const PlanetSphere: React.FC<PlanetSphereProps> = ({ planet, position, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const { theme } = useAppContext();

  const radius = useMemo(() => {
    let r = planet.radius_earth || 1;
    if (r > 10) r = 10 + Math.log10(r) * 2; // Gas giants
    else if (r < 0.8) r *= 1.2; // Small planets
    return Math.max(0.2, r * 0.2);
  }, [planet.radius_earth]);

  const color = useMemo(() => {
    const temp = planet.equilibrium_temp_K || 0;
    if (temp > 1000) return '#ff6600'; // Hot
    if (temp > 373) return '#ffcc00'; // Warm
    if (temp > 250) return '#3399ff'; // Temperate (Earth-like)
    return '#99ccff'; // Cold
  }, [planet.equilibrium_temp_K]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => { e.stopPropagation(); onSelect(planet); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[position[0], position[1] + radius + 0.3, position[2]]}
        fontSize={0.25}
        color={theme === 'dark' ? "white" : "black"}
        anchorX="center"
        anchorY="middle"
        visible={hovered}
      >
        {planet.name}
      </Text>
    </>
  );
};


interface Explorer3DProps {
  planets: Exoplanet[];
}

const Explorer3D: React.FC<Explorer3DProps> = ({ planets }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null);
  const { t } = useAppContext();

  const planetPositions = useMemo(() => {
    return planets.map(p => {
        const distance = (p.semi_major_axis_AU || 1) * 10;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const y = (Math.random() - 0.5) * 2;
        return [x, y, z] as [number, number, number];
    });
  }, [planets]);

  return (
    <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 5, 20], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 0]} intensity={2.5} color="#FFDDBB" />
          <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade />
          
          {planets.map((planet, i) => (
            <PlanetSphere
              key={planet.id}
              planet={planet}
              position={planetPositions[i]}
              onSelect={setSelectedPlanet}
            />
          ))}

          <OrbitControls 
            enableZoom={true} 
            enablePan={true}
            minDistance={2}
            maxDistance={100}
          />
        </Suspense>
      </Canvas>

      {/* العنوان والوصف */}
      <div className="absolute top-4 ltr:left-4 rtl:right-4 text-white bg-black/50 p-2 rounded z-40">
        <h2 className="text-xl font-bold text-sky-300">{t('explorer_title')}</h2>
        <p className="text-sm">{t('explorer_subtitle')}</p>
      </div>

      {/* لوحة تفاصيل الكوكب كـ Sidebar بطول كامل */}
    {/* لوحة تفاصيل الكوكب كـ Sidebar يبدأ بعد 20% من فوق */}
{selectedPlanet && (
  <div className="absolute top-[10%] right-0 h-[80%] w-96 bg-black text-white shadow-2xl z-[9999] animate-slide-in overflow-y-auto">
    <PlanetDetailPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
  </div>
)}

      <style>{`
        @keyframes slide-in-ltr {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slide-in-rtl {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
            animation-name: slide-in-ltr;
            animation-duration: 0.3s;
            animation-timing-function: ease-out;
            animation-fill-mode: forwards;
        }
        [dir="rtl"] .animate-slide-in {
            animation-name: slide-in-rtl;
        }
      `}</style>
    </div>
  );
};

export default Explorer3D;
