'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface MicroView3DProps {
    visualState: string;
    powerMetric?: {
        value: string;
        unit: string;
        comparison: string;
    };
}

// Isometric camera positions - maintains consistent scale relationship
// Using orthographic-like perspective for true isometric feel
const cameraConfig: Record<string, {
    position: [number, number, number];
    target: [number, number, number];
    zoom: number;
}> = {
    'chip-glow': { position: [2, 1.5, 2], target: [0, 0, 0], zoom: 200 },
    'rack-zoom': { position: [3, 2.5, 3], target: [0, 1.2, 0], zoom: 80 },
    'pod-zoom': { position: [15, 10, 15], target: [0, 2, 0], zoom: 25 },
    'building-iso': { position: [50, 35, 50], target: [0, 8, 0], zoom: 8 },
    'campus-grid': { position: [150, 100, 150], target: [0, 15, 0], zoom: 3 },
};

const scaleOrder = ['chip-glow', 'rack-zoom', 'pod-zoom', 'building-iso', 'campus-grid'];

/**
 * MicroView3D - Isometric 3D visualization with seamless zoom
 */
export default function MicroView3D({ visualState, powerMetric }: MicroView3DProps) {
    return (
        <div className="relative w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
            <Canvas
                orthographic
                camera={{
                    position: [2, 1.5, 2],
                    zoom: 200,
                    near: 0.1,
                    far: 2000
                }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <Scene visualState={visualState} />
                </Suspense>
            </Canvas>

            {/* UI Overlays */}
            <PowerIndicator visualState={visualState} powerMetric={powerMetric} />
            <ScaleIndicator visualState={visualState} />
        </div>
    );
}

/**
 * Main 3D Scene
 */
function Scene({ visualState }: { visualState: string }) {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    const currentIndex = scaleOrder.indexOf(visualState);
    const targetConfig = cameraConfig[visualState] || cameraConfig['chip-glow'];

    // Smooth isometric camera animation
    useFrame((state, delta) => {
        if (!camera) return;

        const targetPos = new THREE.Vector3(...targetConfig.position);
        const targetLook = new THREE.Vector3(...targetConfig.target);

        // Smooth interpolation
        const speed = 2;
        camera.position.lerp(targetPos, delta * speed);
        camera.lookAt(targetLook);

        // Smooth zoom for orthographic camera
        if ('zoom' in camera) {
            const orthoCamera = camera as THREE.OrthographicCamera;
            orthoCamera.zoom = THREE.MathUtils.lerp(orthoCamera.zoom, targetConfig.zoom, delta * speed);
            orthoCamera.updateProjectionMatrix();
        }

        // Subtle breathing
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.005;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 20, 10]} intensity={0.8} />
            <pointLight position={[2, 3, 2]} intensity={0.5} color="#06b6d4" />

            {/* All layers - always mounted, visibility controlled by opacity */}
            <GPUChip currentIndex={currentIndex} />
            <ServerRack currentIndex={currentIndex} />
            <ComputePod currentIndex={currentIndex} />
            <DataCenterBuilding currentIndex={currentIndex} />
            <CampusGrid currentIndex={currentIndex} />

            {/* Ground */}
            <Ground currentIndex={currentIndex} />

            <Environment preset="night" />
        </group>
    );
}

/**
 * GPU Chip - Isometric view, always at origin
 */
function GPUChip({ currentIndex }: { currentIndex: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (glowRef.current) {
            const mat = glowRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
        }
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.01;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Glow base */}
            <mesh ref={glowRef} position={[0, -0.02, 0]}>
                <boxGeometry args={[0.9, 0.02, 0.9]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
            </mesh>

            {/* Chip substrate */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.7, 0.06, 0.7]} />
                <meshStandardMaterial
                    color="#0a1628"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Silicon die */}
            <mesh position={[0, 0.04, 0]}>
                <boxGeometry args={[0.35, 0.02, 0.35]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    emissive="#f59e0b"
                    emissiveIntensity={0.5}
                    metalness={0.95}
                    roughness={0.05}
                />
            </mesh>

            {/* HBM stacks */}
            {[[-0.2, 0.05, -0.2], [0.2, 0.05, -0.2], [-0.2, 0.05, 0.2], [0.2, 0.05, 0.2]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                    <boxGeometry args={[0.08, 0.06, 0.08]} />
                    <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}

            {/* Package pins */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.4, -0.04, Math.sin(angle) * 0.4]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.03]} />
                        <meshStandardMaterial color="#fbbf24" metalness={0.95} />
                    </mesh>
                );
            })}
        </group>
    );
}

