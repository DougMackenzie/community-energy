'use client';

import { useRef, useMemo, Suspense, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
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

// Camera configurations for cinematic Z-axis dolly zoom
// GPU stays dead center - camera pulls straight back along diagonal
// Isometric angle maintained: position on 45° diagonal from origin
const cameraConfig: Record<string, {
    position: [number, number, number];
    target: [number, number, number];
    zoom: number;
}> = {
    // Pure Z-axis dolly: camera moves along [1, 0.6, 1] normalized direction
    // Target stays at GPU height (0.08) for chip, then rises smoothly
    'chip-glow': { position: [0.8, 0.5, 0.8], target: [0, 0.08, 0], zoom: 550 },
    'rack-zoom': { position: [3, 1.8, 3], target: [0, 0.08, 0], zoom: 100 },
    'pod-zoom': { position: [18, 10.8, 18], target: [0, 0.08, 0], zoom: 28 },
    'building-iso': { position: [80, 48, 80], target: [0, 0.08, 0], zoom: 5 },
    'campus-grid': { position: [400, 240, 400], target: [0, 0.08, 0], zoom: 0.9 },
};

const scaleOrder = ['chip-glow', 'rack-zoom', 'pod-zoom', 'building-iso', 'campus-grid'];

/**
 * MicroView3D - Continuous seamless 3D zoom from GPU to campus
 * Based on NVIDIA Rubin/Vera Rubin NVL72 specifications
 * All elements exist in one unified 3D space at their real relative scales
 */
export default function MicroView3D({ visualState, powerMetric }: MicroView3DProps) {
    return (
        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            <Canvas
                orthographic
                camera={{
                    position: [0.8, 0.5, 0.8],
                    zoom: 550,
                    near: 0.001,
                    far: 5000
                }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <ContinuousScene visualState={visualState} />
                </Suspense>
            </Canvas>

            {/* UI Overlays */}
            <PowerIndicator visualState={visualState} powerMetric={powerMetric} />
            <ScaleIndicator visualState={visualState} />
        </div>
    );
}

/**
 * Continuous 3D Scene - All elements at real relative scales
 * Progressive visibility based on zoom level
 */
function ContinuousScene({ visualState }: { visualState: string }) {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const initializedRef = useRef(false);

    // Get current config and scale index for visibility
    const config = cameraConfig[visualState] || cameraConfig['chip-glow'];
    const currentIndex = scaleOrder.indexOf(visualState);

    // Visibility flags - progressive reveal as we zoom out
    const showGPU = true; // Always visible at center
    const showRack = currentIndex >= 1;
    const showPod = currentIndex >= 2;
    const showBuilding = currentIndex >= 3;
    const showCampus = currentIndex >= 4;

    // Refs for smooth interpolation
    const targetPosRef = useRef(new THREE.Vector3(...config.position));
    const targetLookRef = useRef(new THREE.Vector3(...config.target));
    const targetZoomRef = useRef(config.zoom);

    // Force camera to correct position on mount
    useLayoutEffect(() => {
        if (camera && !initializedRef.current) {
            const initConfig = cameraConfig['chip-glow'];
            camera.position.set(initConfig.position[0], initConfig.position[1], initConfig.position[2]);

            if ('zoom' in camera) {
                const orthoCamera = camera as THREE.OrthographicCamera;
                orthoCamera.zoom = initConfig.zoom;
                orthoCamera.updateProjectionMatrix();
            }

            camera.lookAt(new THREE.Vector3(initConfig.target[0], initConfig.target[1], initConfig.target[2]));
            targetPosRef.current.set(...initConfig.position);
            targetLookRef.current.set(...initConfig.target);
            targetZoomRef.current = initConfig.zoom;

            initializedRef.current = true;
        }
    }, [camera]);

    // Update targets when visualState changes
    useEffect(() => {
        if (initializedRef.current) {
            targetPosRef.current.set(...config.position);
            targetLookRef.current.set(...config.target);
            targetZoomRef.current = config.zoom;
        }
    }, [visualState, config]);

    // Fast continuous camera animation - single focal point zoom
    useFrame((state, delta) => {
        if (!camera) return;

        // Faster interpolation for snappy transitions
        const positionSpeed = 2.5;
        const zoomSpeed = 2.0;

        camera.position.lerp(targetPosRef.current, delta * positionSpeed);

        if ('zoom' in camera) {
            const orthoCamera = camera as THREE.OrthographicCamera;
            orthoCamera.zoom = THREE.MathUtils.lerp(
                orthoCamera.zoom,
                targetZoomRef.current,
                delta * zoomSpeed
            );
            orthoCamera.updateProjectionMatrix();
        }

        camera.lookAt(targetLookRef.current);

        // Subtle scene breathing
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.002;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Lighting - consistent across all scales */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[50, 100, 50]} intensity={0.9} />
            <pointLight position={[0, 5, 0]} intensity={0.4} color="#38bdf8" />

            {/* GPU Chip - always visible at origin */}
            <RubinGPU />

            {/* Server Rack - visible from rack-zoom onwards */}
            {showRack && <FadeInGroup delay={0}><VeraRubinRack /></FadeInGroup>}

            {/* Compute Pod - visible from pod-zoom onwards */}
            {showPod && <FadeInGroup delay={0.1}><ComputePod /></FadeInGroup>}

            {/* Data Center Building - visible from building-iso onwards */}
            {showBuilding && <FadeInGroup delay={0.2}><DataCenterBuilding /></FadeInGroup>}

            {/* Campus - visible at campus-grid */}
            {showCampus && <FadeInGroup delay={0.3}><CampusLayout /></FadeInGroup>}

            {/* Ground plane that extends to cover all scales */}
            <InfiniteGround currentIndex={currentIndex} />

            <Environment preset="night" />
        </group>
    );
}

/**
 * FadeInGroup - Smoothly fades in child components
 */
function FadeInGroup({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const opacityRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);

    useFrame((state) => {
        if (!groupRef.current) return;

        if (startTimeRef.current === null) {
            startTimeRef.current = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - startTimeRef.current - delay;
        if (elapsed > 0) {
            opacityRef.current = Math.min(1, opacityRef.current + 0.02);
        }

        // Apply opacity to all mesh children
        groupRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                const mat = child.material as THREE.MeshStandardMaterial;
                if (mat.opacity !== undefined) {
                    mat.transparent = true;
                    mat.opacity = opacityRef.current * (mat.userData.baseOpacity || 1);
                }
            }
        });
    });

    return <group ref={groupRef}>{children}</group>;
}

