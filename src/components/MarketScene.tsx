import React, { Suspense, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Text, ContactShadows, Float, Box as DreiBox, Grid } from '@react-three/drei';
import * as THREE from 'three';

import { PRODUCT_CATALOG } from '../constants';

// --- Reusable Components ---

function NPC({ startPos, path }: { startPos: [number, number, number], path: [number, number, number][] }) {
  const meshRef = useRef<THREE.Group>(null);
  const [targetIdx, setTargetIdx] = useState(0);
  const speed = 0.02;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const target = path[targetIdx];
    const current = meshRef.current.position;
    
    const dx = target[0] - current.x;
    const dz = target[2] - current.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.1) {
      setTargetIdx((targetIdx + 1) % path.length);
    } else {
      meshRef.current.position.x += (dx / dist) * speed;
      meshRef.current.position.z += (dz / dist) * speed;
      meshRef.current.rotation.y = Math.atan2(dx, dz);
    }
  });

  return (
    <group ref={meshRef} position={startPos}>
      {/* Simple Humanoid Shape */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
      {/* Shopping Basket */}
      <mesh position={[0.3, 0.7, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.4]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
}

function ProductItem({ position, color, name, onClick }: { position: [number, number, number], color: string, name: string, onClick?: () => void }) {
  const [hovered, setHover] = useState(false);
  
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <mesh 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        castShadow
      >
        <boxGeometry args={[0.3, 0.5, 0.3]} />
        <meshStandardMaterial color={hovered ? '#ffcc00' : color} roughness={0.3} metalness={0.2} />
      </mesh>
      {hovered && (
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {name}
        </Text>
      )}
    </group>
  );
}

function ShelfUnit({ position, rotation = [0, 0, 0], category, products, onProductClick }: { position: [number, number, number], rotation?: [number, number, number], category: string, products: any[], onProductClick: (p: any) => void }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Shelf Structure */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.5, 0.8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Shelf Levels */}
      {[0.4, 1.0, 1.6, 2.2].map((y) => (
        <mesh key={y} position={[0, y, 0.41]} receiveShadow>
          <boxGeometry args={[3.8, 0.05, 0.2]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}

      {/* Signage */}
      <group position={[0, 2.8, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.5, 0.1]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {category}
        </Text>
      </group>

      {/* Products on Shelves */}
      {products.map((p, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        return (
          <ProductItem 
            key={p.id} 
            position={[(col - 1.5) * 0.8, 0.4 + row * 0.6, 0.45]} 
            color={p.color} 
            name={p.name}
            onClick={() => onProductClick(p)}
          />
        );
      })}
    </group>
  );
}

function ProduceBench({ position, category, products, onProductClick }: { position: [number, number, number], category: string, products: any[], onProductClick: (p: any) => void }) {
  return (
    <group position={position}>
      {/* Bench Structure */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.8, 2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      
      {/* Signage */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.25}
        color="#166534"
      >
        {category}
      </Text>

      {/* Products (Fruits/Veggies) */}
      {products.map((p, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <group key={p.id} position={[(col - 1) * 0.8, 0.85, (row - 0.5) * 0.8]} onClick={() => onProductClick(p)}>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={p.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function BakeryCounter({ position, products, onProductClick }: { position: [number, number, number], products: any[], onProductClick: (p: any) => void }) {
  return (
    <group position={position}>
      {/* Counter Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 1.2]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      {/* Glass Top */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[3.8, 0.4, 1]} />
        <meshStandardMaterial color="#add8e6" transparent opacity={0.4} />
      </mesh>
      
      <Text position={[0, 1.6, 0]} fontSize={0.3} color="#5d4037" fontWeight="bold">PADARIA</Text>

      {products.map((p, i) => (
        <ProductItem 
          key={p.id} 
          position={[(i - 1) * 1.2, 1.1, 0]} 
          color={p.color} 
          name={p.name}
          onClick={() => onProductClick(p)}
        />
      ))}
    </group>
  );
}

function StoreWalls() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Tile Grid to simulate floor tiles */}
      <Grid 
        position={[0, -0.005, 0]}
        infiniteGrid 
        fadeDistance={50} 
        fadeStrength={5} 
        cellSize={1} 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor="#94a3b8" 
        cellColor="#cbd5e1"
      />

      {/* Back Wall */}
      <mesh position={[0, 5, -15]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-20, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>
      {/* Right Wall */}
      <mesh position={[20, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>
      
      {/* Main Welcome Sign */}
      <Text rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 8]} fontSize={0.8} color="#64748b" fontWeight="bold">
        BEM-VINDO AO SUPERMERCADO 3D
      </Text>

      {/* Section Floor Signage */}
      <Text rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -11]} fontSize={0.4} color="#475569" fontWeight="bold">
        PADARIA
      </Text>
      <Text rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -5]} fontSize={0.4} color="#475569" fontWeight="bold">
        BEBIDAS
      </Text>
      <Text rotation={[-Math.PI / 2, 0, 0]} position={[8, 0.01, -5]} fontSize={0.4} color="#475569" fontWeight="bold">
        HORTIFRUTI
      </Text>
      <Text rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.01, -5]} fontSize={0.4} color="#475569" fontWeight="bold">
        MERCEARIA
      </Text>
      <Text rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.01, 1]} fontSize={0.4} color="#475569" fontWeight="bold">
        LIMPEZA
      </Text>
    </group>
  );
}

// --- Main Scene ---

export default function MarketScene({ onProductSelect }: { onProductSelect: (p: any) => void }) {
  const npcPaths = useMemo(() => [
    [[5, 0, 5], [5, 0, -5], [-5, 0, -5], [-5, 0, 5]],
    [[-8, 0, 0], [-8, 0, -10], [8, 0, -10], [8, 0, 0]],
    [[0, 0, 8], [0, 0, -12], [2, 0, -12], [2, 0, 8]]
  ] as [number, number, number][][], []);

  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={50} />
        <OrbitControls 
          enableDamping 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={3} 
          maxDistance={25}
          target={[0, 0, -5]}
        />
        
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <StoreWalls />
          
          {/* NPCs */}
          {npcPaths.map((path, i) => (
            <NPC key={`npc-${i}`} startPos={path[0]} path={path} />
          ))}
          
          {/* Layout dos Corredores */}
          
          {/* Corredor 1: Mercearia e Limpeza (Esquerda) */}
          <ShelfUnit position={[-8, 0, -8]} category="Mercearia" products={PRODUCT_CATALOG.mercearia} onProductClick={onProductSelect} />
          <ShelfUnit position={[-8, 0, -2]} category="Limpeza" products={PRODUCT_CATALOG.limpeza} onProductClick={onProductSelect} />
          
          {/* Corredor 2: Bebidas (Centro) */}
          <ShelfUnit position={[0, 0, -8]} category="Bebidas" products={PRODUCT_CATALOG.bebidas} onProductClick={onProductSelect} />
          
          {/* Corredor 3: Hortifruti (Direita) */}
          <ProduceBench position={[8, 0, -8]} category="Hortifruti" products={PRODUCT_CATALOG.hortifruti} onProductClick={onProductSelect} />
          
          {/* Fundo: Padaria */}
          <BakeryCounter position={[0, 0, -13]} products={PRODUCT_CATALOG.padaria} onProductClick={onProductSelect} />
          
          <Environment preset="apartment" />
          <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={40} blur={2} far={10} />
        </Suspense>
      </Canvas>
    </div>
  );
}