/**
 * Server Rack - Surrounds the GPU
 */
function ServerRack({ currentIndex }: { currentIndex: number }) {
    const opacity = currentIndex >= 1 ? 1 : 0;
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            const targetScale = currentIndex >= 1 ? 1 : 0;
            groupRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                delta * 3
            );
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]} scale={0}>
            {/* Rack frame */}
            <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[0.9, 2.4, 0.7]} />
                <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Server trays */}
            {[...Array(8)].map((_, i) => (
                <group key={i} position={[0, 0.15 + i * 0.28, 0.15]}>
                    <mesh>
                        <boxGeometry args={[0.75, 0.22, 0.4]} />
                        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.5} />
                    </mesh>
                    {/* GPU modules */}
                    {[...Array(6)].map((_, j) => (
                        <mesh key={j} position={[-0.25 + j * 0.1, 0, 0.1]}>
                            <boxGeometry args={[0.06, 0.16, 0.12]} />
                            <meshStandardMaterial
                                color="#1e3a5f"
                                emissive="#06b6d4"
                                emissiveIntensity={0.2}
                            />
                        </mesh>
                    ))}
                    {/* Status LED */}
                    <LEDLight position={[0.32, 0.05, 0.21]} />
                </group>
            ))}

            {/* Cooling pipes */}
            <mesh position={[-0.5, 1.2, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 2.4]} />
                <meshStandardMaterial color="#0891b2" emissive="#06b6d4" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0.5, 1.2, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 2.4]} />
                <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.1} />
            </mesh>
        </group>
    );
}

function LEDLight({ position }: { position: [number, number, number] }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ref.current) {
            const mat = ref.current.material as THREE.MeshBasicMaterial;
            mat.opacity = Math.sin(state.clock.elapsedTime * 8 + position[1] * 10) > 0 ? 1 : 0.3;
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={1} />
        </mesh>
    );
}

/**
 * Compute Pod - 4x4 rack grid
 */
function ComputePod({ currentIndex }: { currentIndex: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            const targetScale = currentIndex >= 2 ? 1 : 0;
            groupRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                delta * 2.5
            );
        }
    });

    const rackPositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (row === 1 && col === 1) continue; // Skip center for detailed rack
                positions.push([col * 1.8 - 2.7, 0, row * 1.4 - 2.1]);
            }
        }
        return positions;
    }, []);

    return (
        <group ref={groupRef} position={[0, 0, 0]} scale={0}>
            {/* Raised floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <planeGeometry args={[10, 8]} />
                <meshStandardMaterial color="#1a1a2e" />
            </mesh>

            {/* Simplified racks */}
            {rackPositions.map((pos, i) => (
                <mesh key={i} position={[pos[0], 1.2, pos[2]]}>
                    <boxGeometry args={[0.7, 2.4, 0.5]} />
                    <meshStandardMaterial
                        color="#1f2937"
                        emissive="#06b6d4"
                        emissiveIntensity={0.05}
                    />
                </mesh>
            ))}

            {/* CRAH units */}
            {[[-5, 0, 0], [5, 0, 0]].map((pos, i) => (
                <CRAHUnit key={i} position={pos as [number, number, number]} />
            ))}
        </group>
    );
}