/**
 * NVIDIA Rubin GPU - Detailed isometric view
 * Power: ~2,300W (2.3 kW)
 */
function RubinGPU() {
    const glowRef = useRef<THREE.Mesh>(null);
    const chipRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (glowRef.current) {
            const mat = glowRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2.5) * 0.25;
        }
        if (chipRef.current) {
            chipRef.current.position.y = 0.08 + Math.sin(state.clock.elapsedTime * 1.5) * 0.005;
        }
    });

    return (
        <group ref={chipRef} position={[0, 0.08, 0]}>
            {/* Glow base effect */}
            <mesh ref={glowRef} position={[0, -0.02, 0]}>
                <boxGeometry args={[1.2, 0.02, 1.2]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
            </mesh>

            {/* Package substrate - 1.0 × 1.0 units */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.0, 0.06, 1.0]} />
                <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Interposer - 0.8 × 0.8 units, dark PCB green */}
            <mesh position={[0, 0.04, 0]}>
                <boxGeometry args={[0.8, 0.025, 0.8]} />
                <meshStandardMaterial color="#0a1628" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Main GPU die - 0.4 × 0.4 units, amber with glow */}
            <mesh position={[0, 0.065, 0]}>
                <boxGeometry args={[0.4, 0.025, 0.4]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    emissive="#f59e0b"
                    emissiveIntensity={0.8}
                    metalness={0.95}
                    roughness={0.05}
                />
            </mesh>

            {/* Heat spreader frame - metallic silver border */}
            <mesh position={[0, 0.08, 0]}>
                <boxGeometry args={[0.5, 0.015, 0.5]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Heat spreader cutout (darker center) */}
            <mesh position={[0, 0.085, 0]}>
                <boxGeometry args={[0.38, 0.01, 0.38]} />
                <meshStandardMaterial
                    color="#0f172a"
                    emissive="#fbbf24"
                    emissiveIntensity={0.4}
                />
            </mesh>

            {/* HBM4 stacks - 6 stacks arranged around die */}
            {[
                [-0.28, 0.055, -0.15], [0.28, 0.055, -0.15],
                [-0.28, 0.055, 0.15], [0.28, 0.055, 0.15],
                [-0.28, 0.055, 0], [0.28, 0.055, 0]
            ].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                    <boxGeometry args={[0.08, 0.06, 0.08]} />
                    <meshStandardMaterial
                        color="#1e293b"
                        metalness={0.7}
                        roughness={0.3}
                    />
                </mesh>
            ))}

            {/* BGA pins array underneath */}
            {[...Array(64)].map((_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                return (
                    <mesh key={i} position={[
                        -0.35 + col * 0.1,
                        -0.04,
                        -0.35 + row * 0.1
                    ]}>
                        <sphereGeometry args={[0.012, 8, 8]} />
                        <meshStandardMaterial color="#fbbf24" metalness={0.95} />
                    </mesh>
                );
            })}

            {/* Circuit traces on interposer */}
            {[...Array(12)].map((_, i) => (
                <mesh key={`trace-${i}`} position={[
                    -0.35 + (i % 4) * 0.23,
                    0.053,
                    -0.3 + Math.floor(i / 4) * 0.3
                ]}>
                    <boxGeometry args={[0.15, 0.002, 0.003]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.8} emissive="#f59e0b" emissiveIntensity={0.2} />
                </mesh>
            ))}
        </group>
    );
}

/**
 * Rubin Ultra Kyber Rack - X-Ray Material with MeshPhysicalMaterial
 * Uses transmission for glassy/phantom effect that materializes as camera pulls back
 * 576 GPU dies in vertical blade orientation (4 pods × 18 blades × 8 GPUs)
 */
