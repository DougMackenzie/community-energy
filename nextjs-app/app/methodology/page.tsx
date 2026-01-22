'use client';

import { useState } from 'react';
import {
    INFRASTRUCTURE_COSTS,
    TIME_PARAMS,
    WORKLOAD_TYPES,
    DEFAULT_UTILITY,
    DEFAULT_DATA_CENTER,
    formatCurrency,
} from '@/lib/constants';

interface SectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    expandedSection: string | null;
    toggleSection: (id: string) => void;
}

const Section = ({ id, title, children, expandedSection, toggleSection }: SectionProps) => {
    const isExpanded = expandedSection === id;
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => toggleSection(id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <h3 className="font-semibold text-gray-900">{title}</h3>
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

export default function MethodologyPage() {
    const [expandedSection, setExpandedSection] = useState<string | null>('overview');

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const DC_RATE_STRUCTURE = {
        demandChargePerMWMonth: 9050,
        energyMarginPerMWh: 4.88,
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
            {/* Header */}
            <div className="bg-gray-100 rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Methodology & Data Sources
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl">
                    This tool uses industry-standard methodologies and publicly available data
                    to project electricity cost impacts. Below we explain our models, assumptions,
                    and data sources so you can verify and critique our approach.
                </p>
            </div>

            {/* Model Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Overview</h2>
                <p className="text-gray-600 mb-4">
                    Our model projects residential electricity bills under four scenarios:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                    <li><strong>Baseline:</strong> Normal cost growth from infrastructure aging and inflation</li>
                    <li><strong>Firm Load:</strong> Data center operates at constant power, adding 100% of capacity to system peak</li>
                    <li><strong>Flexible Load:</strong> Data center reduces load by 25% during peak hours by deferring non-time-sensitive workloads</li>
                    <li><strong>Flex + Dispatchable:</strong> Flexible operation plus onsite generation to further reduce grid draw during peaks</li>
                </ol>
                <p className="text-gray-600 mb-4">
                    For each scenario, we calculate infrastructure costs, revenue contributions, and
                    allocate net impacts to residential customers based on market-specific regulatory methods.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg text-sm">
                    <p className="font-semibold text-gray-900 mb-2">About the Flexibility Assumptions</p>
                    <p className="text-gray-600">
                        The 25% peak reduction capability is based on{' '}
                        <a href="https://msites.epri.com/dcflex" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            EPRI's DCFlex initiative
                        </a>
                        , a 2024 field demonstration at a major data center that achieved 25% sustained power reduction
                        during 3-hour peak events. While theoretical flexibility from workload analysis suggests up to 42%
                        is possible, the 25% figure represents a conservative, field-validated baseline. See the
                        <strong> Workload Flexibility Model</strong> section for details.
                    </p>
                </div>
            </div>

            {/* Detailed sections */}
            <div className="space-y-4">
                <Section
                    id="overview"
                    title="Core Calculation Logic"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4 text-gray-600">
                        <p><strong>Basic Formula:</strong></p>
                        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            <p>Monthly Impact = (Infrastructure Costs − DC Revenue Offset) × Residential Allocation / Customers / 12</p>
                        </div>

                        <p className="mt-6"><strong>Key Terms Explained:</strong></p>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                            <div>
                                <span className="font-semibold">Load Factor:</span> Average power draw ÷ nameplate capacity.
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
                                This is more efficient than running at constant 80% regardless of grid conditions.
                            </p>
                        </div>

                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-semibold text-green-900 mb-2">Grid Capacity Math: Why 33% More?</p>
                            <p className="text-sm text-green-800">
                                If a grid has X MW of available capacity for new load:
                            </p>
                            <ul className="list-disc list-inside text-sm text-green-800 mt-2 space-y-1">
                                <li><strong>Firm load</strong> (100% peak): Grid supports X MW of data center capacity</li>
                                <li><strong>Flexible load</strong> (75% peak): Grid supports X ÷ 0.75 = <strong>1.33X MW</strong> of data center capacity</li>
                            </ul>
                            <p className="text-sm text-green-800 mt-2">
                                Result: <strong>33% more data center capacity</strong> can connect to the same grid infrastructure
                                when operating flexibly, because each MW only adds 0.75 MW to the system peak.
                            </p>
                        </div>

                        <p className="mt-6"><strong>Revenue Offset:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Demand charges: ${DC_RATE_STRUCTURE.demandChargePerMWMonth.toLocaleString()}/MW-month (based on coincident peak contribution)</li>
                            <li>Energy margin: ${DC_RATE_STRUCTURE.energyMarginPerMWh}/MWh (utility's wholesale spread on energy sales)</li>
                            <li>Higher load factor = more energy sold = more revenue to offset infrastructure costs</li>
                        </ul>

                        <p className="mt-6"><strong>Residential Cost Allocation:</strong></p>
                        <p className="text-sm mb-3">
                            The share of net costs allocated to residential customers depends on the utility's market structure.
                            See the <strong>"Market Structures & Cost Allocation Framework"</strong> section below for detailed
                            allocation factors by market type (regulated, PJM, ERCOT, etc.).
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li><strong>Base allocation:</strong> Varies by market (30-40% typical)</li>
                            <li><strong>Calculation method:</strong> Weighted blend of 40% volumetric (kWh), 40% demand (peak MW), 20% customer count</li>
                            <li><strong>Dynamic adjustment:</strong> As data center adds energy and peak, residential shares shift</li>
                            <li><strong>Regulatory lag:</strong> Changes phase in over ~5 years through rate case proceedings</li>
                            <li><strong>Market multipliers:</strong> ERCOT applies 0.85× (large loads face prices directly); high PJM capacity prices increase allocation</li>
                        </ul>

                        <p className="mt-4 text-sm text-gray-500">
                            The baseline trajectory includes {(TIME_PARAMS.generalInflation * 100).toFixed(1)}% annual
                            inflation and {(INFRASTRUCTURE_COSTS.annualBaselineUpgradePercent * 100).toFixed(1)}% annual
                            infrastructure replacement costs.
                        </p>
                    </div>
                </Section>

                <Section
                    id="data-sources"
                    title="Data Sources & Specific Values Used"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-6 text-gray-600">
                        <p className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <strong>Transparency Note:</strong> Below we document exactly which data points were pulled from each source
                            and how they are used in the model. This allows you to verify our assumptions or substitute your own values.
                        </p>

                        {/* EIA Data */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                <a href="https://www.eia.gov/electricity/data.php" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Energy Information Administration (EIA)
                                </a>
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">U.S. Department of Energy - Electricity Data Browser</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium">Data Point</th>
                                        <th className="text-right py-2 font-medium">Value Used</th>
                                        <th className="text-left py-2 pl-4 font-medium">How We Use It</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Average residential monthly bill</td>
                                        <td className="text-right">${DEFAULT_UTILITY.averageMonthlyBill}</td>
                                        <td className="pl-4 text-gray-500">Starting point for projections</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Residential share of total sales</td>
                                        <td className="text-right">{(DEFAULT_UTILITY.residentialEnergyShare * 100).toFixed(0)}%</td>
                                        <td className="pl-4 text-gray-500">Volumetric allocation calculation</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Typical residential customer count</td>
                                        <td className="text-right">{DEFAULT_UTILITY.residentialCustomers.toLocaleString()}</td>
                                        <td className="pl-4 text-gray-500">Per-household cost division</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Electricity price inflation (historical)</td>
                                        <td className="text-right">{(TIME_PARAMS.electricityInflation * 100).toFixed(1)}%/yr</td>
                                        <td className="pl-4 text-gray-500">Baseline trajectory escalation</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* FERC Data */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                <a href="https://www.ferc.gov/industries-data/electric" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Federal Energy Regulatory Commission (FERC)
                                </a>
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">Form 1 Utility Financial Filings, Transmission Cost Studies</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium">Data Point</th>
                                        <th className="text-right py-2 font-medium">Value Used</th>
                                        <th className="text-left py-2 pl-4 font-medium">How We Use It</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Transmission cost per MW</td>
                                        <td className="text-right">{formatCurrency(INFRASTRUCTURE_COSTS.transmissionCostPerMW)}/MW</td>
                                        <td className="pl-4 text-gray-500">Infrastructure cost for new load</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Distribution cost per MW</td>
                                        <td className="text-right">{formatCurrency(INFRASTRUCTURE_COSTS.distributionCostPerMW)}/MW</td>
                                        <td className="pl-4 text-gray-500">Local grid upgrade costs</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Base residential allocation</td>
                                        <td className="text-right">{(DEFAULT_UTILITY.baseResidentialAllocation * 100).toFixed(0)}%</td>
                                        <td className="pl-4 text-gray-500">Starting cost allocation share</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Annual infrastructure upgrade rate</td>
                                        <td className="text-right">{(INFRASTRUCTURE_COSTS.annualBaselineUpgradePercent * 100).toFixed(1)}%</td>
                                        <td className="pl-4 text-gray-500">Baseline cost escalation</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Continue with more detailed data sources similar to original... */}
                        <div className="mt-4 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Additional Industry References</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="https://www.pjm.com/markets-and-operations/rpm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        PJM Interconnection & MISO
                                    </a> - Capacity Market Data
                                </li>
                                <li>
                                    <a href="https://atb.nrel.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        NREL Annual Technology Baseline (ATB)
                                    </a> - Generation Technology Costs
                                </li>
                                <li>
                                    <a href="https://eta.lbl.gov/publications/united-states-data-center-energy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        Lawrence Berkeley National Laboratory (LBNL)
                                    </a> - Data Center Energy Research
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                <Section
                    id="flexibility"
                    title="Workload Flexibility Model"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4 text-gray-600">
                        <p>
                            Data center flexibility varies by workload type. The table below shows the theoretical
                            flexibility potential based on typical workload mix:
                        </p>

                        <table className="w-full mt-4 text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 font-medium">Workload Type</th>
                                    <th className="text-right py-2 font-medium">% of Load</th>
                                    <th className="text-right py-2 font-medium">Flexibility</th>
                                    <th className="text-left py-2 pl-4 font-medium">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(WORKLOAD_TYPES).map(([key, wl]) => (
                                    <tr key={key} className="border-b border-gray-100">
                                        <td className="py-2">{wl.name}</td>
                                        <td className="text-right">{(wl.percentOfLoad * 100).toFixed(0)}%</td>
                                        <td className="text-right">{(wl.flexibility * 100).toFixed(0)}%</td>
                                        <td className="pl-4 text-gray-500 text-xs">{wl.description}</td></tr>
                                ))}
                                <tr className="border-t-2 border-gray-300 font-semibold">
                                    <td className="py-2">Theoretical Aggregate</td>
                                    <td className="text-right">100%</td>
                                    <td className="text-right">~42%</td>
                                    <td className="pl-4 text-gray-500 text-xs">Weighted sum of flexibility by load share</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-semibold text-amber-900 mb-2">Why We Use 25% (Not 42%)</h4>
                            <p className="text-sm text-amber-800">
                                While the theoretical workload analysis suggests ~42% aggregate flexibility, our model uses
                                a more conservative <strong>25% curtailable</strong> assumption based on:
                            </p>
                            <ul className="list-disc list-inside text-sm text-amber-800 mt-2 space-y-1">
                                <li>Field-validated results from EPRI DCFlex demonstration (see below)</li>
                                <li>Real-world constraints (coordination overhead, workload queuing, IT operations)</li>
                                <li>Reliability margin for grid operators to depend on</li>
                                <li>Conservative baseline that most data centers could achieve without major changes</li>
                            </ul>
                        </div>

                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
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

                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Data Sources:</p>
                            <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                                <li>
                                    <a href="https://spectrum.ieee.org/dcflex-data-center-flexibility" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        IEEE Spectrum: Big Tech Tests Data Center Flexibility (2024)
                                    </a>
                                </li>
                                <li>
                                    <a href="https://arxiv.org/html/2507.00909v1" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        arXiv: Turning AI Data Centers into Grid-Interactive Assets - Phoenix Field Demonstration
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.latitudemedia.com/news/catalyst-the-mechanics-of-data-center-flexibility/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        Latitude Media: The Mechanics of Data Center Flexibility (2024)
                                    </a>
                                    {' '}- includes 90% preemptible workload finding
                                </li>
                                <li>
                                    <a href="https://cloud.google.com/blog/products/infrastructure/using-demand-response-to-reduce-data-center-power-consumption" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        Google Cloud: Using Demand Response to Reduce Data Center Power Consumption
                                    </a>
                                </li>
                                <li>
                                    <a href="https://msites.epri.com/dcflex" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        EPRI DCFlex Initiative
                                    </a>
                                    {' '}- 45+ industry collaborators including major cloud and AI companies
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                <Section
                    id="market-structures"
                    title="Market Structures & Cost Allocation Framework"
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-6 text-gray-600">
                        <p>
                            Cost allocation to residential customers varies significantly based on the market structure
                            in which a utility operates. Our model adjusts allocation factors based on five distinct market types.
                        </p>

                        {/* Regulated Markets */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                Regulated / Vertically Integrated Markets
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">
                                Duke Energy Carolinas, Georgia Power, APS Arizona, NV Energy, Xcel Colorado
                            </p>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 font-medium">Base Residential Allocation</td>
                                        <td className="text-right">40%</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 font-medium">Capacity Cost Pass-Through</td>
                                        <td className="text-right">40%</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 font-medium">Utility Owns Generation</td>
                                        <td className="text-right">Yes</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="mt-3 text-sm text-gray-500">
                                <strong>Allocation Method:</strong> Infrastructure costs allocated through traditional rate base using
                                cost-of-service methodology. State PUC sets rates based on embedded costs. Residential share based on
                                weighted blend: 40% volumetric (kWh), 40% demand (peak contribution), 20% customer count.
                            </p>
                            <p className="mt-2 text-xs text-gray-400">
                                Source:{' '}
                                <a href="https://www.ferc.gov/industries-data/electric/electric-power-markets/cost-service-regulation"
                                   target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    FERC Cost of Service Regulation
                                </a>
                            </p>
                        </div>

                        {/* PJM Markets */}
                        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                PJM Capacity Market
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">
                                Dominion Virginia, AEP Ohio, AEP I&M, Appalachian Power
                            </p>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-amber-100">
                                        <td className="py-2 font-medium">Base Residential Allocation</td>
                                        <td className="text-right">35%</td>
                                    </tr>
                                    <tr className="border-b border-amber-100">
                                        <td className="py-2 font-medium">Capacity Cost Pass-Through</td>
                                        <td className="text-right">50%</td>
                                    </tr>
                                    <tr className="border-b border-amber-100">
                                        <td className="py-2 font-medium">2024 Capacity Price</td>
                                        <td className="text-right font-bold text-amber-700">$269.92/MW-day</td>
                                    </tr>
                                    <tr className="border-b border-amber-100">
                                        <td className="py-2 font-medium">Price vs Historical</td>
                                        <td className="text-right text-red-600">~10× increase</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="mt-3 text-sm text-gray-600">
                                <strong>Allocation Method:</strong> PJM's Reliability Pricing Model (RPM) capacity auction cleared at
                                $269.92/MW-day for 2025/26, a 10× increase attributed to 63% from data center load growth. Capacity costs
                                flow through retail suppliers to customers. Our model increases residential allocation by up to 15% when
                                capacity prices exceed $100/MW-day to reflect cost pressure spreading across customer classes.
                            </p>
                            <div className="mt-3 space-y-1 text-xs text-gray-400">
                                <p>Sources:</p>
                                <ul className="list-disc list-inside ml-2">
                                    <li>
                                        <a href="https://www.pjm.com/-/media/markets-ops/rpm/rpm-auction-info/2025-2026/2025-2026-base-residual-auction-report.ashx"
                                           target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            PJM 2025/26 Base Residual Auction Report (July 2024)
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.utilitydive.com/news/pjm-capacity-auction-price-data-centers/721147/"
                                           target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Utility Dive: Data Centers Drive PJM Capacity Price Surge
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.gridstrategiesllc.com/research"
                                           target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Grid Strategies LLC: Load Growth Analysis
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* ERCOT */}
                        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                ERCOT Energy-Only Market
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">
                                Texas Grid (ERCOT)
                            </p>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-green-100">
                                        <td className="py-2 font-medium">Base Residential Allocation</td>
                                        <td className="text-right">30%</td>
                                    </tr>
                                    <tr className="border-b border-green-100">
                                        <td className="py-2 font-medium">Capacity Cost Pass-Through</td>
                                        <td className="text-right">25%</td>
                                    </tr>
                                    <tr className="border-b border-green-100">
                                        <td className="py-2 font-medium">Capacity Market</td>
                                        <td className="text-right">None (energy-only)</td>
                                    </tr>
                                    <tr className="border-b border-green-100">
                                        <td className="py-2 font-medium">Allocation Adjustment</td>
                                        <td className="text-right">× 0.85 (lower)</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="mt-3 text-sm text-gray-600">
                                <strong>Allocation Method:</strong> ERCOT operates an energy-only market with no capacity payments.
                                Large loads face wholesale price signals more directly through retail competition. Our model applies
                                an 0.85× multiplier to residential allocation since infrastructure costs are more directly borne by
                                the loads causing them. Transmission costs (ERCOT nodal pricing) still flow to ratepayers. Data centers
                                account for 46% of projected load growth.
                            </p>
                            <div className="mt-3 space-y-1 text-xs text-gray-400">
                                <p>Sources:</p>
                                <ul className="list-disc list-inside ml-2">
                                    <li>
                                        <a href="https://www.ercot.com/gridmktinfo/dashboards/longterm"
                                           target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            ERCOT Long-Term Load Forecast
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.potomaceconomics.com/wp-content/uploads/2024/05/2023-State-of-the-Market-Report.pdf"
                                           target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Potomac Economics: 2024 ERCOT State of the Market
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.puc.texas.gov/industry/electric/reports/"
                                           target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Texas PUC Industry Reports
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* SPP */}
                        <div className="border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                SPP (Southwest Power Pool)
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">
                                PSO Oklahoma, SWEPCO
                            </p>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 font-medium">Base Residential Allocation</td>
                                        <td className="text-right">40%</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 font-medium">Capacity Cost Pass-Through</td>
                                        <td className="text-right">40%</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 font-medium">Capacity Market</td>
                                        <td className="text-right">None (bilateral)</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="mt-3 text-sm text-gray-500">
                                <strong>Allocation Method:</strong> SPP operates an energy market but no mandatory capacity market.
                                Resource adequacy achieved through bilateral contracts. Many vertically integrated utilities operate within SPP.
                                Cost allocation similar to traditional regulated markets.
                            </p>
                            <p className="mt-2 text-xs text-gray-400">
                                Source:{' '}
                                <a href="https://www.spp.org/markets-operations/"
                                   target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    SPP Markets & Operations
                                </a>
                            </p>
                        </div>

                        {/* MISO */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                                MISO Capacity Market
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">
                                (Reference market - lower capacity prices than PJM)
                            </p>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 font-medium">Base Residential Allocation</td>
                                        <td className="text-right">38%</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 font-medium">2024 Capacity Price</td>
                                        <td className="text-right">~$30/MW-day</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="mt-3 text-sm text-gray-500">
                                MISO's Planning Resource Auction clears at significantly lower prices than PJM due to different
                                market design and resource mix. Many vertically integrated utilities still operate within MISO.
                            </p>
                            <p className="mt-2 text-xs text-gray-400">
                                Source:{' '}
                                <a href="https://www.misoenergy.org/markets-and-operations/resource-adequacy/"
                                   target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    MISO Resource Adequacy
                                </a>
                            </p>
                        </div>

                        {/* Allocation Formula */}
                        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Market-Adjusted Allocation Formula</h4>
                            <div className="bg-white p-4 rounded font-mono text-sm overflow-x-auto">
                                <p className="mb-2">Adjusted Allocation = Base Allocation × Market Multiplier</p>
                                <p className="text-gray-500 text-xs mt-3">Where Market Multiplier:</p>
                                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                                    <li>• Regulated/SPP: 1.0 (no adjustment)</li>
                                    <li>• PJM with high capacity prices (&gt;$100/MW-day): 1.0 to 1.15</li>
                                    <li>• ERCOT: 0.85 (large loads face prices directly)</li>
                                </ul>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">
                                Final allocation clamped to 20-55% range to maintain reasonable bounds regardless of market conditions.
                            </p>
                        </div>
                    </div>
                </Section>

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
                                <strong>Simplified model:</strong> We use linear projections and don't capture
                                all feedback effects, step changes, or non-linear dynamics.
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
                                github.com/DougMackenzie/community-energy
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Licensed under MIT License
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
                    or have suggestions for improvement, we'd love to hear from you.
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
