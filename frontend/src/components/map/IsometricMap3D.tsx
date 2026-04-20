import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
  RoundedBox,
  Environment,
  ContactShadows,
  Float,
  Sparkles
} from '@react-three/drei';
import * as THREE from 'three';

interface ZoneData {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  emissive?: string;
  icon: string;
  type: 'pool' | 'sauna' | 'spa' | 'service' | 'rest' | 'cafe';
  temperature?: string;
}

const zones: ZoneData[] = [
  // Бассейны (слева)
  { id: 'pool', name: 'Большой бассейн', x: -8, z: 0, width: 4, depth: 6, height: 0.3, color: '#4A90A4', type: 'pool', icon: '🏊', temperature: '28-30°C' },
  { id: 'cold-bath', name: 'Холодная купель', x: -8, z: 4.5, width: 1.5, depth: 1.5, height: 0.4, color: '#2E6B7A', type: 'pool', icon: '❄️', temperature: '10°C' },
  { id: 'hot-bath', name: 'Горячая купель', x: -5.5, z: 4.5, width: 1.5, depth: 1.5, height: 0.4, color: '#C97B5D', emissive: '#3D1A0A', type: 'pool', icon: '🔥', temperature: '40°C' },

  // Бани-бочки
  { id: 'barrel1', name: 'Баня-бочка', x: -9, z: -4, width: 1.2, depth: 2, height: 1.4, color: '#8B6914', type: 'sauna', icon: '🛢️' },
  { id: 'barrel2', name: 'Баня-бочка', x: -7, z: -4, width: 1.2, depth: 2, height: 1.4, color: '#8B6914', type: 'sauna', icon: '🛢️' },

  // Терраса
  { id: 'terrace', name: 'Терраса', x: -8, z: 6.5, width: 5, depth: 2, height: 0.15, color: '#A67C52', type: 'rest', icon: '☀️' },

  // Центр - сервисы
  { id: 'reception', name: 'Ресепшн', x: -2, z: 3, width: 3, depth: 2, height: 1.2, color: '#D4B896', type: 'service', icon: '🛎️' },
  { id: 'wardrobe', name: 'Гардероб', x: -2, z: 0, width: 2.5, depth: 2, height: 1.5, color: '#C9B896', type: 'service', icon: '🧥' },
  { id: 'showers', name: 'Душевые', x: 1, z: 0, width: 1.5, depth: 2, height: 1.8, color: '#B8D4E3', type: 'service', icon: '🚿' },

  // SPA зона
  { id: 'spa', name: 'SPA', x: 3, z: 0, width: 2, depth: 2, height: 1.2, color: '#E8D5C4', type: 'spa', icon: '💆' },
  { id: 'massage', name: 'Массаж', x: 3, z: 2.5, width: 2, depth: 2, height: 1.2, color: '#E8D5C4', type: 'spa', icon: '💆‍♂️' },
  { id: 'yoga', name: 'Йога', x: -2, z: -2.5, width: 2.5, depth: 2, height: 0.8, color: '#D5E8D4', type: 'spa', icon: '🧘' },

  // Парные (верхний ряд)
  { id: 'russian', name: 'Русская парная', x: -4, z: -5.5, width: 2, depth: 2, height: 2, color: '#8B4513', emissive: '#2A1506', type: 'sauna', icon: '🪵' },
  { id: 'village', name: 'Деревенская', x: -1.5, z: -5.5, width: 2, depth: 2, height: 2, color: '#A0522D', emissive: '#2A1506', type: 'sauna', icon: '🏡' },
  { id: 'indian', name: 'Индийская', x: 1, z: -5.5, width: 2, depth: 2, height: 2, color: '#CD853F', emissive: '#3D2510', type: 'sauna', icon: '🕉️' },
  { id: 'sand', name: 'Песочная', x: 3.5, z: -5.5, width: 2, depth: 2, height: 1.8, color: '#DEB887', emissive: '#3D3020', type: 'sauna', icon: '🏜️' },
  { id: 'herbal', name: 'Травяная', x: 6, z: -5.5, width: 2, depth: 2, height: 1.8, color: '#6B8E23', emissive: '#1A2408', type: 'sauna', icon: '🌿' },
  { id: 'siberian', name: 'Сибирская', x: 8.5, z: -5.5, width: 2, depth: 2, height: 2.2, color: '#2F4F4F', emissive: '#0A1515', type: 'sauna', icon: '🌲' },
  { id: 'himalayan', name: 'Гималайская', x: 11, z: -5.5, width: 2, depth: 2, height: 2, color: '#DB7093', emissive: '#3D1A25', type: 'sauna', icon: '🏔️' },
  { id: 'shaman', name: 'Шаманская', x: 13.5, z: -5.5, width: 2, depth: 2, height: 2.2, color: '#483D8B', emissive: '#12102A', type: 'sauna', icon: '🔮' },

  // Хаммам
  { id: 'hammam', name: 'Хаммам', x: 6, z: 2, width: 3, depth: 2.5, height: 1.5, color: '#4682B4', emissive: '#0A1525', type: 'sauna', icon: '🌙' },

  // Кафе и отдых (справа)
  { id: 'cafe', name: 'Кафе', x: 12, z: 1, width: 3.5, depth: 4, height: 1.8, color: '#D2691E', type: 'cafe', icon: '☕' },
  { id: 'rest1', name: 'Зона отдыха', x: 9, z: -1, width: 2.5, depth: 2.5, height: 0.6, color: '#DEB887', type: 'rest', icon: '🛋️' },
  { id: 'rest2', name: 'Зона у дуба', x: 9, z: 2.5, width: 2.5, depth: 3, height: 0.4, color: '#90EE90', type: 'rest', icon: '🌳' },

  // Детская и фото
  { id: 'kids', name: 'Детская', x: 11, z: 5.5, width: 2.5, depth: 2, height: 1.5, color: '#FFB6C1', type: 'rest', icon: '🧒' },
  { id: 'photo', name: 'Фотозона', x: 14, z: 5.5, width: 2, depth: 2, height: 1, color: '#FFA07A', type: 'rest', icon: '📸' },

  // Малый бассейн
  { id: 'small-pool', name: 'Малый бассейн', x: 9, z: 6, width: 2, depth: 2, height: 0.3, color: '#87CEEB', type: 'pool', icon: '🏊‍♂️' },

  // Рыбки
  { id: 'fish', name: 'Гарра Руфа', x: 6, z: -1, width: 2, depth: 1.5, height: 0.35, color: '#20B2AA', type: 'pool', icon: '🐟' },
];