function VeraRubinRack() {
    const rackRef = useRef<THREE.Group>(null);
    const materialRefs = useRef<THREE.MeshPhysicalMaterial[]>([]);

    // Animate opacity based on camera distance - starts glassy, becomes solid
    useFrame(({ camera }) => {
        if (!rackRef.current) return;

        // Calculate distance from camera to rack center
        const rackCenter = new THREE.Vector3(0, 1.0, 0);
        const distance = camera.position.distanceTo(rackCenter);

        // Transition from glassy (close) to solid (far)
        // At zoom 550 (chip view), distance ~1.3, transmission = 0.95 (very glassy)
        // At zoom 100 (rack view), distance ~4.2, transmission = 0.3 (more solid)
        // At zoom < 50, transmission = 0 (fully solid)
        const normalizedDist = Math.min(1, Math.max(0, (distance - 2) / 10));
        const transmission = Math.max(0, 0.95 - normalizedDist * 1.2);

        materialRefs.current.forEach((mat) => {
            if (mat) {
                mat.transmission = transmission;
                mat.opacity = 1 - transmission * 0.5;
            }
        });
    });

    // Helper to add material ref
    const addMaterialRef = (mat: THREE.MeshPhysicalMaterial | null) => {
        if (mat && !materialRefs.current.includes(mat)) {
            materialRefs.current.push(mat);
        }
    };

    return (
        <group ref={rackRef} position={[0, 0, 0]}>
            {/* X-Ray Rack frame - MeshPhysicalMaterial with transmission */}
            <mesh position={[0, 1.0, 0]}>
                <boxGeometry args={[0.65, 2.0, 1.1]} />
                <meshPhysicalMaterial
                    ref={addMaterialRef}
                    color="#1e3a5f"
                    metalness={0.1}
                    roughness={0}
                    transmission={0.95}
                    thickness={2}
                    transparent
                    opacity={0.6}
                    ior={1.5}
                    envMapIntensity={0.5}
                />
            </mesh>

            {/* Rack frame edges - wireframe for X-ray effect */}
            <lineSegments position={[0, 1.0, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(0.65, 2.0, 1.1)]} />
                <lineBasicMaterial color="#38bdf8" transparent opacity={0.8} />
            </lineSegments>

            {/* Vertical blade pods - Kyber has 4 pods arranged vertically */}
            {[0, 1, 2, 3].map((pod) => (
                <group key={pod} position={[0, 0.25 + pod * 0.45, 0]}>
                    {/* Pod container - X-ray material */}
                    <mesh>
                        <boxGeometry args={[0.58, 0.4, 0.95]} />
                        <meshPhysicalMaterial
                            ref={addMaterialRef}
                            color="#0c2d4a"
                            metalness={0.05}
                            roughness={0.1}
                            transmission={0.9}
                            thickness={1.5}
                            transparent
                            opacity={0.5}
                        />
                    </mesh>

                    {/* 18 vertical blades per pod */}
                    {[...Array(18)].map((_, blade) => (
                        <group key={blade} position={[-0.26 + blade * 0.03, 0, 0]}>
                            {/* Vertical blade - slightly visible through X-ray */}
                            <mesh>
                                <boxGeometry args={[0.022, 0.35, 0.85]} />
                                <meshPhysicalMaterial
                                    ref={addMaterialRef}
                                    color="#1e3a5f"
                                    metalness={0.3}
                                    roughness={0.2}
                                    transmission={0.7}
                                    thickness={0.5}
                                    transparent
                                    opacity={0.6}
                                />
                            </mesh>
                            {/* GPU dies on blade - these stay SOLID (not X-ray) */}
                            {[...Array(8)].map((_, gpu) => (
                                <mesh key={gpu} position={[0.012, -0.14 + gpu * 0.04, -0.3 + blade * 0.02]}>
                                    <boxGeometry args={[0.005, 0.03, 0.03]} />
                                    <meshStandardMaterial
                                        color="#1a1a2e"
                                        emissive={gpu === 0 && blade === 9 && pod === 0 ? "#f59e0b" : "#38bdf8"}
                                        emissiveIntensity={gpu === 0 && blade === 9 && pod === 0 ? 1.5 : 0.2}
                                    />
                                </mesh>
                            ))}
                        </group>
                    ))}

                    {/* Pod status LED */}
                    <LEDIndicator position={[0.28, 0.15, 0.48]} />
                </group>
            ))}

            {/* Liquid immersion tank walls - ethereal blue glow */}
            <mesh position={[0, 1.0, 0]}>
                <boxGeometry args={[0.62, 1.9, 1.05]} />
                <meshPhysicalMaterial
                    color="#0891b2"
                    transmission={0.85}
                    thickness={0.5}
                    roughness={0}
                    transparent
                    opacity={0.15}
                    emissive="#0891b2"
                    emissiveIntensity={0.05}
                />
            </mesh>

            {/* Liquid cooling inlet (bottom) and outlet (top) - solid */}
            <mesh position={[-0.38, 0.1, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                <meshStandardMaterial color="#0891b2" emissive="#38bdf8" emissiveIntensity={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[0.38, 1.9, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.2} metalness={0.7} />
            </mesh>

            {/* Power sidecar - X-ray material */}
            <mesh position={[0.45, 0.6, 0]}>
                <boxGeometry args={[0.2, 1.2, 0.8]} />
                <meshPhysicalMaterial
                    ref={addMaterialRef}
                    color="#1f2937"
                    metalness={0.3}
                    roughness={0.2}
                    transmission={0.6}
                    thickness={1}
                    transparent
                    opacity={0.7}
                />
            </mesh>

            {/* Front panel display - "600 kW" - solid */}
            <mesh position={[0, 1.85, 0.56]}>
                <boxGeometry args={[0.35, 0.12, 0.01]} />
                <meshBasicMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, 1.85, 0.565]}>
                <boxGeometry args={[0.3, 0.08, 0.005]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} />
            </mesh>

            {/* "576 GPUs" label */}
            <mesh position={[0, 1.7, 0.56]}>
                <boxGeometry args={[0.2, 0.04, 0.005]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

function LEDIndicator({ position }: { position: [number, number, number] }) {
    const ref = useRef<THREE.Mesh>(null);
    const offset = useMemo(() => Math.random() * 10, []);

    useFrame((state) => {
        if (ref.current) {
            const mat = ref.current.material as THREE.MeshBasicMaterial;
            mat.opacity = Math.sin(state.clock.elapsedTime * 4 + offset) > 0 ? 1 : 0.4;
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
 * Compute Pod - Row of 8 racks
 * Power: 8 × 130kW = ~1 MW (standard) or 8 × 600kW = ~5 MW (Kyber)
 */
function ComputePod() {
    // 8 racks in a row, 1.8m spacing
    const rackPositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let i = 0; i < 8; i++) {
            // Skip center position where main detailed rack is (positions 3 and 4)
            if (i === 3 || i === 4) continue;
            positions.push([(i - 3.5) * 1.8, 0, 0]);
        }
        return positions;
    }, []);

    return (
        <group position={[0, 0, 0]}>
            {/* Raised floor - 0.6m × 0.6m tiles */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <planeGeometry args={[18, 8]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Floor tile grid pattern */}
            <gridHelper args={[18, 30, '#334155', '#1e293b']} position={[0, -0.01, 0]} />

            {/* Simplified racks in the row */}
            {rackPositions.map((pos, i) => (
                <SimplifiedRack key={i} position={pos} />
            ))}

            {/* Overhead liquid cooling distribution */}
            <mesh position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 16]} />
                <meshStandardMaterial color="#0891b2" metalness={0.5} />
            </mesh>

            {/* Overhead cable trays */}
            <mesh position={[0, 2.6, 1.5]}>
                <boxGeometry args={[16, 0.1, 0.6]} />
                <meshStandardMaterial color="#475569" metalness={0.4} />
            </mesh>
            <mesh position={[0, 2.6, -1.5]}>
                <boxGeometry args={[16, 0.1, 0.6]} />
                <meshStandardMaterial color="#475569" metalness={0.4} />
            </mesh>

            {/* Power distribution units between racks */}
            {[-5.4, -1.8, 1.8, 5.4].map((x, i) => (
                <mesh key={i} position={[x, 0.5, -2]}>
                    <boxGeometry args={[0.4, 1.0, 0.3]} />
                    <meshStandardMaterial color="#374151" />
                </mesh>
            ))}

            {/* CRAH units at ends */}
            <CRAHUnit position={[-10, 0, 0]} />
            <CRAHUnit position={[10, 0, 0]} />
        </group>
    );
}

function SimplifiedRack({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 1.0, 0]}>
                <boxGeometry args={[0.6, 2.0, 1.0]} />
                <meshStandardMaterial
                    color="#334155"
                    emissive="#38bdf8"
                    emissiveIntensity={0.03}
                    metalness={0.4}
                />
            </mesh>
            <lineSegments position={[0, 1.0, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(0.6, 2.0, 1.0)]} />
                <lineBasicMaterial color="#475569" transparent opacity={0.5} />
            </lineSegments>
        </group>
    );
}

function CRAHUnit({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[1.8, 2.4, 1.2]} />
                <meshStandardMaterial color="#0891b2" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* Cooling coils visible */}
            <mesh position={[0, 1.2, 0.65]}>
                <boxGeometry args={[1.4, 1.8, 0.1]} />
                <meshStandardMaterial color="#475569" />
            </mesh>
        </group>
    );
}