function CRAHUnit({ position }: { position: [number, number, number] }) {
    const fanRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (fanRef.current) {
            fanRef.current.rotation.z = state.clock.elapsedTime * 6;
        }
    });

    return (
        <group position={position}>
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[1.5, 2, 1]} />
                <meshStandardMaterial color="#0891b2" metalness={0.6} />
            </mesh>
            <mesh ref={fanRef} position={[0, 1.5, 0.51]}>
                <circleGeometry args={[0.35, 6]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

/**
 * Data Center Building
 */
function DataCenterBuilding({ currentIndex }: { currentIndex: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            const targetScale = currentIndex >= 3 ? 1 : 0;
            groupRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                delta * 2
            );
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]} scale={0}>
            {/* Main building */}
            <mesh position={[0, 8, 0]}>
                <boxGeometry args={[35, 16, 22]} />
                <meshStandardMaterial color="#1e3a5f" metalness={0.4} roughness={0.6} />
            </mesh>

            {/* Foundation */}
            <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[38, 0.6, 26]} />
                <meshStandardMaterial color="#374151" />
            </mesh>

            {/* Windows */}
            {[...Array(4)].map((_, row) =>
                [...Array(10)].map((_, col) => (
                    <WindowGlow
                        key={`w-${row}-${col}`}
                        position={[-14 + col * 3.2, 2.5 + row * 3.5, 11.1]}
                    />
                ))
            )}

            {/* Rooftop HVAC */}
            {[...Array(6)].map((_, i) => (
                <mesh key={i} position={[-10 + i * 4, 16.5, -4]}>
                    <boxGeometry args={[2, 1.2, 2]} />
                    <meshStandardMaterial color="#374151" />
                </mesh>
            ))}

            {/* Substation */}
            <group position={[-25, 0, 0]}>
                <mesh position={[0, 2, 0]}>
                    <boxGeometry args={[7, 4, 5]} />
                    <meshStandardMaterial color="#374151" />
                </mesh>
                {[...Array(3)].map((_, i) => (
                    <mesh key={i} position={[-2 + i * 2, 0.8, 3]}>
                        <cylinderGeometry args={[0.5, 0.5, 1.6]} />
                        <meshStandardMaterial color="#4b5563" />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

function WindowGlow({ position }: { position: [number, number, number] }) {
    const ref = useRef<THREE.Mesh>(null);
    const offset = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        if (ref.current) {
            const mat = ref.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 1.5 + offset) * 0.15;
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <planeGeometry args={[2.2, 2.5]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
        </mesh>
    );
}

/**
 * Campus Grid - Multiple buildings
 */
function CampusGrid({ currentIndex }: { currentIndex: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            const targetScale = currentIndex >= 4 ? 1 : 0;
            groupRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                delta * 1.5
            );
        }
    });

    const buildings = [
        { pos: [-50, 0, -35] as [number, number, number], scale: 0.9 },
        { pos: [50, 0, -35] as [number, number, number], scale: 0.9 },
        { pos: [-50, 0, 35] as [number, number, number], scale: 0.85 },
        { pos: [50, 0, 35] as [number, number, number], scale: 0.85 },
        { pos: [-90, 0, 0] as [number, number, number], scale: 0.75 },
        { pos: [90, 0, 0] as [number, number, number], scale: 0.75 },
    ];

    return (
        <group ref={groupRef} position={[0, 0, 0]} scale={0}>
            {/* Additional buildings */}
            {buildings.map((b, i) => (
                <group key={i} position={b.pos} scale={b.scale}>
                    <mesh position={[0, 7, 0]}>
                        <boxGeometry args={[30, 14, 18]} />
                        <meshStandardMaterial color="#1e3a5f" metalness={0.3} />
                    </mesh>
                    {/* Windows */}
                    {[...Array(3)].map((_, row) =>
                        [...Array(7)].map((_, col) => (
                            <mesh key={`${row}-${col}`} position={[-10 + col * 3.3, 2 + row * 4, 9.1]}>
                                <planeGeometry args={[2, 3]} />
                                <meshBasicMaterial color="#06b6d4" transparent opacity={0.25} />
                            </mesh>
                        ))
                    )}
                </group>
            ))}

            {/* Central substation */}
            <group position={[-100, 0, 0]}>
                <mesh position={[0, 5, 0]}>
                    <boxGeometry args={[18, 10, 12]} />
                    <meshStandardMaterial color="#374151" />
                </mesh>
                {[...Array(4)].map((_, i) => (
                    <mesh key={i} position={[-5 + i * 3.5, 2, 8]}>
                        <cylinderGeometry args={[1, 1, 4]} />
                        <meshStandardMaterial color="#4b5563" />
                    </mesh>
                ))}
            </group>

            {/* Transmission towers */}
            {[...Array(6)].map((_, i) => (
                <TransmissionTower key={i} position={[-130 - i * 22, 0, Math.sin(i) * 15]} />
            ))}
        </group>
    );
}