// 3D Zone component
function Zone({ data, isHovered, isSelected, onHover, onClick }: {
  data: ZoneData;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (data: ZoneData) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Hover animation
      const targetY = isHovered || isSelected ? data.height / 2 + 0.15 : data.height / 2;
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    }
    if (glowRef.current && data.type === 'sauna') {
      // Flickering light for saunas
      glowRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 3 + data.x) * 0.2;
    }
  });

  const isPool = data.type === 'pool';
  const isSauna = data.type === 'sauna';

  return (
    <group position={[data.x, 0, data.z]}>
      {/* Main building block */}
      <RoundedBox
        ref={meshRef}
        args={[data.width, data.height, data.depth]}
        radius={0.08}
        smoothness={4}
        position={[0, data.height / 2, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => onHover(data.id)}
        onPointerOut={() => onHover(null)}
        onClick={() => onClick(data)}
      >
        <meshStandardMaterial
          color={data.color}
          emissive={data.emissive || '#000000'}
          emissiveIntensity={isHovered || isSelected ? 0.5 : 0.2}
          roughness={isPool ? 0.1 : 0.7}
          metalness={isPool ? 0.3 : 0.1}
          transparent={isPool}
          opacity={isPool ? 0.85 : 1}
        />
      </RoundedBox>

      {/* Roof/top detail for buildings */}
      {data.height > 1 && !isPool && (
        <mesh position={[0, data.height + 0.08, 0]} castShadow>
          <boxGeometry args={[data.width + 0.1, 0.15, data.depth + 0.1]} />
          <meshStandardMaterial
            color={isSauna ? '#3D2817' : '#8B7355'}
            roughness={0.9}
          />
        </mesh>
      )}

      {/* Window glow for saunas */}
      {isSauna && (
        <>
          <pointLight
            ref={glowRef}
            position={[0, data.height * 0.6, data.depth / 2 + 0.1]}
            color="#FF6B35"
            intensity={0.5}
            distance={3}
          />
          {/* Window */}
          <mesh position={[0, data.height * 0.6, data.depth / 2 + 0.01]}>
            <planeGeometry args={[data.width * 0.4, data.height * 0.3]} />
            <meshStandardMaterial
              color="#FFB347"
              emissive="#FF6B35"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        </>
      )}

      {/* Water surface effect for pools */}
      {isPool && (
        <WaterSurface
          width={data.width - 0.1}
          depth={data.depth - 0.1}
          height={data.height}
        />
      )}

      {/* Steam effect for hot zones */}
      {(data.id === 'hammam' || data.id === 'hot-bath') && (
        <Sparkles
          count={15}
          scale={[data.width, 2, data.depth]}
          position={[0, data.height + 0.5, 0]}
          size={3}
          speed={0.3}
          color="#FFFFFF"
          opacity={0.4}
        />
      )}

      {/* Selection ring */}
      {(isHovered || isSelected) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(data.width, data.depth) * 0.6, Math.max(data.width, data.depth) * 0.65, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Water surface with animation
function WaterSurface({ width, depth, height }: { width: number; depth: number; height: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, height + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth, 8, 8]} />
      <meshStandardMaterial
        color="#6BA3BE"
        emissive="#1A4A5A"
        emissiveIntensity={0.1}
        transparent
        opacity={0.7}
        roughness={0.1}
        metalness={0.5}
      />
    </mesh>
  );
}

// Tree component
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      {/* Foliage layers */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#2E7D32" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#388E3C" roughness={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

// Palm tree
function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 2, 8]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.9} />
      </mesh>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle * Math.PI / 180) * 0.3,
            2,
            Math.sin(angle * Math.PI / 180) * 0.3
          ]}
          rotation={[0.3, angle * Math.PI / 180, Math.PI / 4]}
        >
          <boxGeometry args={[0.1, 0.8, 0.02]} />
          <meshStandardMaterial color="#4CAF50" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// Sun lounger