/**
 * Data Center Building - Single Data Hall
 * Dimensions: 30m W × 60m L × 12m H (to scale)
 * Power: 100+ MW (120 racks × 130kW = ~15 MW per hall, multiple halls)
 */
function DataCenterBuilding() {
    return (
        <group position={[0, 0, 0]}>
            {/* Main building shell - 30m × 60m × 12m */}
            <mesh position={[0, 6, 0]}>
                <boxGeometry args={[30, 12, 60]} />
                <meshStandardMaterial
                    color="#64748b"
                    metalness={0.3}
                    roughness={0.5}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Building edge highlights for definition */}
            <lineSegments position={[0, 6, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(30, 12, 60)]} />
                <lineBasicMaterial color="#94a3b8" transparent opacity={0.6} />
            </lineSegments>

            {/* Foundation */}
            <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[34, 0.6, 64]} />
                <meshStandardMaterial color="#374151" />
            </mesh>

            {/* Metal panel cladding lines */}
            {[...Array(8)].map((_, i) => (
                <mesh key={`panel-${i}`} position={[15.05, 1.5 + i * 1.4, 0]}>
                    <boxGeometry args={[0.05, 0.05, 58]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.7} />
                </mesh>
            ))}

            {/* Large louvers for air intake */}
            {[...Array(6)].map((_, i) => (
                <group key={`louver-${i}`}>
                    <mesh position={[15.1, 3 + i * 1.5, -20 + i * 8]}>
                        <boxGeometry args={[0.15, 1.2, 4]} />
                        <meshStandardMaterial color="#475569" />
                    </mesh>
                    {/* Louver slats */}
                    {[...Array(4)].map((_, j) => (
                        <mesh key={j} position={[15.15, 2.7 + i * 1.5 + j * 0.3, -20 + i * 8]}>
                            <boxGeometry args={[0.05, 0.02, 3.8]} />
                            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.1} />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* Rooftop equipment - HVAC/cooling units */}
            {[...Array(8)].map((_, i) => (
                <mesh key={i} position={[-10 + i * 3, 12.5, -15 + Math.floor(i / 4) * 30]}>
                    <boxGeometry args={[2.2, 1.5, 2.2]} />
                    <meshStandardMaterial color="#475569" metalness={0.4} />
                </mesh>
            ))}

            {/* Loading dock */}
            <mesh position={[0, 1, 30.5]}>
                <boxGeometry args={[12, 2, 3]} />
                <meshStandardMaterial color="#374151" />
            </mesh>

            {/* Secondary substation adjacent to building */}
            <SecondarySubstation position={[-22, 0, 0]} />
        </group>
    );
}

function SecondarySubstation({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Pad */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[20, 15]} />
                <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Transformer */}
            <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[5, 5, 4]} />
                <meshStandardMaterial color="#374151" metalness={0.5} />
            </mesh>

            {/* Bushings */}
            {[-1.5, 0, 1.5].map((x, i) => (
                <mesh key={i} position={[x, 5.5, 0]}>
                    <cylinderGeometry args={[0.25, 0.35, 2]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
            ))}

            {/* Switchgear cabinet */}
            <mesh position={[7, 2, 0]}>
                <boxGeometry args={[3, 4, 3]} />
                <meshStandardMaterial color="#4b5563" />
            </mesh>
        </group>
    );
}

