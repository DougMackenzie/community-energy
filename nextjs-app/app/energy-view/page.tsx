'use client';

/**
 * Energy View Page
 * Visualizes hourly load profiles and load duration curves for different scenarios
 */

import { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend,
} from 'recharts';
import { useCalculator } from '@/hooks/useCalculator';
import { SCENARIOS, formatMW } from '@/lib/constants';
import Link from 'next/link';

// Generate a typical summer peak day load profile (24 hours)
function generatePeakDayProfile(
    systemPeakMW: number,
    dcCapacityMW: number,
    firmLoadFactor: number,
    flexLoadFactor: number,
    flexPeakCoincidence: number,
    onsiteGenerationMW: number
) {
    // Typical summer peak day shape (normalized to 1.0 at peak)
    const hourlyShape = [
        0.65, 0.62, 0.60, 0.58, 0.58, 0.60, // 12am-6am
        0.68, 0.78, 0.85, 0.90, 0.93, 0.96, // 6am-12pm
        0.98, 1.00, 1.00, 0.99, 0.97, 0.94, // 12pm-6pm (peak hours)
        0.88, 0.82, 0.78, 0.74, 0.70, 0.67, // 6pm-12am
    ];

    // Peak hours are typically 2pm-6pm (hours 14-18)
    const peakHours = [14, 15, 16, 17, 18];

    return hourlyShape.map((shape, hour) => {
        const isPeakHour = peakHours.includes(hour);

        // Existing grid load
        const existingLoad = systemPeakMW * shape;

        // Firm DC load - constant based on load factor
        const firmDCLoad = dcCapacityMW * firmLoadFactor;

        // Flexible DC load - reduces during peak hours
        const flexDCLoad = isPeakHour
            ? dcCapacityMW * flexLoadFactor * flexPeakCoincidence
            : dcCapacityMW * flexLoadFactor;

        // Curtailed load (difference between firm and flex during peaks)
        const curtailedLoad = isPeakHour
            ? dcCapacityMW * flexLoadFactor * (1 - flexPeakCoincidence)
            : 0;

        // Onsite generation during peak hours
        const onsiteGen = isPeakHour ? onsiteGenerationMW : 0;

        // Dispatchable scenario: flex + onsite gen
        const dispatchableDCLoad = Math.max(0, flexDCLoad - onsiteGen);
        const dispatchableOnsiteOffset = isPeakHour ? onsiteGen : 0;

        return {
            hour,
            hourLabel: `${hour.toString().padStart(2, '0')}:00`,
            existingLoad,
            firmDCLoad,
            flexDCLoad,
            curtailedLoad,
            dispatchableDCLoad,
            onsiteGeneration: dispatchableOnsiteOffset,
            // Totals for stacking
            totalFirm: existingLoad + firmDCLoad,
            totalFlex: existingLoad + flexDCLoad,
            totalDispatchable: existingLoad + dispatchableDCLoad,
            isPeakHour,
        };
    });
}