function TransmissionTower({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 12, 0]}>
                <cylinderGeometry args={[0.4, 1.2, 24, 4]} />
                <meshStandardMaterial color="#6b7280" metalness={0.7} />
            </mesh>
            <mesh position={[0, 23, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 10]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>
        </group>
    );
}

/**
 * Expanding Ground
 */
function Ground({ currentIndex }: { currentIndex: number }) {
    const sizes = [3, 8, 20, 80, 300];
    const divisions = [6, 16, 40, 80, 150];

    const size = sizes[Math.min(currentIndex, sizes.length - 1)];
    const divs = divisions[Math.min(currentIndex, divisions.length - 1)];

    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[size * 2, size * 2]} />
                <meshStandardMaterial color="#050508" />
            </mesh>
            <gridHelper args={[size * 1.8, divs, '#1a1a2e', '#0f0f18']} position={[0, -0.09, 0]} />
        </group>
    );
}

/**
 * Power Indicator UI
 */
function PowerIndicator({ visualState, powerMetric }: {
    visualState: string;
    powerMetric?: { value: string; unit: string; comparison: string };
}) {
    const data: Record<string, { label: string; value: string; unit: string; comparison: string; color: string }> = {
        'chip-glow': { label: 'Single GPU', value: '2.3', unit: 'kW', comparison: '≈ 2 homes', color: '#06b6d4' },
        'rack-zoom': { label: 'Server Rack', value: '120', unit: 'kW', comparison: '≈ 100 homes', color: '#f59e0b' },
        'pod-zoom': { label: 'Compute Pod', value: '2', unit: 'MW', comparison: '≈ 1,600 homes', color: '#f59e0b' },
        'building-iso': { label: 'Facility', value: '100+', unit: 'MW', comparison: '≈ 80,000 homes', color: '#ef4444' },
        'campus-grid': { label: 'Campus', value: '500+', unit: 'MW', comparison: '≈ half nuclear plant', color: '#ef4444' },
    };

    const d = data[visualState];
    if (!d) return null;

    return (
        <motion.div
            key={visualState}
            className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-sm rounded-lg px-5 py-4 border border-gray-700 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{d.label}</div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono" style={{ color: d.color }}>
                    {powerMetric?.value || d.value}
                </span>
                <span className="text-lg font-mono text-gray-300">{powerMetric?.unit || d.unit}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">{powerMetric?.comparison || d.comparison}</div>
        </motion.div>
    );
}

/**
 * Scale Indicator UI
 */
function ScaleIndicator({ visualState }: { visualState: string }) {
    const scales: Record<string, { level: number; label: string }> = {
        'chip-glow': { level: 1, label: 'GPU' },
        'rack-zoom': { level: 2, label: 'Rack' },
        'pod-zoom': { level: 3, label: 'Pod' },
        'building-iso': { level: 4, label: 'Facility' },
        'campus-grid': { level: 5, label: 'Campus' },
    };

    const current = scales[visualState] || scales['chip-glow'];

    return (
        <motion.div
            className="absolute top-8 right-8 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-700 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Scale</div>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                    <motion.div
                        key={level}
                        className="w-2 rounded-sm"
                        style={{ height: 8 + level * 4 }}
                        animate={{
                            backgroundColor: level <= current.level ? '#06b6d4' : '#374151',
                            opacity: level <= current.level ? 1 : 0.4,
                        }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>
            <div className="text-sm text-white font-medium mt-2">{current.label}</div>
        </motion.div>
    );
}