/**
 * Campus Layout - 300MW Hyperscale Campus
 * Procedural geometry with:
 * - The Hall: Long rectangular structure (300m x 100m scale)
 * - The Cooling: Row of 20 cylindrical cooling towers along roof spine
 * - The Power: Perimeter line of diesel generator blocks (white containers)
 * - The Substation: Grid of grey transformer boxes in foreground
 */
function CampusLayout() {
    return (
        <group position={[0, 0, 0]}>
            {/* THE HALL - Main data center building (300m x 100m x 20m) */}
            <HyperscaleHall position={[0, 0, 0]} />

            {/* THE COOLING - 20 cylindrical cooling towers along roof spine */}
            <CoolingTowerArray position={[0, 20, 0]} />

            {/* THE POWER - Perimeter diesel generators (white containers) */}
            <DieselGeneratorPerimeter />

            {/* THE SUBSTATION - Grid of transformer boxes in foreground */}
            <TransformerGrid position={[0, 0, 120]} />

            {/* Transmission line towers corridor leading away */}
            {[...Array(8)].map((_, i) => (
                <TransmissionTower key={i} position={[-200 - i * 40, 0, 0]} />
            ))}

            {/* Main access road around campus */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[400, 10]} />
                <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 80]}>
                <planeGeometry args={[400, 10]} />
                <meshStandardMaterial color="#374151" />
            </mesh>

            {/* Perimeter security fence */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <ringGeometry args={[200, 203, 4]} />
                <meshStandardMaterial color="#475569" transparent opacity={0.3} />
            </mesh>
        </group>
    );
}

/**
 * The Hall - Main hyperscale data center building
 * 300m x 100m x 20m with industrial metal cladding
 */
function HyperscaleHall({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Main structure - 300m x 100m x 20m */}
            <mesh position={[0, 10, 0]}>
                <boxGeometry args={[300, 20, 100]} />
                <meshStandardMaterial
                    color="#475569"
                    metalness={0.4}
                    roughness={0.6}
                />
            </mesh>

            {/* Building edge wireframe for definition */}
            <lineSegments position={[0, 10, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(300, 20, 100)]} />
                <lineBasicMaterial color="#64748b" transparent opacity={0.5} />
            </lineSegments>

            {/* Horizontal cladding lines */}
            {[...Array(5)].map((_, i) => (
                <mesh key={`clad-${i}`} position={[0, 3 + i * 4, 50.1]}>
                    <boxGeometry args={[298, 0.2, 0.1]} />
                    <meshStandardMaterial color="#64748b" metalness={0.6} />
                </mesh>
            ))}

            {/* Large intake louvers on long sides */}
            {[...Array(10)].map((_, i) => (
                <group key={`louver-${i}`}>
                    {/* Front side */}
                    <mesh position={[-120 + i * 28, 8, 50.2]}>
                        <boxGeometry args={[20, 12, 0.3]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                    {/* Louver slats */}
                    {[...Array(8)].map((_, j) => (
                        <mesh key={j} position={[-120 + i * 28, 3.5 + j * 1.4, 50.25]}>
                            <boxGeometry args={[19, 0.1, 0.1]} />
                            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.1} />
                        </mesh>
                    ))}
                    {/* Back side mirror */}
                    <mesh position={[-120 + i * 28, 8, -50.2]}>
                        <boxGeometry args={[20, 12, 0.3]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                </group>
            ))}

            {/* Loading docks on ends */}
            <mesh position={[152, 2, 0]}>
                <boxGeometry args={[8, 4, 40]} />
                <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[-152, 2, 0]}>
                <boxGeometry args={[8, 4, 40]} />
                <meshStandardMaterial color="#374151" />
            </mesh>

            {/* Foundation */}
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[310, 1, 110]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>
        </group>
    );
}