// Generate load duration curve data (8760 hours sorted by load)
function generateLoadDurationCurve(
    systemPeakMW: number,
    dcCapacityMW: number,
    firmLoadFactor: number,
    flexLoadFactor: number,
    flexPeakCoincidence: number,
    onsiteGenerationMW: number
) {
    // Generate synthetic 8760-hour load profile
    const hours = 8760;
    const hourlyLoads: { hour: number; existing: number; firm: number; flex: number; dispatchable: number }[] = [];

    for (let h = 0; h < hours; h++) {
        const dayOfYear = Math.floor(h / 24);
        const hourOfDay = h % 24;

        // Seasonal factor (peak in summer, lower in spring/fall)
        const seasonalFactor = 0.7 + 0.3 * Math.sin((dayOfYear - 80) * Math.PI / 182.5);

        // Daily shape
        const hourlyShape = [
            0.65, 0.62, 0.60, 0.58, 0.58, 0.60,
            0.68, 0.78, 0.85, 0.90, 0.93, 0.96,
            0.98, 1.00, 1.00, 0.99, 0.97, 0.94,
            0.88, 0.82, 0.78, 0.74, 0.70, 0.67,
        ];

        // Weekend reduction
        const dayOfWeek = dayOfYear % 7;
        const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.0;

        const loadFactor = seasonalFactor * hourlyShape[hourOfDay] * weekendFactor;
        const existingLoad = systemPeakMW * loadFactor;

        // Determine if this is a "peak" hour (top 5% of hours)
        const isPeakCondition = loadFactor > 0.90 && seasonalFactor > 0.85;

        const firmDC = dcCapacityMW * firmLoadFactor;
        const flexDC = isPeakCondition
            ? dcCapacityMW * flexLoadFactor * flexPeakCoincidence
            : dcCapacityMW * flexLoadFactor;
        const dispatchableDC = isPeakCondition
            ? Math.max(0, flexDC - onsiteGenerationMW)
            : flexDC;

        hourlyLoads.push({
            hour: h,
            existing: existingLoad,
            firm: existingLoad + firmDC,
            flex: existingLoad + flexDC,
            dispatchable: existingLoad + dispatchableDC,
        });
    }

    // Sort each scenario by load (descending) to create duration curve
    const existingSorted = [...hourlyLoads].sort((a, b) => b.existing - a.existing);
    const firmSorted = [...hourlyLoads].sort((a, b) => b.firm - a.firm);
    const flexSorted = [...hourlyLoads].sort((a, b) => b.flex - a.flex);
    const dispatchableSorted = [...hourlyLoads].sort((a, b) => b.dispatchable - a.dispatchable);

    // Sample at 100 points for visualization
    const samples = 100;
    const result = [];

    for (let i = 0; i < samples; i++) {
        const idx = Math.floor((i / samples) * hours);
        const percentile = (i / samples) * 100;

        result.push({
            percentile,
            hoursLabel: `${Math.round((i / samples) * hours)}h`,
            existing: existingSorted[idx].existing,
            firm: firmSorted[idx].firm,
            flex: flexSorted[idx].flex,
            dispatchable: dispatchableSorted[idx].dispatchable,
            // Curtailed capacity (difference between firm and flex at this percentile)
            curtailed: firmSorted[idx].firm - flexSorted[idx].flex,
            // Generation offset (difference between flex and dispatchable)
            generationOffset: flexSorted[idx].flex - dispatchableSorted[idx].dispatchable,
        });
    }

    return result;
}

// Custom tooltip for peak day chart
const PeakDayTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
            <p className="font-semibold text-gray-900 mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-600">{entry.name}:</span>
                    <span className="font-medium">{formatMW(entry.value)}</span>
                </div>
            ))}
        </div>
    );
};

// Custom tooltip for load duration curve
const DurationCurveTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
            <p className="font-semibold text-gray-900 mb-2">Top {label}% of hours</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-600">{entry.name}:</span>
                    <span className="font-medium">{formatMW(entry.value)}</span>
                </div>
            ))}
        </div>
    );
};