function Lounger({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.4, 0.08, 1]} />
        <meshStandardMaterial color="#A67C52" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.35, 0.15, 0.08]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Floor/ground
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, -0.01, 0]} receiveShadow>
      <planeGeometry args={[35, 20]} />
      <meshStandardMaterial
        color="#5D4E37"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

// Scene component
function Scene({ onSelectZone }: { onSelectZone: (zone: ZoneData | null) => void }) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);

  const handleClick = (zone: ZoneData) => {
    const newSelected = selectedZone?.id === zone.id ? null : zone;
    setSelectedZone(newSelected);
    onSelectZone(newSelected);
  };

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[20, 18, 20]}
        fov={45}
      />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.2}
        target={[2, 0, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.3} color="#FFE4B5" />
      <pointLight position={[15, 8, 5]} intensity={0.4} color="#FFA07A" />

      {/* Environment */}
      <Environment preset="sunset" />
      <fog attach="fog" args={['#2C2420', 30, 60]} />

      {/* Ground */}
      <Ground />
      <ContactShadows
        position={[2, 0, 0]}
        opacity={0.4}
        scale={40}
        blur={2}
        far={20}
      />

      {/* Zones */}
      {zones.map((zone) => (
        <Zone
          key={zone.id}
          data={zone}
          isHovered={hoveredZone === zone.id}
          isSelected={selectedZone?.id === zone.id}
          onHover={setHoveredZone}
          onClick={handleClick}
        />
      ))}

      {/* Trees */}
      <Tree position={[10, 0, 3]} scale={1.8} />
      <Tree position={[9.5, 0, 1.5]} scale={1.2} />

      {/* Palm trees on terrace */}
      <PalmTree position={[-9.5, 0, 7]} />
      <PalmTree position={[-7.5, 0, 7]} />
      <PalmTree position={[-5.5, 0, 7]} />

      {/* Loungers */}
      {[-9, -8, -7, -6].map((x, i) => (
        <Lounger key={i} position={[x, 0.15, 6.5]} rotation={Math.PI / 2} />
      ))}
      {[10, 11, 12, 13].map((x, i) => (
        <Lounger key={i} position={[x, 0, 6.5]} rotation={Math.PI / 2} />
      ))}

      {/* Entrance marker */}
      <group position={[-2, 0, 5]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.5, 0.6, 0.8]} />
          <meshStandardMaterial color="#C4944E" roughness={0.5} />
        </mesh>
        <Text
          position={[0, 0.7, 0.1]}
          fontSize={0.3}
          color="#FBF9F4"
          anchorX="center"
          anchorY="middle"
        >
          ВХОД
        </Text>
      </group>
    </>
  );
}