/**
 * Cooling Tower Array - 20 cylindrical towers along roof spine
 */
function CoolingTowerArray({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {[...Array(20)].map((_, i) => (
                <group key={i} position={[-133 + i * 14, 0, 0]}>
                    {/* Cylindrical cooling tower */}
                    <mesh position={[0, 6, 0]}>
                        <cylinderGeometry args={[5, 6, 12, 16]} />
                        <meshStandardMaterial color="#6b7280" metalness={0.3} roughness={0.7} />
                    </mesh>

                    {/* Fan shroud on top */}
                    <mesh position={[0, 12.5, 0]}>
                        <cylinderGeometry args={[4, 4.5, 1.5, 16]} />
                        <meshStandardMaterial color="#4b5563" metalness={0.5} />
                    </mesh>

                    {/* Fan blades (simplified) */}
                    <mesh position={[0, 13, 0]} rotation={[0, i * 0.5, 0]}>
                        <boxGeometry args={[7, 0.2, 0.8]} />
                        <meshStandardMaterial color="#374151" />
                    </mesh>
                    <mesh position={[0, 13, 0]} rotation={[0, i * 0.5 + Math.PI / 2, 0]}>
                        <boxGeometry args={[7, 0.2, 0.8]} />
                        <meshStandardMaterial color="#374151" />
                    </mesh>

                    {/* Steam/vapor effect - white glow */}
                    <mesh position={[0, 14, 0]}>
                        <sphereGeometry args={[2, 8, 8]} />
                        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.15} />
                    </mesh>

                    {/* Base mounting */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[12, 0.5, 12]} />
                        <meshStandardMaterial color="#475569" />
                    </mesh>
                </group>
            ))}

            {/* Main cooling water header pipe along roof */}
            <mesh position={[0, -2, 30]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[1.5, 1.5, 280]} />
                <meshStandardMaterial color="#0891b2" metalness={0.6} />
            </mesh>
            <mesh position={[0, -2, -30]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[1.5, 1.5, 280]} />
                <meshStandardMaterial color="#dc2626" metalness={0.6} />
            </mesh>
        </group>
    );
}

/**
 * Diesel Generator Perimeter - White containers around building
 */
function DieselGeneratorPerimeter() {
    // Generators along the long sides (front and back)
    const longSideGens = [...Array(12)].map((_, i) => ({
        pos: [-132 + i * 24, 0, 70] as [number, number, number],
    }));
    const backSideGens = [...Array(12)].map((_, i) => ({
        pos: [-132 + i * 24, 0, -70] as [number, number, number],
    }));

    return (
        <group>
            {/* Front perimeter */}
            {longSideGens.map((gen, i) => (
                <DieselGeneratorUnit key={`front-${i}`} position={gen.pos} />
            ))}

            {/* Back perimeter */}
            {backSideGens.map((gen, i) => (
                <DieselGeneratorUnit key={`back-${i}`} position={gen.pos} />
            ))}

            {/* Side generators */}
            {[...Array(3)].map((_, i) => (
                <group key={`side-${i}`}>
                    <DieselGeneratorUnit position={[165, 0, -30 + i * 30]} rotation={[0, Math.PI / 2, 0]} />
                    <DieselGeneratorUnit position={[-165, 0, -30 + i * 30]} rotation={[0, Math.PI / 2, 0]} />
                </group>
            ))}
        </group>
    );
}

/**
 * Single Diesel Generator Unit - White container with exhaust
 */
function DieselGeneratorUnit({ position, rotation = [0, 0, 0] }: {
    position: [number, number, number];
    rotation?: [number, number, number];
}) {
    return (
        <group position={position} rotation={rotation}>
            {/* White container body */}
            <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[15, 5, 4]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.2} roughness={0.6} />
            </mesh>

            {/* Container ribs */}
            {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[-6 + i * 3, 2.5, 2.05]}>
                    <boxGeometry args={[0.3, 4.5, 0.1]} />
                    <meshStandardMaterial color="#e2e8f0" />
                </mesh>
            ))}

            {/* Exhaust stack */}
            <mesh position={[5, 6, 0]}>
                <cylinderGeometry args={[0.4, 0.5, 3]} />
                <meshStandardMaterial color="#4b5563" metalness={0.5} />
            </mesh>

            {/* Ventilation grilles */}
            <mesh position={[-6, 2.5, 2.1]}>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="#374151" />
            </mesh>

            {/* Status light */}
            <mesh position={[6.5, 4, 2.1]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#22c55e" />
            </mesh>

            {/* Concrete pad */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[18, 0.3, 6]} />
                <meshStandardMaterial color="#4b5563" />
            </mesh>
        </group>
    );
}