export default function EnergyViewPage() {
    const { utility, dataCenter } = useCalculator();

    // Scenario visibility toggles
    const [visibleScenarios, setVisibleScenarios] = useState({
        existing: true,
        firm: true,
        flex: true,
        dispatchable: true,
        curtailed: true,
        onsite: true,
    });

    const toggleScenario = (key: keyof typeof visibleScenarios) => {
        setVisibleScenarios(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Generate chart data
    const peakDayData = useMemo(() => {
        return generatePeakDayProfile(
            utility.systemPeakMW,
            dataCenter.capacityMW,
            dataCenter.firmLoadFactor,
            dataCenter.flexLoadFactor,
            dataCenter.flexPeakCoincidence,
            dataCenter.onsiteGenerationMW
        );
    }, [utility.systemPeakMW, dataCenter]);

    const durationCurveData = useMemo(() => {
        return generateLoadDurationCurve(
            utility.systemPeakMW,
            dataCenter.capacityMW,
            dataCenter.firmLoadFactor,
            dataCenter.flexLoadFactor,
            dataCenter.flexPeakCoincidence,
            dataCenter.onsiteGenerationMW
        );
    }, [utility.systemPeakMW, dataCenter]);

    // Calculate key metrics
    const metrics = useMemo(() => {
        const peakExisting = utility.systemPeakMW;
        const peakFirm = peakExisting + dataCenter.capacityMW * dataCenter.firmLoadFactor;
        const peakFlex = peakExisting + dataCenter.capacityMW * dataCenter.flexLoadFactor * dataCenter.flexPeakCoincidence;
        const peakDispatchable = peakExisting + Math.max(0,
            dataCenter.capacityMW * dataCenter.flexLoadFactor * dataCenter.flexPeakCoincidence - dataCenter.onsiteGenerationMW
        );

        const curtailmentMW = dataCenter.capacityMW * dataCenter.flexLoadFactor * (1 - dataCenter.flexPeakCoincidence);

        return {
            peakExisting,
            peakFirm,
            peakFlex,
            peakDispatchable,
            curtailmentMW,
            peakReductionFlex: peakFirm - peakFlex,
            peakReductionDispatchable: peakFirm - peakDispatchable,
        };
    }, [utility.systemPeakMW, dataCenter]);

    const scenarioColors = {
        existing: '#6B7280',
        firm: '#DC2626',
        flex: '#F59E0B',
        dispatchable: '#10B981',
        curtailed: '#F59E0B',
        onsite: '#3B82F6',
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-2 text-indigo-200 text-sm mb-2">
                    <Link href="/calculator" className="hover:text-white">Calculator</Link>
                    <span>/</span>
                    <span>Energy View</span>
                </div>
                <h1 className="text-3xl font-bold mb-4">Energy View: Grid Impact Visualization</h1>
                <p className="text-lg text-indigo-200 max-w-3xl">
                    Explore how data center operations affect grid load patterns throughout the day
                    and across the year. Toggle scenarios to compare firm vs flexible load profiles.
                </p>
            </div>

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">System Peak (Baseline)</p>
                    <p className="text-2xl font-bold text-gray-500">{formatMW(metrics.peakExisting)}</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                    <p className="text-sm text-red-700">Peak with Firm DC</p>
                    <p className="text-2xl font-bold text-red-600">{formatMW(metrics.peakFirm)}</p>
                    <p className="text-xs text-red-500">+{formatMW(metrics.peakFirm - metrics.peakExisting)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                    <p className="text-sm text-amber-700">Peak with Flex DC</p>
                    <p className="text-2xl font-bold text-amber-600">{formatMW(metrics.peakFlex)}</p>
                    <p className="text-xs text-green-600">Saves {formatMW(metrics.peakReductionFlex)} vs firm</p>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                    <p className="text-sm text-green-700">Peak with Flex + Gen</p>
                    <p className="text-2xl font-bold text-green-600">{formatMW(metrics.peakDispatchable)}</p>
                    <p className="text-xs text-green-600">Saves {formatMW(metrics.peakReductionDispatchable)} vs firm</p>
                </div>
            </div>

            {/* Scenario Toggle Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Toggle Scenarios</h3>
                <div className="flex flex-wrap gap-3">
                    {[
                        { key: 'existing', label: 'Existing Grid Load', color: scenarioColors.existing },
                        { key: 'firm', label: 'Firm DC Load', color: scenarioColors.firm },
                        { key: 'flex', label: 'Flexible DC Load', color: scenarioColors.flex },
                        { key: 'dispatchable', label: 'Flex + Generation', color: scenarioColors.dispatchable },
                        { key: 'curtailed', label: 'Curtailed Load', color: scenarioColors.curtailed },
                        { key: 'onsite', label: 'Onsite Generation', color: scenarioColors.onsite },
                    ].map(({ key, label, color }) => (
                        <button
                            key={key}
                            onClick={() => toggleScenario(key as keyof typeof visibleScenarios)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                                visibleScenarios[key as keyof typeof visibleScenarios]
                                    ? 'border-current opacity-100'
                                    : 'border-gray-200 opacity-50'
                            }`}
                            style={{
                                borderColor: visibleScenarios[key as keyof typeof visibleScenarios] ? color : undefined,
                                backgroundColor: visibleScenarios[key as keyof typeof visibleScenarios]
                                    ? `${color}15` : '#f9fafb',
                            }}
                        >
                            <div
                                className="w-4 h-4 rounded"
                                style={{
                                    backgroundColor: color,
                                    opacity: visibleScenarios[key as keyof typeof visibleScenarios] ? 1 : 0.3
                                }}
                            />
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Peak Day Hourly Profile */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Sample Peak Day - Hourly Load Profile</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Typical summer peak day showing how data center load scenarios affect the system.
                    Peak hours (2pm-6pm) are highlighted, showing curtailment and onsite generation effects.
                </p>

                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={peakDayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="hourLabel"
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            interval={2}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(v) => `${(v/1000).toFixed(1)}k`}
                            label={{
                                value: 'Load (MW)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: '#6b7280', fontSize: 12 },
                            }}
                        />
                        <Tooltip content={<PeakDayTooltip />} />

                        {/* Existing load base layer */}
                        {visibleScenarios.existing && (
                            <Area
                                type="monotone"
                                dataKey="existingLoad"
                                name="Existing Grid Load"
                                stackId="base"
                                fill={scenarioColors.existing}
                                fillOpacity={0.6}
                                stroke={scenarioColors.existing}
                                strokeWidth={2}
                            />
                        )}

                        {/* Firm DC load (on top of existing) */}
                        {visibleScenarios.firm && (
                            <Area
                                type="monotone"
                                dataKey="firmDCLoad"
                                name="Firm DC Load"
                                stackId="firm"
                                fill={scenarioColors.firm}
                                fillOpacity={0.4}
                                stroke={scenarioColors.firm}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        )}

                        {/* Total lines for comparison */}
                        {visibleScenarios.firm && (
                            <Line
                                type="monotone"
                                dataKey="totalFirm"
                                name="Total (Firm)"
                                stroke={scenarioColors.firm}
                                strokeWidth={3}
                                dot={false}
                            />
                        )}

                        {visibleScenarios.flex && (
                            <Line
                                type="monotone"
                                dataKey="totalFlex"
                                name="Total (Flexible)"
                                stroke={scenarioColors.flex}
                                strokeWidth={3}
                                dot={false}
                            />
                        )}

                        {visibleScenarios.dispatchable && (
                            <Line
                                type="monotone"
                                dataKey="totalDispatchable"
                                name="Total (Flex + Gen)"
                                stroke={scenarioColors.dispatchable}
                                strokeWidth={3}
                                dot={false}
                            />
                        )}

                        {/* Curtailed load indicator */}
                        {visibleScenarios.curtailed && (
                            <Area
                                type="monotone"
                                dataKey="curtailedLoad"
                                name="Curtailed Load"
                                fill={scenarioColors.curtailed}
                                fillOpacity={0.3}
                                stroke={scenarioColors.curtailed}
                                strokeWidth={2}
                                strokeDasharray="3 3"
                            />
                        )}

                        {/* Onsite generation */}
                        {visibleScenarios.onsite && (
                            <Area
                                type="monotone"
                                dataKey="onsiteGeneration"
                                name="Onsite Generation"
                                fill={scenarioColors.onsite}
                                fillOpacity={0.5}
                                stroke={scenarioColors.onsite}
                                strokeWidth={2}
                            />
                        )}

                        {/* Peak hours reference */}
                        <ReferenceLine x="14:00" stroke="#9ca3af" strokeDasharray="3 3" />
                        <ReferenceLine x="18:00" stroke="#9ca3af" strokeDasharray="3 3" />
                    </AreaChart>
                </ResponsiveContainer>

                <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-gray-400" style={{ borderTop: '2px dashed #9ca3af' }}></div>
                        <span>Peak hours (2pm-6pm)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-3 rounded" style={{ backgroundColor: scenarioColors.curtailed, opacity: 0.3 }}></div>
                        <span>Curtailed/shifted load during peaks</span>
                    </div>
                </div>
            </div>

            {/* Annual Load Duration Curve */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Annual Load Duration Curve</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Hours sorted from highest to lowest load across the year (8,760 hours).
                    Shows how scenarios affect peak capacity requirements. The gap between curves
                    represents avoided infrastructure investment.
                </p>

                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={durationCurveData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="percentile"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(v) => `${v}%`}
                            label={{
                                value: 'Percent of Hours',
                                position: 'bottom',
                                style: { fill: '#6b7280', fontSize: 12 },
                            }}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(v) => `${(v/1000).toFixed(1)}k`}
                            label={{
                                value: 'System Load (MW)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: '#6b7280', fontSize: 12 },
                            }}
                        />
                        <Tooltip content={<DurationCurveTooltip />} />

                        {visibleScenarios.existing && (
                            <Area
                                type="monotone"
                                dataKey="existing"
                                name="Existing (No DC)"
                                fill={scenarioColors.existing}
                                fillOpacity={0.3}
                                stroke={scenarioColors.existing}
                                strokeWidth={2}
                            />
                        )}

                        {visibleScenarios.firm && (
                            <Line
                                type="monotone"
                                dataKey="firm"
                                name="With Firm DC"
                                stroke={scenarioColors.firm}
                                strokeWidth={3}
                                dot={false}
                            />
                        )}

                        {visibleScenarios.flex && (
                            <Line
                                type="monotone"
                                dataKey="flex"
                                name="With Flexible DC"
                                stroke={scenarioColors.flex}
                                strokeWidth={3}
                                dot={false}
                            />
                        )}

                        {visibleScenarios.dispatchable && (
                            <Line
                                type="monotone"
                                dataKey="dispatchable"
                                name="With Flex + Generation"
                                stroke={scenarioColors.dispatchable}
                                strokeWidth={3}
                                dot={false}
                            />
                        )}

                        {/* Annotate the savings area */}
                        {visibleScenarios.curtailed && visibleScenarios.firm && visibleScenarios.flex && (
                            <Area
                                type="monotone"
                                dataKey="curtailed"
                                name="Peak Reduction (Flexibility)"
                                fill={scenarioColors.curtailed}
                                fillOpacity={0.2}
                                stroke="none"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>

                <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Peak (top 1% hours)</p>
                        <p className="font-semibold">Defines infrastructure needs</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-amber-700">Gap between Firm & Flex</p>
                        <p className="font-semibold text-amber-800">= Avoided transmission investment</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-green-700">Gap between Flex & Dispatchable</p>
                        <p className="font-semibold text-green-800">= Additional savings from onsite gen</p>
                    </div>
                </div>
            </div>

            {/* Explanation */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h3 className="font-semibold text-blue-900 mb-4">Understanding the Charts</h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
                    <div>
                        <h4 className="font-medium mb-2">Peak Day Profile</h4>
                        <ul className="space-y-1">
                            <li>• Shows a single summer peak day (24 hours)</li>
                            <li>• <strong>Existing load</strong> follows typical daily pattern</li>
                            <li>• <strong>Firm DC</strong> adds constant load throughout</li>
                            <li>• <strong>Flexible DC</strong> reduces load during peak hours (2-6pm)</li>
                            <li>• <strong>Curtailed area</strong> shows load shifted to off-peak</li>
                            <li>• <strong>Onsite generation</strong> further reduces grid draw at peak</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Load Duration Curve</h4>
                        <ul className="space-y-1">
                            <li>• All 8,760 hours sorted highest to lowest</li>
                            <li>• Left side (0%) = absolute peak hour</li>
                            <li>• Right side (100%) = minimum load hour</li>
                            <li>• Vertical gap at left = avoided peak capacity</li>
                            <li>• Area under curve = total annual energy</li>
                            <li>• Infrastructure sized for peak, not average</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">Explore More</h3>
                        <p className="text-sm text-gray-600">
                            See bill impacts or review the methodology
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/calculator"
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Bill Calculator
                        </Link>
                        <Link
                            href="/methodology"
                            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            View Methodology
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