// Legend item
function LegendItem({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#3D3530]/80 rounded-full border border-[#C4944E]/30">
      <div
        className="w-4 h-4 rounded"
        style={{ backgroundColor: color }}
      />
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-[#FBF9F4] font-medium">{label}</span>
    </div>
  );
}

// Main component
export default function IsometricMap3D() {
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#2C2420] via-[#3D3530] to-[#2C2420]">
      {/* 3D Canvas */}
      <div className="w-full h-[600px] md:h-[700px]">
        <Canvas shadows dpr={[1, 2]}>
          <Scene onSelectZone={setSelectedZone} />
        </Canvas>
      </div>

      {/* Controls hint */}
      <div className="absolute top-4 left-4 bg-[#2C2420]/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-[#FBF9F4]/70">
        🖱️ Вращение: ЛКМ | Перемещение: ПКМ | Масштаб: Колёсико
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-3">
        <LegendItem icon="🪵" label="Парные" color="#8B4513" />
        <LegendItem icon="🏊" label="Бассейны" color="#4A90A4" />
        <LegendItem icon="💆" label="SPA" color="#E8D5C4" />
        <LegendItem icon="🛎️" label="Сервисы" color="#D4B896" />
        <LegendItem icon="☕" label="Кафе" color="#D2691E" />
        <LegendItem icon="🛋️" label="Отдых" color="#DEB887" />
      </div>

      {/* Zone info popup */}
      {selectedZone && (
        <div className="absolute top-4 right-4 bg-[#2C2420]/95 backdrop-blur-sm rounded-xl p-5 border border-[#C4944E]/50 shadow-2xl max-w-xs">
          <button
            onClick={() => setSelectedZone(null)}
            className="absolute top-2 right-3 text-[#FBF9F4]/60 hover:text-[#FBF9F4] text-2xl leading-none"
          >
            ×
          </button>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{selectedZone.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-[#FBF9F4] font-['Ikra_Slab']">
                {selectedZone.name}
              </h3>
              {selectedZone.temperature && (
                <p className="text-[#C4944E] font-medium">{selectedZone.temperature}</p>
              )}
            </div>
          </div>
          <div
            className="w-full h-2 rounded-full mt-2"
            style={{ backgroundColor: selectedZone.color }}
          />
        </div>
      )}
    </div>
  );
}