/**
 * Transformer Grid - Grey transformer boxes in foreground
 */
function TransformerGrid({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Substation pad */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[200, 60]} />
                <meshStandardMaterial color="#4b5563" />
            </mesh>

            {/* Grid of 12 main transformers (4x3) */}
            {[...Array(12)].map((_, i) => {
                const row = Math.floor(i / 4);
                const col = i % 4;
                return (
                    <group key={i} position={[-60 + col * 40, 0, -15 + row * 18]}>
                        {/* Transformer body */}
                        <mesh position={[0, 4, 0]}>
                            <boxGeometry args={[8, 8, 6]} />
                            <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
                        </mesh>

                        {/* Radiator fins on sides */}
                        <mesh position={[4.2, 4, 0]}>
                            <boxGeometry args={[0.4, 6, 5]} />
                            <meshStandardMaterial color="#4b5563" />
                        </mesh>
                        <mesh position={[-4.2, 4, 0]}>
                            <boxGeometry args={[0.4, 6, 5]} />
                            <meshStandardMaterial color="#4b5563" />
                        </mesh>

                        {/* HV bushings on top */}
                        {[-2, 0, 2].map((x, j) => (
                            <mesh key={j} position={[x, 9.5, 0]}>
                                <cylinderGeometry args={[0.4, 0.5, 3]} />
                                <meshStandardMaterial color="#94a3b8" />
                            </mesh>
                        ))}

                        {/* Oil level indicator */}
                        <mesh position={[4.5, 6, 0]}>
                            <cylinderGeometry args={[0.15, 0.15, 2]} />
                            <meshStandardMaterial color="#f59e0b" />
                        </mesh>
                    </group>
                );
            })}

            {/* Bus bars connecting transformers */}
            <mesh position={[0, 12, -15]}>
                <boxGeometry args={[180, 0.3, 0.3]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} emissive="#f59e0b" emissiveIntensity={0.1} />
            </mesh>
            <mesh position={[0, 12, 3]}>
                <boxGeometry args={[180, 0.3, 0.3]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} emissive="#f59e0b" emissiveIntensity={0.1} />
            </mesh>
            <mesh position={[0, 12, 20]}>
                <boxGeometry args={[180, 0.3, 0.3]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} emissive="#f59e0b" emissiveIntensity={0.1} />
            </mesh>

            {/* Steel lattice towers at ends */}
            {[-90, 90].map((x, i) => (
                <mesh key={i} position={[x, 10, 0]}>
                    <cylinderGeometry args={[0.6, 1.2, 20, 4]} />
                    <meshStandardMaterial color="#64748b" metalness={0.7} />
                </mesh>
            ))}

            {/* Control building */}
            <mesh position={[80, 3, -20]}>
                <boxGeometry args={[15, 6, 10]} />
                <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Security fence around substation */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[102, 104, 4]} />
                <meshStandardMaterial color="#6b7280" transparent opacity={0.3} />
            </mesh>
        </group>
    );
}


/**
 * Primary Substation - 345kV/138kV (80m × 60m)
 */
function PrimarySubstation({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Substation pad */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[80, 60]} />
                <meshStandardMaterial color="#4b5563" />
            </mesh>

            {/* Control building */}
            <mesh position={[30, 4, 20]}>
                <boxGeometry args={[15, 8, 10]} />
                <meshStandardMaterial color="#475569" metalness={0.3} />
            </mesh>

            {/* Main power transformers (6 units) */}
            {[[-20, 0, -10], [0, 0, -10], [20, 0, -10], [-20, 0, 10], [0, 0, 10], [20, 0, 10]].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                    <mesh position={[0, 3, 0]}>
                        <boxGeometry args={[6, 6, 4]} />
                        <meshStandardMaterial color="#374151" metalness={0.6} />
                    </mesh>
                    {/* Radiator fins */}
                    <mesh position={[0, 3, 2.5]}>
                        <boxGeometry args={[5, 4, 0.8]} />
                        <meshStandardMaterial color="#4b5563" />
                    </mesh>
                    {/* HV bushings */}
                    {[-1.5, 0, 1.5].map((x, j) => (
                        <mesh key={j} position={[x, 7, 0]}>
                            <cylinderGeometry args={[0.3, 0.4, 2.5]} />
                            <meshStandardMaterial color="#94a3b8" />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* Bus bars at 12m height */}
            <mesh position={[0, 12, 0]}>
                <boxGeometry args={[70, 0.2, 0.2]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} emissive="#f59e0b" emissiveIntensity={0.1} />
            </mesh>

            {/* Steel lattice structures */}
            {[-30, 0, 30].map((x, i) => (
                <mesh key={i} position={[x, 8, -25]}>
                    <cylinderGeometry args={[0.4, 0.8, 16, 4]} />
                    <meshStandardMaterial color="#64748b" metalness={0.7} />
                </mesh>
            ))}
        </group>
    );
}


/**
 * Battery Energy Storage System (BESS) - 24 container units
 */
function BatteryStorage({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Concrete pad */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[40, 30]} />
                <meshStandardMaterial color="#4b5563" />
            </mesh>

            {/* Battery containers (24 units in 4×6 grid) */}
            {[...Array(24)].map((_, i) => {
                const row = Math.floor(i / 6);
                const col = i % 6;
                return (
                    <group key={i} position={[-15 + col * 6, 0, -10 + row * 7]}>
                        <mesh position={[0, 1.75, 0]}>
                            <boxGeometry args={[5, 3.5, 2.5]} />
                            <meshStandardMaterial color="#1f2937" metalness={0.5} />
                        </mesh>
                        {/* Ventilation */}
                        <mesh position={[0, 1.75, 1.3]}>
                            <boxGeometry args={[4, 2, 0.1]} />
                            <meshStandardMaterial color="#374151" />
                        </mesh>
                        {/* Status indicator */}
                        <mesh position={[2, 3, 1.3]}>
                            <boxGeometry args={[0.3, 0.3, 0.05]} />
                            <meshBasicMaterial color="#22c55e" />
                        </mesh>
                    </group>
                );
            })}

            {/* Inverter building */}
            <mesh position={[25, 3, 0]}>
                <boxGeometry args={[6, 6, 8]} />
                <meshStandardMaterial color="#374151" metalness={0.4} />
            </mesh>
        </group>
    );
}


function TransmissionTower({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Tower structure - 35m tall */}
            <mesh position={[0, 17.5, 0]}>
                <cylinderGeometry args={[0.5, 1.5, 35, 4]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} />
            </mesh>
            {/* Cross arms */}
            <mesh position={[0, 32, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 18]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, 28, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 12]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>
            {/* Insulators */}
            {[-6, -3, 0, 3, 6].map((x, i) => (
                <mesh key={i} position={[x, 31, 0]}>
                    <cylinderGeometry args={[0.1, 0.2, 2]} />
                    <meshStandardMaterial color="#374151" />
                </mesh>
            ))}
        </group>
    );
}

