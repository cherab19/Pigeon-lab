import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Reusable 3D lab room with table, walls, and ambient lighting */
export function LabRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#e8e0d4" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -4]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#f0ece4" />
      </mesh>

      {/* Lab table */}
      <group position={[0, -0.5, 0]}>
        {/* Table top */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.08, 2]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
        </mesh>
        {/* Legs */}
        {[[-1.8, -0.5, -0.8], [1.8, -0.5, -0.8], [-1.8, -0.5, 0.8], [1.8, -0.5, 0.8]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[0.06, 1, 0.06]} />
            <meshStandardMaterial color="#4a3a2a" />
          </mesh>
        ))}
      </group>

      {/* Grid lines on table */}
      <gridHelper args={[4, 20, "#8a8070", "#8a8070"]} position={[0, -0.45, 0]} />
    </group>
  );
}

/** Clamp stand - reusable */
export function ClampStand({ position = [0, 0, 0] as [number, number, number], height = 2 }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, -0.45, 0]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.25]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rod */}
      <mesh position={[0, height / 2 - 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, height, 12]} />
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Clamp */}
      <mesh position={[0, height - 0.5, 0]} castShadow>
        <boxGeometry args={[0.12, 0.04, 0.06]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Beaker 3D */
export function Beaker3D({
  position = [0, 0, 0] as [number, number, number],
  liquidColor = "#4488ff",
  liquidLevel = 0.6,
  scale = 1,
}) {
  return (
    <group position={position} scale={scale}>
      {/* Glass body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.5, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#cceeff"
          transparent
          opacity={0.25}
          roughness={0.05}
          transmission={0.8}
          thickness={0.5}
        />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.25, 0]}>
        <circleGeometry args={[0.18, 32]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Liquid */}
      <mesh position={[0, -0.25 + liquidLevel * 0.25, 0]}>
        <cylinderGeometry args={[0.19, 0.17, liquidLevel * 0.5, 32]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

/** Protractor / measurement arc */
export function MeasurementArc({ angle, radius = 1, color = "#ff6644" }: { angle: number; radius?: number; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const points: THREE.Vector3[] = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * angle * (Math.PI / 180);
    points.push(new THREE.Vector3(Math.sin(a) * radius, -Math.cos(a) * radius, 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group ref={ref}>
      <line>
        <bufferGeometry attach="geometry" {...geometry} />
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </line>
    </group>
  );
}
