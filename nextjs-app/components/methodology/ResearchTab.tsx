'use client';

import { useState, useEffect } from 'react';
import {
    INFRASTRUCTURE_COSTS,
    TIME_PARAMS,
    WORKLOAD_TYPES,
    DEFAULT_UTILITY,
    DEFAULT_DATA_CENTER,
    DC_RATE_STRUCTURE,
    SUPPLY_CURVE,
    formatCurrency,
    calculateAggregateFlexibility,
} from '@/lib/constants';
import { MARKET_FORECASTS, getNationalGrowthProjection } from '@/lib/marketForecasts';

interface SectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    expandedSection: string | null;
    toggleSection: (id: string) => void;
    badge?: string;
    badgeColor?: string;
}

const Section = ({ id, title, children, expandedSection, toggleSection, badge, badgeColor = 'bg-blue-100 text-blue-800' }: SectionProps) => {
    const isExpanded = expandedSection === id;
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => toggleSection(id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    {badge && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${badgeColor}`}>
                            {badge}
                        </span>
                    )}
                </div>
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isExpanded && (
                <div className="px-6 py-4 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

interface CarbonData {
    development: {
        totalInputTokens: number;
        totalOutputTokens: number;
        totalTokens: number;
        sessions: number;
        lastUpdated: string;
    };
    carbonMetrics: {
        gCO2PerThousandTokens: number;
        totalKgCO2: number;
        hamburgerEquivalentKg: number;
    };
}

interface ResearchTabProps {
    /** Initial expanded section ID */
    initialSection?: string;
}

/**
 * Research & Framework Tab
 *
 * Contains the original methodology page content with accordion sections
 * explaining the technical framework, calculations, and data sources.
 */
export default function ResearchTab({ initialSection = 'data-sources' }: ResearchTabProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>(initialSection);
    const [carbonData, setCarbonData] = useState<CarbonData | null>(null);

    useEffect(() => {
        fetch('/api/carbon')
            .then(res => res.json())
            .then(data => setCarbonData(data))
            .catch(err => console.error('Failed to fetch carbon data:', err));
    }, []);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Derived carbon values
    const totalTokens = carbonData?.development?.totalTokens ?? 400000;
    const gCO2PerK = carbonData?.carbonMetrics?.gCO2PerThousandTokens ?? 1.0;
    const totalKgCO2 = carbonData?.carbonMetrics?.totalKgCO2 ?? 0.4;
    const hamburgerKg = carbonData?.carbonMetrics?.hamburgerEquivalentKg ?? 3.5;
    const hamburgerEquiv = totalKgCO2 / hamburgerKg;

    // Calculate aggregate flexibility
    const aggregateFlexibility = calculateAggregateFlexibility(WORKLOAD_TYPES);

    return (
        <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Endogenous Capacity Pricing</h2>
                        <p className="text-gray-600 mb-4">
                            This calculator models how capacity prices respond dynamically to changes in reserve margin.
                            When large data center loads consume available reserves, prices can spike non-linearly.
                            The PJM 2025/26 auction provides a real-world example of this dynamic.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-slate-700">$269.92</p>
                                <p className="text-xs text-gray-500">PJM 2025/26 capacity price ($/MW-day)</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-slate-700">10x</p>
                                <p className="text-xs text-gray-500">Increase from prior year ($28.92)</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-slate-700">63%</p>
                                <p className="text-xs text-gray-500">Attributed to data center load growth</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Sections */}
            <div className="space-y-4">
                {/* MODEL OVERVIEW */}
                <Section
                    id="model-overview"
                    title="Model Overview"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-6 text-gray-600">
                        <p>
                            Our model projects residential electricity bills under four scenarios, each representing
                            different data center operational strategies:
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                    <h4 className="font-semibold text-gray-900">Baseline</h4>
                                </div>
                                <p className="text-sm">
                                    Normal cost growth from infrastructure aging, inflation, and baseline system upgrades.
                                    No data center load added.
                                </p>
                            </div>
                            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <h4 className="font-semibold text-gray-900">Typical Data Center (Firm Load)</h4>
                                </div>
                                <p className="text-sm">
                                    Data center operates at {(DEFAULT_DATA_CENTER.firmLoadFactor * 100).toFixed(0)}% load factor,
                                    adding 100% of capacity to system peak. Maximum infrastructure and capacity market impact.
                                </p>
                            </div>
                            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <h4 className="font-semibold text-gray-900">Flexible Data Center</h4>
                                </div>
                                <p className="text-sm">
                                    Data center curtails {((1 - DEFAULT_DATA_CENTER.flexPeakCoincidence) * 100).toFixed(0)}% during peaks
                                    (validated by EPRI DCFlex). Runs at {(DEFAULT_DATA_CENTER.flexLoadFactor * 100).toFixed(0)}% load factor
                                    by shifting workloads to off-peak hours.
                                </p>
                            </div>
                            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <h4 className="font-semibold text-gray-900">Optimized (Flex + Dispatchable)</h4>
                                </div>
                                <p className="text-sm">
                                    Flexible operation plus onsite generation during peaks. Minimizes grid draw and
                                    can actually <em>reduce</em> system peak contribution.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-semibold text-blue-900 mb-2">About the 25% Flexibility Assumption</p>
                            <p className="text-sm text-gray-700">
                                The 25% peak reduction capability is based on{' '}
                                <a href="https://dcflex.epri.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    EPRI&apos;s DCFlex initiative
                                </a>
                                —a 2024 field demonstration at a major data center that achieved 25% sustained power reduction
                                during 3-hour peak events. While theoretical analysis suggests up to {(aggregateFlexibility * 100).toFixed(0)}% is possible,
                                we use the field-validated 25% as a conservative baseline. See the{' '}
                                <strong>Workload Flexibility Model</strong> section for details.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* CORE CALCULATION LOGIC */}
                <Section
                    id="core-logic"
                    title="Core Calculation Logic"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4 text-gray-600">
                        <p><strong>Basic Formula:</strong></p>
                        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            <p>Monthly Impact = (Infrastructure Costs - DC Revenue Offset) x Residential Allocation / Customers / 12</p>
                            <p className="mt-2 text-gray-500">+ Socialized Capacity Cost / Customers / 12 <span className="text-xs">(capacity markets only)</span></p>
                        </div>

                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-semibold text-green-900 mb-2">Revenue Flow-Through (Cost Causation Principle)</p>
                            <p className="text-sm text-gray-700 mb-2">
                                Data center tariff payments offset infrastructure costs. The flow-through rate varies by market structure:
                            </p>
                            <table className="w-full text-sm mb-2">
                                <thead>
                                    <tr className="border-b border-green-200">
                                        <th className="text-left py-1 font-medium">Market Type</th>
                                        <th className="text-right py-1 font-medium">Demand Charges</th>
                                        <th className="text-right py-1 font-medium">Energy Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr className="border-b border-green-100">
                                        <td className="py-1">Regulated (cost-of-service)</td>
                                        <td className="text-right font-medium">90%</td>
                                        <td className="text-right font-medium">85%</td>
                                    </tr>
                                    <tr className="border-b border-green-100">
                                        <td className="py-1">ERCOT (energy-only)</td>
                                        <td className="text-right">70%</td>
                                        <td className="text-right">65%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">Capacity Markets (PJM/MISO)</td>
                                        <td className="text-right">60%</td>
                                        <td className="text-right">50%</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-500">
                                In regulated markets, PUC-approved tariffs are designed to recover the utility&apos;s cost of serving each customer class.
                                When a data center pays its industrial tariff rates, those costs are considered &quot;recovered&quot;—not shifted to residential customers.
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Note: These flow-through rates determine how DC tariff revenue offsets infrastructure costs.
                                This is separate from the residential allocation percentage (30-42% by market),
                                which determines what share of remaining net costs residential customers bear.
                            </p>
                        </div>

                        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm font-semibold text-amber-900 mb-2">Capacity Market Addition (PJM/NYISO/MISO)</p>
                            <p className="text-sm text-gray-700">
                                For utilities in organized capacity markets, we add a <strong>Socialized Capacity Cost</strong> component.
                                When large loads consume reserve margin, capacity auction prices can spike,
                                and this price increase is paid by <em>all</em> existing customers on their existing load.
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                This cost is calculated using <strong>endogenous capacity pricing</strong> (see dedicated section below).
                                Due to recent auction timeline compression (auctions now clear 11-18 months ahead rather than 3 years),
                                capacity costs apply immediately when data centers connect—current prices already reflect demand growth.
                            </p>
                        </div>

                        <p className="mt-6"><strong>Key Terms Explained:</strong></p>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                            <div>
                                <span className="font-semibold">Load Factor:</span> Average power draw / nameplate capacity.
                                A 2,000 MW data center at 80% load factor draws 1,600 MW on average.
                            </div>
                            <div>
                                <span className="font-semibold">Peak Coincidence:</span> Fraction of capacity drawing power during system peak hours.
                                100% means full contribution to peak; 75% means the facility reduces load by 25% during peaks.
                            </div>
                            <div>
                                <span className="font-semibold">Curtailable:</span> The portion of load that can be temporarily reduced during grid stress events
                                by pausing or deferring non-time-sensitive workloads (e.g., AI training, batch processing).
                            </div>
                        </div>

                        <p className="mt-6"><strong>Firm vs Flexible Load Scenarios:</strong></p>
                        <table className="w-full text-sm mt-2">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 font-medium">Parameter</th>
                                    <th className="text-right py-2 font-medium">Firm Load</th>
                                    <th className="text-right py-2 font-medium">Flexible Load</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2">Load Factor</td>
                                    <td className="text-right">{(DEFAULT_DATA_CENTER.firmLoadFactor * 100).toFixed(0)}%</td>
                                    <td className="text-right">{(DEFAULT_DATA_CENTER.flexLoadFactor * 100).toFixed(0)}%</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2">Peak Coincidence</td>
                                    <td className="text-right">{(DEFAULT_DATA_CENTER.firmPeakCoincidence * 100).toFixed(0)}%</td>
                                    <td className="text-right">{(DEFAULT_DATA_CENTER.flexPeakCoincidence * 100).toFixed(0)}%</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2">Curtailable During Peaks</td>
                                    <td className="text-right">0%</td>
                                    <td className="text-right">{((1 - DEFAULT_DATA_CENTER.flexPeakCoincidence) * 100).toFixed(0)}%</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm">
                                <strong>Why 95% load factor for flexible?</strong> By shifting deferrable workloads (AI training, batch jobs)
                                to off-peak hours, data centers can run at higher average utilization while reducing peak contribution.
                            </p>
                            <p className="text-sm mt-2">
                                <strong>Note on firm load behavior:</strong> Firm data centers don&apos;t run at a constant 80%—they fluctuate
                                between roughly 70-100% of interconnected capacity based on IT workload demands. The key difference is that
                                they <em>cannot coordinate</em> their load reductions with grid stress events. When the grid needs relief during
                                peak hours, a firm data center may happen to be running at 90% or 100%, while a flexible data center can
                                deliberately curtail to 75% of capacity.
                            </p>
                        </div>

                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-semibold text-green-900 mb-2">Grid Capacity Math: Why 33% More?</p>
                            <p className="text-sm text-green-800">
                                If a grid has X MW of available capacity for new load:
                            </p>
                            <ul className="list-disc list-inside text-sm text-green-800 mt-2 space-y-1">
                                <li><strong>Firm load</strong> (100% peak): Grid supports X MW of data center capacity</li>
                                <li><strong>Flexible load</strong> (75% peak): Grid supports X / 0.75 = <strong>1.33X MW</strong> of data center capacity</li>
                            </ul>
                            <p className="text-sm text-green-800 mt-2">
                                Result: <strong>33% more data center capacity</strong> can connect to the same grid infrastructure
                                when operating flexibly, because each MW only adds 0.75 MW to the system peak.
                            </p>
                        </div>

                        <p className="mt-6"><strong>Revenue Offset (DC Revenue Contribution):</strong></p>
                        <p className="text-sm mb-3">
                            Data centers generate significant revenue for utilities, which offsets infrastructure costs before
                            any net impact flows to residential customers. In some scenarios, revenue can exceed infrastructure
                            costs, resulting in a net benefit to ratepayers.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-4 text-sm">
                            <div>
                                <span className="font-semibold text-gray-900">1. Energy Revenue (Volume x Margin)</span>
                                <p className="mt-1">
                                    Utilities earn margin on each MWh sold, calculated dynamically as <code className="text-xs bg-gray-200 px-1 rounded">tariff energy rate - wholesale cost</code>.
                                    Wholesale costs vary by market: ERCOT $45, PJM $42, MISO $35, TVA $32, SPP $28, NYISO $55, Regulated $38/MWh.
                                    This margin contributes to the utility&apos;s revenue requirement, which is then allocated across all customers.
                                </p>
                                <div className="mt-2 pl-4 border-l-2 border-blue-300">
                                    <p><strong>Firm (80% LF):</strong> 1,000 MW x 80% x 8,760 hrs = 7,008,000 MWh/year</p>
                                    <p><strong>Flexible (95% LF):</strong> 1,000 MW x 95% x 8,760 hrs = 8,322,000 MWh/year</p>
                                    <p className="text-green-700 font-medium mt-1">
                                        Flexible generates 19% more energy revenue (~$6.4M more annually at same capacity)
                                    </p>
                                </div>
                            </div>

                            <div>
                                <span className="font-semibold text-gray-900">2. Demand Charge Revenue (Coincident vs Non-Coincident Peak)</span>
                                <p className="mt-1">
                                    Large customer demand charges typically have <strong>two components</strong>:
                                </p>
                                <div className="mt-2 pl-4 border-l-2 border-amber-300 space-y-3">
                                    <div>
                                        <p><strong>Coincident Peak (CP) Charges</strong> (~${DC_RATE_STRUCTURE.coincidentPeakChargePerMWMonth.toLocaleString()}/MW-month)</p>
                                        <p className="text-gray-600 text-xs mt-1">
                                            Based on usage during <em>system</em> peak hours. Flexible DCs pay <strong>less</strong> because
                                            they curtail during these critical periods.
                                        </p>
                                    </div>
                                    <div>
                                        <p><strong>Non-Coincident Peak (NCP) Charges</strong> (~${DC_RATE_STRUCTURE.nonCoincidentPeakChargePerMWMonth.toLocaleString()}/MW-month)</p>
                                        <p className="text-gray-600 text-xs mt-1">
                                            Based on the customer&apos;s own monthly peak (any time). Both firm and flexible DCs pay
                                            similar NCP charges based on their installed capacity.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 p-3 bg-amber-50 rounded border border-amber-200">
                                    <p className="text-sm text-amber-900">
                                        <strong>Important nuance:</strong> When comparing &quot;same interconnection&quot; scenarios, flexible DCs
                                        generate <strong>less</strong> CP demand revenue (they curtail during peaks) but similar NCP revenue.
                                        The net benefit to ratepayers comes primarily from reduced infrastructure costs, not increased demand charges.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="mt-6"><strong>Residential Cost Allocation:</strong></p>
                        <p className="text-sm mb-3">
                            The share of net costs allocated to residential customers depends on the utility&apos;s market structure
                            and how well the data center&apos;s tariff payments cover its cost of service.
                            See the <strong>&quot;Market Structures & Cost Allocation Framework&quot;</strong> section below for detailed
                            allocation factors by market type (regulated, PJM, ERCOT, etc.).
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                            <li><strong>Base allocation:</strong> Varies by market (30-40% typical)</li>
                            <li><strong>Cost causation adjustment:</strong> In regulated markets, allocation reduced based on DC cost recovery ratio (formula: Base × √(1 - Cost Recovery))</li>
                            <li><strong>Rate spreading benefit:</strong> High load factor (≥80%) industrial loads spread fixed costs over more kWh, benefiting all ratepayers</li>
                            <li><strong>Regulatory lag:</strong> Changes phase in over ~5 years through rate case proceedings</li>
                            <li><strong>Market multipliers:</strong> ERCOT uses dynamic allocation based on DC penetration; capacity markets use endogenous pricing model</li>
                        </ul>

                        <p className="mt-4 text-sm text-gray-500">
                            The baseline trajectory includes optional escalation factors: {(TIME_PARAMS.generalInflation * 100).toFixed(1)}% annual
                            inflation and {(INFRASTRUCTURE_COSTS.annualBaselineUpgradePercent * 100).toFixed(1)}% annual
                            infrastructure replacement costs. Toggle these in the calculator to see their effect on future bills.
                        </p>
                    </div>
                </Section>

                {/* SUPPLY CURVE */}
                <Section
                    id="hockey-stick"
                    title="Capacity Market Supply Curve"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-6 text-gray-600">
                        <p>
                            In organized capacity markets (PJM, NYISO, MISO), capacity prices are determined through auctions
                            that clear based on the <strong>Variable Resource Requirement (VRR) curve</strong>. This curve creates
                            a non-linear price pattern: prices are stable when reserves are abundant, but spike exponentially
                            as reserve margins decline below the target level.
                        </p>

                        {/* Supply Curve Diagram */}
                        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                            <h4 className="font-semibold text-gray-900 mb-4 text-center">Capacity Price vs. Reserve Margin (VRR Curve)</h4>
                            <div className="bg-white p-4 rounded-lg font-mono text-xs overflow-x-auto">
                                <pre className="text-gray-600">
{`Price ($/MW-day)
    ^
    |
$1,120 | *  Emergency
    |   *
 $700 |      *                                Severe Scarcity
    |           *
 $420 |                *                      Scarcity
    |                     *
 $280 |---------------------*---------------- Target (CONE)
    |                           *
  $28 |                                *      Abundant
  $14 |                                    *
    +-----|-----|-----|-----|-----|-----|---> Reserve Margin
          0%    5%   10%   15%   20%   25%
                     ^
                     |
              Target Reserve Margin (15%)`}
                                </pre>
                            </div>
                            <p className="text-sm text-gray-600 mt-4 text-center">
                                The curve shows how capacity prices respond to changes in reserve margin.
                                Below 15%, prices rise sharply. Below 10%, prices spike exponentially.
                            </p>
                        </div>

                        {/* VRR Curve Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium">Reserve Margin</th>
                                        <th className="text-right py-3 px-4 font-medium">Price Multiplier</th>
                                        <th className="text-right py-3 px-4 font-medium">Capacity Price</th>
                                        <th className="text-left py-3 px-4 font-medium">Condition</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SUPPLY_CURVE.slopes.map((slope, idx) => {
                                        let rowClass = 'border-t border-gray-100';
                                        let condition = 'Abundant';
                                        if (slope.margin < 0.05) {
                                            rowClass += ' bg-red-100';
                                            condition = 'Emergency';
                                        } else if (slope.margin < 0.10) {
                                            rowClass += ' bg-red-50';
                                            condition = 'Severe Scarcity';
                                        } else if (slope.margin < 0.15) {
                                            rowClass += ' bg-amber-50';
                                            condition = 'Scarcity';
                                        } else if (slope.margin === 0.15) {
                                            rowClass += ' bg-blue-50';
                                            condition = 'Target (CONE)';
                                        }
                                        return (
                                            <tr key={idx} className={rowClass}>
                                                <td className="py-2 px-4 font-medium">{(slope.margin * 100).toFixed(0)}%</td>
                                                <td className="py-2 px-4 text-right">{slope.priceMultiplier.toFixed(2)}x</td>
                                                <td className="py-2 px-4 text-right font-medium">
                                                    ${(SUPPLY_CURVE.costOfNewEntry * slope.priceMultiplier).toFixed(0)}/MW-day
                                                </td>
                                                <td className="py-2 px-4 text-gray-600">{condition}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-semibold text-blue-900 mb-2">What is CONE?</p>
                            <p className="text-sm text-gray-700">
                                <strong>CONE (Cost of New Entry)</strong> = ${SUPPLY_CURVE.costOfNewEntry}/MW-day — the estimated cost
                                at which new generation capacity becomes economically viable. When reserve margins hit the target (15%),
                                capacity prices clear at CONE. Our model uses this as the anchor point for the VRR curve.
                                Source:{' '}
                                <a href="https://www.pjm.com/-/media/DotCom/markets-ops/rpm/rpm-resource-demand-doc/variable-resource-requirement-curve.ashx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    PJM VRR Curve Documentation
                                </a>
                            </p>
                        </div>

                        {/* Reserve Margin Calculation */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Reserve Margin Calculation</h4>
                            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto space-y-2">
                                <p><strong>Reserve Margin = (Total Capacity - Peak Load) / Peak Load</strong></p>
                                <p className="text-gray-500 mt-2">Example for AEP Ohio:</p>
                                <p>Old Reserve Margin = (13,200 MW - 12,000 MW) / 12,000 MW = <strong>10%</strong></p>
                                <p className="mt-2">After 1,000 MW data center (100% peak coincidence):</p>
                                <p>New Peak = 12,000 MW + 1,000 MW = 13,000 MW</p>
                                <p>New Reserve Margin = (13,200 MW - 13,000 MW) / 13,000 MW = <strong>1.5%</strong></p>
                                <p className="text-red-600 mt-2">Result: Reserve margin drops from 10% to 1.5% - Capacity prices spike</p>
                            </div>
                        </div>

                        {/* ISO-Level vs Utility-Level Calculations */}
                        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <h4 className="font-semibold text-green-900 mb-3">ISO-Level vs Utility-Level Reserve Margin</h4>
                            <p className="text-sm text-gray-700 mb-3">
                                Capacity markets (PJM, MISO, NYISO) operate at the <strong>ISO/RTO level</strong>, not individual utility level.
                                Reserve margin calculations must reflect this regional scope to accurately model price impacts.
                            </p>
                            <table className="w-full text-sm mb-3">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium">Market Type</th>
                                        <th className="text-left py-2 font-medium">Reserve Margin Scope</th>
                                        <th className="text-left py-2 font-medium">System Peak Used</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-blue-700 font-medium">PJM</td>
                                        <td className="text-xs">ISO-level (PJM-wide)</td>
                                        <td className="text-xs">~150 GW total PJM peak</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-purple-700 font-medium">MISO</td>
                                        <td className="text-xs">ISO-level (MISO-wide)</td>
                                        <td className="text-xs">~127 GW total MISO peak</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-indigo-700 font-medium">NYISO</td>
                                        <td className="text-xs">ISO-level (NYISO-wide)</td>
                                        <td className="text-xs">~32 GW total NYISO peak</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-amber-700 font-medium">ERCOT</td>
                                        <td className="text-xs">ISO-level (energy-only market)</td>
                                        <td className="text-xs">~90 GW total ERCOT peak</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-green-700 font-medium">Regulated/SPP/TVA</td>
                                        <td className="text-xs">Utility-level</td>
                                        <td className="text-xs">Individual utility peak (no shared capacity market)</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-600">
                                <strong>Why this matters:</strong> A 10 GW data center added to a 5 GW utility in PJM impacts the
                                ~150 GW PJM reserve margin (~7% increase), not the utility&apos;s margin alone. The price
                                increase is then borne by that utility&apos;s customers at their share of the ISO-wide impact.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* CAPACITY COST SPILLOVERS */}
                <Section
                    id="socialized-scarcity"
                    title="Capacity Cost Spillovers to Existing Customers"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-6 text-gray-600">
                        <p>
                            When a data center triggers a capacity price increase, the cost isn&apos;t borne by the data center alone.
                            The increased capacity price applies to <strong>all load in the market</strong>, meaning existing
                            residential customers pay higher prices on their existing consumption. This spillover effect
                            has drawn regulatory attention in organized capacity markets.
                        </p>

                        {/* PJM Case Study */}
                        <div className="border border-amber-200 rounded-lg p-5 bg-amber-50">
                            <h4 className="font-semibold text-amber-900 mb-3">
                                Case Study: PJM 2025/26 Capacity Auction
                            </h4>
                            <p className="text-sm text-gray-700 mb-3">
                                PJM&apos;s 2025/26 capacity auction illustrates how rapid load growth can affect prices for all customers.
                                When a large data center adds to system peak, it doesn&apos;t just pay higher capacity prices for its own load—
                                the capacity price increase affects <strong>all existing load</strong>.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-white rounded-lg p-3">
                                    <p className="font-semibold text-amber-800 text-sm mb-1">2025/26 Auction Result</p>
                                    <p className="text-2xl font-bold text-slate-700">$269.92/MW-day</p>
                                    <p className="text-xs text-gray-600">Up from $28.92 the prior year</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="font-semibold text-amber-800 text-sm mb-1">Data Center Attribution</p>
                                    <p className="text-2xl font-bold text-slate-700">63%</p>
                                    <p className="text-xs text-gray-600">Of price increase attributed to DC load growth</p>
                                </div>
                            </div>
                        </div>

                        {/* Socialized Cost Calculation */}
                        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                            <h4 className="font-semibold text-amber-900 mb-3">Socialized Cost Impact Formula</h4>
                            <p className="text-sm text-gray-700 mb-3">
                                When the data center causes capacity prices to rise, existing customers pay the higher
                                price on their <strong>existing load</strong>. This is the &quot;socialization&quot; effect:
                            </p>
                            <div className="bg-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                <p><strong>Socialized Cost = Existing Residential Peak x (New Price - Old Price) x 365 days</strong></p>
                                <p className="text-gray-500 mt-3">Where:</p>
                                <ul className="text-gray-600 mt-2 space-y-1">
                                    <li>- Existing Residential Peak = System Peak x 35% residential share</li>
                                    <li>- Price difference from VRR curve interpolation</li>
                                    <li>- Applied to capacity market utilities only</li>
                                </ul>
                            </div>
                            <p className="text-sm text-amber-800 mt-3">
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-medium text-xs">Model Assumption</span>
                                {' '}We assume 35% of system peak is residential load.
                                This share varies by utility but is consistent with typical embedded cost allocation studies.
                            </p>
                        </div>

                        {/* How Flexibility Helps */}
                        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <h4 className="font-semibold text-green-900 mb-3">How Flexible Data Centers Reduce Price Spikes</h4>
                            <p className="text-sm text-gray-700 mb-3">
                                Flexible data centers that curtail during peak hours add less to system peak, which means:
                            </p>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span><strong>Smaller reserve margin impact:</strong> 75% peak coincidence = 25% less contribution to peak</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span><strong>Lower capacity price increase:</strong> Less reserve margin erosion = smaller price multiplier on VRR curve</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span><strong>Reduced socialized cost:</strong> Existing ratepayers face smaller price increase on their existing load</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span><strong>Onsite generation:</strong> Further reduces net peak draw and capacity market impact</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* AUCTION LAG */}
                <Section
                    id="auction-lag"
                    title="Capacity Auction Timing and Rate Impacts"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-6 text-gray-600">
                        <p>
                            In PJM and other organized capacity markets, the <strong>Base Residual Auction (BRA)</strong> historically
                            cleared approximately 3 years before the delivery year. However, recent schedule changes and accelerated
                            proceedings have compressed this timeline significantly.
                        </p>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-semibold text-amber-900 mb-2">Recent PJM Auction Timeline (Actual)</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• <strong>2025/26 delivery year:</strong> Auction held July 2024 (11 months ahead)</li>
                                <li>• <strong>2026/27 delivery year:</strong> Auction held July 2025 (11 months ahead)</li>
                                <li>• <strong>2027/28 delivery year:</strong> Auction held December 2025 (18 months ahead)</li>
                            </ul>
                            <p className="text-sm text-amber-800 mt-3">
                                Because data center load growth was already factored into these recent auctions, capacity costs
                                are already elevated and flowing through to customer bills. Our model applies capacity costs <strong>immediately</strong> when
                                data centers connect, rather than using a forward auction lag, since current prices already reflect demand growth.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                                <h4 className="font-semibold text-amber-900 mb-2">Direct Infrastructure Costs</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>- Transmission infrastructure upgrades</li>
                                    <li>- Distribution system investments</li>
                                    <li>- Interconnection costs</li>
                                </ul>
                                <p className="text-xs text-amber-800 mt-2 font-medium">
                                    Apply when data center connects
                                </p>
                            </div>
                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                <h4 className="font-semibold text-slate-900 mb-2">Capacity Costs (Immediate)</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>- Capacity auction price impacts</li>
                                    <li>- Applied to all existing load</li>
                                    <li>- Already reflected in current prices</li>
                                </ul>
                                <p className="text-xs text-slate-700 mt-2 font-medium">
                                    Apply when data center connects
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Model Implementation</p>
                            <div className="mt-3 font-mono text-xs bg-white p-3 rounded overflow-x-auto">
                                <p className="text-gray-500">// In trajectory calculations:</p>
                                <p>const marketLag = 0; // Capacity costs apply immediately</p>
                                <p className="mt-2">// Both direct and capacity costs apply when DC connects</p>
                                <p>if (yearsOnline &gt;= 0) {`{`}</p>
                                <p className="pl-4">applyDirectCosts();</p>
                                <p className="pl-4">applyCapacityCosts();</p>
                                <p>{`}`}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Note: We previously modeled a lag for capacity costs, but recent auction timing changes mean
                                current prices already reflect data center demand growth.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* DATA SOURCES & REVENUE ADEQUACY */}
                <Section
                    id="data-sources"
                    title="Data Sources & Revenue Adequacy Analysis"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                    badge="E3 Methodology"
                    badgeColor="bg-green-100 text-green-800"
                >
                    <div className="space-y-6 text-gray-600">
                        <p>
                            Our revenue adequacy analysis follows the methodology from the E3 Study{' '}
                            <a
                                href="https://www.ethree.com/wp-content/uploads/2024/12/Tailored-for-Scale-Designing-Rates-to-Support-Data-Centers-E3-December-2024.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                &quot;Tailored for Scale: Designing Rates to Support Data Centers&quot;
                            </a>{' '}
                            (December 2024), which established the framework for evaluating whether data center tariffs
                            adequately cover incremental infrastructure costs.
                        </p>

                        <p className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <strong>Transparency Note:</strong> Below we document data sources where available.
                            Values marked with <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded font-medium">Model Assumption</span> are
                            based on industry understanding or selected from published ranges, but not directly cited from a specific source.
                            You can substitute your own values in the calculator.
                        </p>

                        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <h4 className="font-semibold text-green-900 mb-3">Revenue Adequacy Framework (E3 Methodology)</h4>
                            <p className="text-sm text-gray-700 mb-3">
                                The E3 study defines <strong>revenue adequacy</strong> as the ratio of data center
                                tariff revenue to the incremental cost of serving that load. A ratio ≥ 100% indicates
                                the tariff fully covers costs; below 100% indicates potential cross-subsidization.
                            </p>
                            <div className="bg-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                <p><strong>Revenue Adequacy Ratio = Annual Tariff Revenue / Annual Incremental Cost</strong></p>
                                <p className="text-gray-500 mt-2">Where:</p>
                                <ul className="text-gray-600 mt-1 space-y-1 text-xs">
                                    <li>- Tariff Revenue = Demand Charges + Energy Charges + Fixed Charges</li>
                                    <li>- Incremental Cost = Transmission + Distribution + Generation Capacity</li>
                                </ul>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Infrastructure Costs</h4>
                                <ul className="text-sm space-y-1">
                                    <li><strong>Transmission:</strong> ${INFRASTRUCTURE_COSTS.transmissionCostPerMW.toLocaleString()}/MW</li>
                                    <li><strong>Distribution:</strong> ${INFRASTRUCTURE_COSTS.distributionCostPerMW.toLocaleString()}/MW</li>
                                    <li><strong>Generation:</strong> ${INFRASTRUCTURE_COSTS.capacityCostPerMWYear.toLocaleString()}/MW-year</li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Revenue Components</h4>
                                <ul className="text-sm space-y-1">
                                    <li><strong>CP Charge:</strong> ${DC_RATE_STRUCTURE.coincidentPeakChargePerMWMonth.toLocaleString()}/MW-mo</li>
                                    <li><strong>NCP Charge:</strong> ${DC_RATE_STRUCTURE.nonCoincidentPeakChargePerMWMonth.toLocaleString()}/MW-mo</li>
                                    <li><strong>Energy Margin:</strong> Varies by market</li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Market Wholesale Costs</h4>
                                <ul className="text-sm space-y-1">
                                    <li><strong>ERCOT:</strong> $45/MWh</li>
                                    <li><strong>PJM:</strong> $42/MWh</li>
                                    <li><strong>MISO:</strong> $35/MWh</li>
                                    <li><strong>NYISO:</strong> $55/MWh</li>
                                </ul>
                            </div>
                        </div>

                        {/* EIA Data */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Energy Information Administration (EIA)
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">U.S. Department of Energy - Electricity Data</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium">Data Point</th>
                                        <th className="text-right py-2 font-medium">Value</th>
                                        <th className="text-left py-2 pl-4 font-medium">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Average residential monthly bill</td>
                                        <td className="text-right font-medium">${DEFAULT_UTILITY.averageMonthlyBill}</td>
                                        <td className="pl-4 text-xs">
                                            <a href="https://www.eia.gov/electricity/sales_revenue_price/pdf/table_5A.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                EIA Table 5A - Average Monthly Bill by State
                                            </a>
                                            <span className="block text-gray-400">National average: ~$138/month (2023)</span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Residential share of total sales</td>
                                        <td className="text-right font-medium">{(DEFAULT_UTILITY.residentialEnergyShare * 100).toFixed(0)}%</td>
                                        <td className="pl-4 text-xs">
                                            <a href="https://www.eia.gov/electricity/annual/html/epa_01_02.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                EIA Electric Power Annual, Table 1.2
                                            </a>
                                            <span className="block text-gray-400">2023: Residential 1,468 TWh of 4,178 TWh total = 35.1%</span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Electricity price inflation</td>
                                        <td className="text-right font-medium">{(TIME_PARAMS.electricityInflation * 100).toFixed(1)}%/yr</td>
                                        <td className="pl-4 text-xs">
                                            <a href="https://www.eia.gov/electricity/annual/html/epa_01_01.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                EIA Electric Power Annual, Table 1.1
                                            </a>
                                            <span className="block text-gray-400">10-year CAGR (2013-2023) for residential rates</span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">General inflation rate</td>
                                        <td className="text-right font-medium">{(TIME_PARAMS.generalInflation * 100).toFixed(1)}%/yr</td>
                                        <td className="pl-4 text-xs">
                                            <a href="https://www.bls.gov/cpi/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                Bureau of Labor Statistics CPI Data
                                            </a>
                                            <span className="block text-gray-400">Federal Reserve 2% target + utility capital cost premium</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Infrastructure Costs */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Transmission & Distribution Infrastructure Costs
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">Based on utility rate cases and regional transmission planning studies</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium">Data Point</th>
                                        <th className="text-right py-2 font-medium">Value</th>
                                        <th className="text-left py-2 pl-4 font-medium">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Transmission cost per MW</td>
                                        <td className="text-right font-medium">{formatCurrency(INFRASTRUCTURE_COSTS.transmissionCostPerMW)}/MW</td>
                                        <td className="pl-4 text-xs">
                                            <a href="https://cdn.misoenergy.org/MTEP23%20Executive%20Summary630586.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                MISO MTEP23 Transmission Expansion Plan
                                            </a>
                                            <span className="block text-gray-400">Range: $200k-$500k/MW; <span className="px-1 bg-amber-100 text-amber-800 rounded">$350k selected as median</span></span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Distribution cost per MW (base)</td>
                                        <td className="text-right font-medium">{formatCurrency(INFRASTRUCTURE_COSTS.distributionCostPerMW)}/MW</td>
                                        <td className="pl-4 text-xs">
                                            <a href="https://docs.nrel.gov/docs/fy18osti/70710.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                NREL: The Cost of Distribution System Upgrades (2018)
                                            </a>
                                            <span className="block text-gray-400">Substation + feeder costs; <span className="px-1 bg-amber-100 text-amber-800 rounded">$150k inferred from study ranges</span></span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Annual infrastructure upgrade rate</td>
                                        <td className="text-right font-medium">{(INFRASTRUCTURE_COSTS.annualBaselineUpgradePercent * 100).toFixed(1)}%</td>
                                        <td className="pl-4 text-xs">
                                            <a href="https://www.brattle.com/wp-content/uploads/2021/10/2021-10-12-Brattle-GridStrategies-Transmission-Planning-Report_v2.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                Brattle/Grid Strategies: Transmission Planning (2021)
                                            </a>
                                            <span className="block text-gray-400">Report cites 1-2% range; <span className="px-1 bg-amber-100 text-amber-800 rounded">1.5% selected as midpoint</span></span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Capacity cost per MW-year</td>
                                        <td className="text-right font-medium">{formatCurrency(INFRASTRUCTURE_COSTS.capacityCostPerMWYear)}/MW-yr</td>
                                        <td className="pl-4 text-xs">
                                            <a href="https://atb.nrel.gov/electricity/2024/fossil_energy_technologies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                NREL ATB 2024: Fossil Energy Technologies
                                            </a>
                                            <span className="block text-gray-400">Range: $98k-$175k/MW-yr; <span className="px-1 bg-amber-100 text-amber-800 rounded">$150k selected as representative</span></span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Additional References */}
                        <div className="mt-4 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Additional Industry References</h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a href="https://www.pjm.com/-/media/DotCom/markets-ops/rpm/rpm-auction-info/2025-2026/2025-2026-base-residual-auction-report.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                        PJM 2025/26 Base Residual Auction Report
                                    </a>
                                    <span className="block text-xs text-gray-500 ml-0">Clearing price $269.92/MW-day RTO; higher in constrained zones</span>
                                </li>
                                <li>
                                    <a href="https://gridstrategiesllc.com/wp-content/uploads/National-Load-Growth-Report-2024.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                        Grid Strategies: National Load Growth Report (Dec 2024)
                                    </a>
                                    <span className="block text-xs text-gray-500 ml-0">Data center contribution to load growth by region; 63% attribution</span>
                                </li>
                                <li>
                                    <a href="https://atb.nrel.gov/electricity/2024/index" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                        NREL Annual Technology Baseline 2024
                                    </a>
                                    <span className="block text-xs text-gray-500 ml-0">Generation technology capital and operating costs</span>
                                </li>
                                <li>
                                    <a href="https://dcflex.epri.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                        EPRI DCFlex Initiative
                                    </a>
                                    <span className="block text-xs text-gray-500 ml-0">45+ industry collaborators validating data center flexibility</span>
                                </li>
                                <li>
                                    <a href="https://www.nerc.com/pa/RAPA/ra/Reliability%20Assessments%20DL/NERC_LTRA_2024.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                        NERC Long-Term Reliability Assessment 2024
                                    </a>
                                    <span className="block text-xs text-gray-500 ml-0">Regional reserve margin projections and reliability assessments</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* WORKLOAD FLEXIBILITY */}
                <Section
                    id="workload-flexibility"
                    title="Workload Flexibility Model"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-6 text-gray-600">
                        <p>
                            Our workload flexibility model is based on the classification of data center workloads
                            by their time-sensitivity and ability to be deferred or curtailed during peak demand periods.
                        </p>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium">Workload Type</th>
                                        <th className="text-right py-3 px-4 font-medium">Share</th>
                                        <th className="text-right py-3 px-4 font-medium">Flexibility</th>
                                        <th className="text-left py-3 px-4 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(WORKLOAD_TYPES).map(([key, workload]) => (
                                        <tr key={key} className="border-t border-gray-100">
                                            <td className="py-2 px-4 font-medium">{workload.name}</td>
                                            <td className="py-2 px-4 text-right">{(workload.percentOfLoad * 100).toFixed(0)}%</td>
                                            <td className="py-2 px-4 text-right">{(workload.flexibility * 100).toFixed(0)}%</td>
                                            <td className="py-2 px-4 text-gray-600 text-xs">{workload.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-semibold text-amber-900 mb-2">Why We Use 25% (Not {(aggregateFlexibility * 100).toFixed(0)}%)</h4>
                            <p className="text-sm text-amber-800">
                                While the theoretical workload analysis suggests ~{(aggregateFlexibility * 100).toFixed(0)}% aggregate flexibility, our model uses
                                a more conservative <strong>25% curtailable</strong> assumption based on:
                            </p>
                            <ul className="list-disc list-inside text-sm text-amber-800 mt-2 space-y-1">
                                <li>Field-validated results from EPRI DCFlex demonstration (see below)</li>
                                <li>Real-world constraints (coordination overhead, workload queuing, IT operations)</li>
                                <li>Reliability margin for grid operators to depend on</li>
                                <li>Conservative baseline that most data centers could achieve without major changes</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-2">EPRI DCFlex Field Demonstration (2024)</h4>
                            <p className="text-sm text-green-800 mb-2">
                                The EPRI DCFlex demonstration at a major hyperscale data center in Phoenix achieved:
                            </p>
                            <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                                <li><strong>25% sustained power reduction</strong> during 3-hour peak grid events</li>
                                <li><strong>Up to 40% reduction</strong> demonstrated while maintaining AI quality of service</li>
                                <li><strong>~90% of workloads</strong> on representative clusters can be preempted (paused/delayed)</li>
                            </ul>
                            <p className="text-sm text-green-800 mt-2">
                                This validates that 25% curtailment is achievable in real-world conditions, with potential
                                for higher reductions as data center operators gain experience with demand response programs.
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-semibold text-blue-900 mb-2">Aggregate Flexibility Calculation</p>
                            <p className="text-sm text-gray-700">
                                Weighted average flexibility = Σ (share × flexibility) = <strong>{(aggregateFlexibility * 100).toFixed(0)}%</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                This represents the theoretical maximum load reduction achievable through workload shifting.
                                The model uses 25% as the validated field value from EPRI DCFlex demonstrations.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* REGIONAL DEMAND FORECASTS */}
                <Section
                    id="demand-forecasts"
                    title="Regional Data Center Demand Forecasts"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                    badge="2027-2035"
                    badgeColor="bg-blue-100 text-blue-800"
                >
                    <div className="space-y-6 text-gray-600">
                        <p>
                            Our calculator models data center growth at the <strong>market level</strong>, not individual projects.
                            This macro-level approach reflects how grid planners and utilities forecast capacity needs across their
                            entire service territory. Growth is phased annually from 2027-2035 (with a 12-month construction lag from 2026).
                        </p>

                        <p className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <strong>Two Scenarios:</strong> The calculator offers <strong>Conservative</strong> (utility IRP-based) and{' '}
                            <strong>Aggressive</strong> (queue data with realistic completion rates) forecasts.
                            <span className="font-medium"> Aggressive is the default</span>, reflecting the rapid growth in interconnection
                            queues observed by SemiAnalysis and other market analysts.
                        </p>

                        {/* Market Forecast Table */}
                        <div className="border border-gray-200 rounded-lg p-4 overflow-x-auto">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Market-Level Growth Projections (2027-2035)
                            </h4>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium">Market</th>
                                        <th className="text-right py-2 font-medium">Current</th>
                                        <th className="text-right py-2 font-medium">Conservative</th>
                                        <th className="text-right py-2 font-medium">Aggressive</th>
                                        <th className="text-left py-2 pl-4 font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(MARKET_FORECASTS).map(([key, market]) => (
                                        <tr key={key} className="border-b border-gray-100">
                                            <td className="py-2 font-medium">{market.marketName}</td>
                                            <td className="text-right">{market.currentCapacityGW.toFixed(1)} GW</td>
                                            <td className="text-right">{market.conservativeGrowthGW} GW</td>
                                            <td className="text-right font-semibold text-blue-700">{market.aggressiveGrowthGW} GW</td>
                                            <td className="pl-4 text-xs text-gray-500">{market.notes}</td>
                                        </tr>
                                    ))}
                                    <tr className="border-t-2 border-gray-300 font-semibold bg-gray-50">
                                        <td className="py-2">National Total</td>
                                        <td className="text-right">~20 GW</td>
                                        <td className="text-right">{getNationalGrowthProjection('conservative').totalGrowthGW} GW</td>
                                        <td className="text-right text-blue-700">{getNationalGrowthProjection('aggressive').totalGrowthGW} GW</td>
                                        <td className="pl-4 text-xs">Sum of market projections</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Methodology */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Growth Allocation Methodology</h4>
                            <ul className="space-y-2 text-sm">
                                <li><strong>Utility Share Calculation:</strong> Utility Peak MW ÷ Market Total Peak MW × Market Growth</li>
                                <li><strong>Annual Growth Rate:</strong> Total Growth ÷ 9 years (2027-2035)</li>
                                <li><strong>Phase-In Model:</strong> Linear cumulative ramp starting Year 2 (2027) through Year 10 (2035)</li>
                                <li><strong>Construction Lag:</strong> 12-month lag from 2026 to account for interconnection and construction timelines</li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* LIMITATIONS */}
                <Section
                    id="limitations"
                    title="Limitations & Caveats"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4 text-gray-600">
                        <p>
                            This model provides order-of-magnitude estimates, not precise predictions.
                            Key limitations include:
                        </p>

                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>
                                <strong>Regional variation:</strong> Infrastructure costs vary by 2-3x depending
                                on location, terrain, and existing grid conditions.
                            </li>
                            <li>
                                <strong>Regulatory uncertainty:</strong> Actual cost allocation depends on
                                state regulatory decisions which vary widely.
                            </li>
                            <li>
                                <strong>Technology change:</strong> Battery costs, renewable prices, and
                                grid technology are evolving rapidly.
                            </li>
                            <li>
                                <strong>Market dynamics:</strong> Wholesale electricity prices fluctuate
                                based on fuel costs, weather, and demand patterns.
                            </li>
                            <li>
                                <strong>Simplified model:</strong> We use linear projections and don&apos;t capture
                                all feedback effects, step changes, or non-linear dynamics.
                            </li>
                            <li>
                                <strong>Demand forecast uncertainty:</strong> Queue data represents interconnection
                                requests, not firm commitments. Historical completion rates (10-15%) are applied,
                                but actual buildout depends on financing, permits, land availability, and utility
                                interconnection capacity.
                            </li>
                            <li>
                                <strong>VRR curve simplified:</strong> Actual ISO implementations have more complex formulations.
                            </li>
                            <li>
                                <strong>Zonal constraints not modeled:</strong> E.g., NYC vs upstate NY have different dynamics.
                            </li>
                        </ul>

                        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <strong>Use appropriately:</strong> This tool is designed for educational purposes
                                and initial analysis. Actual utility planning and rate-making involves much more
                                detailed engineering and economic modeling.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* OPEN SOURCE */}
                <Section
                    id="contribute"
                    title="Open Source & Contributing"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4 text-gray-600">
                        <p>
                            This tool is open source and we welcome contributions:
                        </p>

                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Report bugs or suggest improvements via GitHub issues</li>
                            <li>Submit pull requests with enhanced models or features</li>
                            <li>Share utility-specific data to improve regional accuracy</li>
                            <li>Help translate to make accessible to more communities</li>
                        </ul>

                        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                            <p className="font-mono text-sm text-gray-700">
                                github.com/DougMackenzie/power-insight
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Licensed under MIT License
                            </p>
                        </div>
                    </div>
                </Section>

                {/* AI CARBON */}
                <Section
                    id="carbon"
                    title="Carbon Footprint of This Calculator"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4 text-gray-600">
                        <p>
                            This tool was developed with the assistance of agentic AI (Claude). In the interest of
                            transparency, we estimate and disclose the carbon footprint of that development process.
                        </p>

                        {/* Calculation */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                Carbon Calculation
                                {carbonData?.development?.lastUpdated && (
                                    <span className="text-xs text-gray-400 font-normal ml-auto">
                                        Updated: {carbonData.development.lastUpdated}
                                    </span>
                                )}
                            </h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-slate-700">{(totalTokens / 1000).toFixed(0)}K</p>
                                    <p className="text-xs text-gray-500">Total tokens processed</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-slate-700">{totalKgCO2.toFixed(2)} kg</p>
                                    <p className="text-xs text-gray-500">Estimated CO2 emissions</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-slate-700">{hamburgerEquiv.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500">Hamburger equivalents</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                Based on {gCO2PerK} gCO2/1000 tokens estimate. A hamburger produces approximately {hamburgerKg} kg CO2.
                            </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                                <strong>Context:</strong> The carbon cost of developing this tool is roughly equivalent to
                                driving a car {Math.round(totalKgCO2 * 2.5)}-{Math.round(totalKgCO2 * 5)} miles. We believe the potential
                                value of helping communities understand energy cost allocation significantly outweighs
                                this modest environmental cost.
                            </p>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Contact */}
            <div className="bg-gray-800 text-white rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Questions or Feedback?</h3>
                <p className="text-gray-300 mb-4">
                    If you have questions about the methodology, want to report an error,
                    or have suggestions for improvement, we&apos;d love to hear from you.
                </p>
                <a
                    href="/"
                    className="inline-block px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
                >
                    Back to Calculator
                </a>
            </div>
        </div>
    );
}