/**
 * Infinite Ground - Expands smoothly based on current view
 */
function InfiniteGround({ currentIndex }: { currentIndex: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    const sizes = [3, 20, 40, 150, 500];
    const gridDivisions = [6, 40, 80, 150, 250];

    const targetSize = sizes[Math.min(currentIndex, sizes.length - 1)];
    const divisions = gridDivisions[Math.min(currentIndex, gridDivisions.length - 1)];

    useFrame((_, delta) => {
        if (meshRef.current) {
            const currentScale = meshRef.current.scale.x;
            const newScale = THREE.MathUtils.lerp(currentScale, targetSize, delta * 1.5);
            meshRef.current.scale.set(newScale, 1, newScale);
        }
    });

    return (
        <group>
            {/* Dark ground plane */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} scale={[3, 1, 3]}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#0f172a" />
            </mesh>

            {/* Grid overlay */}
            <gridHelper
                args={[targetSize * 2, divisions, '#1e293b', '#0f172a']}
                position={[0, -0.09, 0]}
            />
        </group>
    );
}

/**
 * Power Indicator UI - Updated for NVIDIA Rubin Ultra Kyber specs (600kW racks)
 */
function PowerIndicator({ visualState, powerMetric }: {
    visualState: string;
    powerMetric?: { value: string; unit: string; comparison: string };
}) {
    // Based on Rubin Ultra NVL576 Kyber (600kW per rack, 2027)
    const data: Record<string, { label: string; value: string; unit: string; comparison: string; color: string }> = {
        'chip-glow': { label: 'NVIDIA Rubin GPU', value: '2.3', unit: 'kW', comparison: '≈ 2 homes', color: '#f59e0b' },
        'rack-zoom': { label: 'Rubin Ultra Kyber Rack', value: '600', unit: 'kW', comparison: '≈ 500 homes', color: '#38bdf8' },
        'pod-zoom': { label: 'Compute Pod (8 racks)', value: '4.8', unit: 'MW', comparison: '≈ 4,000 homes', color: '#38bdf8' },
        'building-iso': { label: 'Data Center Facility', value: '100-500', unit: 'MW', comparison: '≈ small city', color: '#ef4444' },
        'campus-grid': { label: 'Hyperscale Campus', value: '500', unit: 'MW', comparison: '≈ half a nuclear plant', color: '#ef4444' },
    };

    const d = data[visualState];
    if (!d) return null;

    return (
        <motion.div
            key={visualState}
            className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-sm rounded-lg px-5 py-4 border border-slate-600 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{d.label}</div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono" style={{ color: d.color }}>
                    {powerMetric?.value || d.value}
                </span>
                <span className="text-lg font-mono text-slate-300">{powerMetric?.unit || d.unit}</span>
            </div>
            <div className="text-sm text-slate-400 mt-1">{powerMetric?.comparison || d.comparison}</div>
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
        'building-iso': { level: 4, label: 'Hall' },
        'campus-grid': { level: 5, label: 'Campus' },
    };

    const current = scales[visualState] || scales['chip-glow'];

    return (
        <motion.div
            className="absolute top-8 right-8 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-slate-600 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Scale</div>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                    <motion.div
                        key={level}
                        className="w-2 rounded-sm"
                        style={{ height: 8 + level * 4 }}
                        animate={{
                            backgroundColor: level <= current.level ? '#38bdf8' : '#475569',
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
