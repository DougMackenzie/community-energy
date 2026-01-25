'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MicroViewProps {
    visualState: string;
}

/**
 * MicroView - Stylized/Abstract SVG visualization
 * Animates from Chip -> Rack -> Building
 */
export default function MicroView({ visualState }: MicroViewProps) {
    return (
        <div className="relative w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Pulsing glow effect */}
            <motion.div
                className="absolute inset-0"
                animate={{
                    background: [
                        'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25) 0%, transparent 60%)',
                        'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                    ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Main content area */}
            <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {visualState === 'chip-glow' && <ChipVisualization key="chip" />}
                    {visualState === 'rack-zoom' && <RackVisualization key="rack" />}
                    {visualState === 'building-iso' && <BuildingVisualization key="building" />}
                </AnimatePresence>
            </div>

            {/* Power consumption indicator */}
            <PowerIndicator visualState={visualState} />
        </div>
    );
}

/**
 * Chip Visualization - Glowing GPU with circuit traces
 */
function ChipVisualization() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
        >
            <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-2xl">
                {/* Outer glow */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e3a5f" />
                        <stop offset="50%" stopColor="#0c1929" />
                        <stop offset="100%" stopColor="#1e3a5f" />
                    </linearGradient>
                    <linearGradient id="heatGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                </defs>

                {/* Circuit traces extending outward */}
                {[...Array(16)].map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    const x1 = 200 + Math.cos(angle) * 80;
                    const y1 = 200 + Math.sin(angle) * 80;
                    const x2 = 200 + Math.cos(angle) * 180;
                    const y2 = 200 + Math.sin(angle) * 180;
                    return (
                        <motion.line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#06b6d4"
                            strokeWidth="2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                        />
                    );
                })}

                {/* Connection pins */}
                {[...Array(16)].map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    const x = 200 + Math.cos(angle) * 180;
                    const y = 200 + Math.sin(angle) * 180;
                    return (
                        <motion.circle
                            key={`pin-${i}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#06b6d4"
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, delay: i * 0.05, repeat: Infinity }}
                        />
                    );
                })}

                {/* Main chip body */}
                <motion.rect
                    x="120"
                    y="120"
                    width="160"
                    height="160"
                    rx="8"
                    fill="url(#chipGradient)"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    filter="url(#glow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />

                {/* Die area */}
                <motion.rect
                    x="145"
                    y="145"
                    width="110"
                    height="110"
                    rx="4"
                    fill="#0a0a0a"
                    stroke="#1f2937"
                    strokeWidth="1"
                />

                {/* Heat signature in the center */}
                <motion.rect
                    x="160"
                    y="160"
                    width="80"
                    height="80"
                    rx="2"
                    fill="url(#heatGradient)"
                    opacity={0.8}
                    animate={{ opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* "H100" text */}
                <text x="200" y="207" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">
                    H100
                </text>

                {/* Power indicator */}
                <motion.text
                    x="200"
                    y="350"
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="24"
                    fontWeight="bold"
                    fontFamily="monospace"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    700W
                </motion.text>
            </svg>
        </motion.div>
    );
}

/**
 * Rack Visualization - Server rack with multiple units
 */
function RackVisualization() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
        >
            <svg width="500" height="500" viewBox="0 0 500 500" className="drop-shadow-2xl">
                <defs>
                    <linearGradient id="rackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1f2937" />
                        <stop offset="50%" stopColor="#111827" />
                        <stop offset="100%" stopColor="#1f2937" />
                    </linearGradient>
                    <filter id="serverGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Rack frame */}
                <rect x="100" y="30" width="300" height="420" rx="4" fill="url(#rackGradient)" stroke="#374151" strokeWidth="2" />

                {/* Rack rails */}
                <rect x="115" y="40" width="8" height="400" fill="#4b5563" rx="2" />
                <rect x="377" y="40" width="8" height="400" fill="#4b5563" rx="2" />

                {/* Server units */}
                {[...Array(8)].map((_, i) => (
                    <motion.g
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                        {/* Server body */}
                        <rect
                            x="130"
                            y={50 + i * 48}
                            width="240"
                            height="42"
                            rx="2"
                            fill="#0f172a"
                            stroke="#1e293b"
                            strokeWidth="1"
                        />

                        {/* Front panel */}
                        <rect x="135" y={55 + i * 48} width="230" height="32" rx="1" fill="#020617" />

                        {/* Status LEDs */}
                        <motion.circle
                            cx="150"
                            cy={71 + i * 48}
                            r="4"
                            fill="#22c55e"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                        />
                        <motion.circle
                            cx="165"
                            cy={71 + i * 48}
                            r="4"
                            fill="#3b82f6"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                        />

                        {/* Ventilation holes */}
                        {[...Array(12)].map((_, j) => (
                            <rect
                                key={j}
                                x={190 + j * 14}
                                y={62 + i * 48}
                                width="8"
                                height="18"
                                rx="1"
                                fill="#1e293b"
                            />
                        ))}

                        {/* Heat glow from vents */}
                        <motion.rect
                            x="185"
                            y={60 + i * 48}
                            width="170"
                            height="22"
                            rx="2"
                            fill="url(#heatGradient)"
                            opacity={0.15}
                            filter="url(#serverGlow)"
                            animate={{ opacity: [0.1, 0.25, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                    </motion.g>
                ))}

                {/* Power indicator */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <rect x="150" y="460" width="200" height="30" rx="4" fill="#7f1d1d" />
                    <motion.text
                        x="250"
                        y="482"
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="18"
                        fontWeight="bold"
                        fontFamily="monospace"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        100 kW
                    </motion.text>
                </motion.g>

                {/* Heat waves rising */}
                {[...Array(5)].map((_, i) => (
                    <motion.path
                        key={`heat-${i}`}
                        d={`M ${150 + i * 50} 30 Q ${160 + i * 50} 10, ${170 + i * 50} 30`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        opacity={0.4}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: -30, opacity: [0, 0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                ))}
            </svg>
        </motion.div>
    );
}

/**
 * Building Visualization - Isometric data center facility
 */
function BuildingVisualization() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative"
        >
            <svg width="600" height="500" viewBox="0 0 600 500" className="drop-shadow-2xl">
                <defs>
                    <linearGradient id="buildingTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e3a5f" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="buildingLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0c1929" />
                        <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                    <linearGradient id="buildingRight" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                </defs>

                {/* Ground shadow */}
                <ellipse cx="300" cy="420" rx="250" ry="40" fill="rgba(0,0,0,0.3)" />

                {/* Main building - isometric box */}
                {/* Top face */}
                <motion.polygon
                    points="300,80 450,160 300,240 150,160"
                    fill="url(#buildingTop)"
                    stroke="#475569"
                    strokeWidth="2"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                />

                {/* Left face */}
                <motion.polygon
                    points="150,160 300,240 300,380 150,300"
                    fill="url(#buildingLeft)"
                    stroke="#475569"
                    strokeWidth="2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                />

                {/* Right face */}
                <motion.polygon
                    points="300,240 450,160 450,300 300,380"
                    fill="url(#buildingRight)"
                    stroke="#475569"
                    strokeWidth="2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                />

                {/* Windows on left face */}
                {[...Array(3)].map((_, row) =>
                    [...Array(4)].map((_, col) => (
                        <motion.rect
                            key={`win-l-${row}-${col}`}
                            x={165 + col * 30}
                            y={190 + row * 45 + col * 15}
                            width="20"
                            height="25"
                            fill="#06b6d4"
                            opacity={0.6}
                            transform={`skewY(26.57)`}
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: (row + col) * 0.2 }}
                        />
                    ))
                )}

                {/* Windows on right face */}
                {[...Array(3)].map((_, row) =>
                    [...Array(4)].map((_, col) => (
                        <motion.rect
                            key={`win-r-${row}-${col}`}
                            x={315 + col * 30}
                            y={175 + row * 45 - col * 15}
                            width="20"
                            height="25"
                            fill="#06b6d4"
                            opacity={0.6}
                            transform={`skewY(-26.57)`}
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: (row + col) * 0.2 + 0.5 }}
                        />
                    ))
                )}

                {/* HVAC units on roof */}
                {[...Array(4)].map((_, i) => (
                    <motion.g key={`hvac-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.1 }}>
                        <rect
                            x={220 + (i % 2) * 60}
                            y={100 + Math.floor(i / 2) * 50 + (i % 2) * 20}
                            width="40"
                            height="30"
                            fill="#374151"
                            stroke="#4b5563"
                        />
                        {/* Spinning fan indicator */}
                        <motion.circle
                            cx={240 + (i % 2) * 60}
                            cy={115 + Math.floor(i / 2) * 50 + (i % 2) * 20}
                            r="10"
                            fill="#1f2937"
                            stroke="#06b6d4"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            style={{ transformOrigin: `${240 + (i % 2) * 60}px ${115 + Math.floor(i / 2) * 50 + (i % 2) * 20}px` }}
                        />
                    </motion.g>
                ))}

                {/* Generators at the side */}
                {[...Array(3)].map((_, i) => (
                    <motion.g key={`gen-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 + i * 0.15 }}>
                        <rect x={480 + i * 5} y={320 - i * 30} width="60" height="40" rx="3" fill="#1f2937" stroke="#4b5563" />
                        <text x={510 + i * 5} y={345 - i * 30} textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="monospace">
                            GEN
                        </text>
                    </motion.g>
                ))}

                {/* Power lines going in */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                    {/* Transmission tower */}
                    <polygon points="70,250 90,250 85,350 75,350" fill="#4b5563" />
                    <line x1="60" y1="260" x2="100" y2="260" stroke="#4b5563" strokeWidth="3" />
                    <line x1="65" y1="280" x2="95" y2="280" stroke="#4b5563" strokeWidth="3" />

                    {/* Power lines */}
                    <motion.path
                        d="M 100 260 Q 125 270, 150 275"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        animate={{ strokeDashoffset: [0, 20] }}
                        strokeDasharray="5 5"
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.path
                        d="M 95 280 Q 120 290, 150 295"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        animate={{ strokeDashoffset: [0, 20] }}
                        strokeDasharray="5 5"
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                    />
                </motion.g>

                {/* Power consumption badge */}
                <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5 }}>
                    <rect x="200" y="430" width="200" height="45" rx="6" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" />
                    <text x="300" y="450" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif">
                        FACILITY DEMAND
                    </text>
                    <motion.text
                        x="300"
                        y="468"
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="16"
                        fontWeight="bold"
                        fontFamily="monospace"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        50,000 HOMES
                    </motion.text>
                </motion.g>
            </svg>
        </motion.div>
    );
}

/**
 * Power Indicator - Shows escalating power consumption
 */
function PowerIndicator({ visualState }: { visualState: string }) {
    const powerData = {
        'chip-glow': { label: 'Single GPU', value: '700W', color: '#06b6d4' },
        'rack-zoom': { label: 'Server Rack', value: '100 kW', color: '#f59e0b' },
        'building-iso': { label: 'Facility', value: '100+ MW', color: '#ef4444' },
    };

    const data = powerData[visualState as keyof typeof powerData];
    if (!data) return null;

    return (
        <motion.div
            className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={visualState}
        >
            <div className="text-xs text-gray-400 uppercase tracking-wider">{data.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: data.color }}>
                {data.value}
            </div>
        </motion.div>
    );
}
