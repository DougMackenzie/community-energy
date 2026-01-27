/**
 * MethodologyPage Component
 *
 * Detailed explanation of the mathematical models and data sources.
 * Expanded to include specific data points pulled from each reference.
 */

import { useState } from 'react';
import {
  INFRASTRUCTURE_COSTS,
  TIME_PARAMS,
  WORKLOAD_TYPES,
  ALLOCATION_METHODS,
  DC_RATE_STRUCTURE,
  DEFAULT_UTILITY,
  DEFAULT_DATA_CENTER,
  formatCurrency,
} from '../data/constants';

const MethodologyPage = ({ onNavigate }) => {
  const [expandedSection, setExpandedSection] = useState('overview');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const Section = ({ id, title, children }) => {
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

  return (
    <div className="space-y-8">
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

      {/* Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Overview</h2>
        <p className="text-gray-600 mb-4">
          Our model projects residential electricity bills under four scenarios:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
          <li><strong>Baseline:</strong> Normal cost growth from infrastructure aging and inflation</li>
          <li><strong>Firm Load:</strong> Data center as firm load, adding 100% to peak demand</li>
          <li><strong>Flexible Load:</strong> Data center with demand response capability (25% curtailable - DCFlex validated)</li>
          <li><strong>Flex + Generation:</strong> Demand response plus onsite generation</li>
        </ol>
        <p className="text-gray-600">
          For each scenario, we calculate infrastructure costs, revenue contributions, and
          allocate net impacts to residential customers based on typical regulatory methods.
        </p>
      </div>

      {/* Detailed sections */}
      <div className="space-y-4">
        <Section id="overview" title="Core Calculation Logic">
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>Basic Formula:</strong>
            </p>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <p>Monthly Impact = (Infrastructure Costs - DC Revenue Offset) × Residential Share / Customers / 12</p>
            </div>

            <p className="mt-4"><strong>Key Insight - Firm vs Flexible (based on EPRI DCFlex 2024):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Firm load:</strong> 80% load factor, 100% contributes to peak demand</li>
              <li><strong>Flexible load:</strong> 95% load factor, only 75% at peak (25% curtailable - DCFlex validated)</li>
              <li>Same grid can support 33% MORE flexible capacity than firm</li>
            </ul>

            <p className="mt-4"><strong>Revenue Offset:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Demand charges: ${DC_RATE_STRUCTURE.demandChargePerMWMonth.toLocaleString()}/MW-month (based on coincident peak)</li>
              <li>Energy margin: ${DC_RATE_STRUCTURE.energyMarginPerMWh}/MWh (utility's wholesale spread)</li>
              <li>Higher load factor = more energy = more revenue</li>
            </ul>

            <p className="mt-4"><strong>Residential Allocation (Calculated from Tariff Structure):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Starts at ~{(DEFAULT_UTILITY.baseResidentialAllocation * 100).toFixed(0)}% (typical for utilities per FERC/EIA data)</li>
              <li><strong>Calculated</strong> based on weighted blend: 40% volumetric, 40% demand, 20% customer</li>
              <li>As DC adds energy → residential volumetric share decreases</li>
              <li>As DC adds to peak → residential demand share decreases</li>
              <li>Regulatory lag: changes phase in over ~5 years through rate cases</li>
            </ul>

            <p className="mt-4">
              The baseline trajectory includes {(TIME_PARAMS.generalInflation * 100).toFixed(1)}% annual
              inflation and {(INFRASTRUCTURE_COSTS.annualBaselineUpgradePercent * 100).toFixed(1)}% annual
              infrastructure replacement costs.
            </p>
          </div>
        </Section>

        <Section id="data-sources" title="Data Sources & Specific Values Used">
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

            {/* PJM/MISO Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                <a href="https://www.pjm.com/markets-and-operations/rpm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  PJM Interconnection & MISO
                </a>
              </h4>
              <p className="text-sm text-gray-500 mb-3">Regional Transmission Organizations - Capacity Market Data</p>
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
                    <td className="py-2">Capacity cost per MW-year</td>
                    <td className="text-right">{formatCurrency(INFRASTRUCTURE_COSTS.capacityCostPerMWYear)}/MW-yr</td>
                    <td className="pl-4 text-gray-500">System capacity procurement cost</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Demand charge rate</td>
                    <td className="text-right">${DC_RATE_STRUCTURE.demandChargePerMWMonth.toLocaleString()}/MW-mo</td>
                    <td className="pl-4 text-gray-500">DC revenue contribution</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Energy margin</td>
                    <td className="text-right">${DC_RATE_STRUCTURE.energyMarginPerMWh}/MWh</td>
                    <td className="pl-4 text-gray-500">DC energy revenue offset</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">DR capacity credit factor</td>
                    <td className="text-right">80%</td>
                    <td className="pl-4 text-gray-500">Value of curtailable load</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* NREL Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                <a href="https://atb.nrel.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  NREL Annual Technology Baseline (ATB)
                </a>
              </h4>
              <p className="text-sm text-gray-500 mb-3">Generation Technology Costs and Performance</p>
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
                    <td className="py-2">Peaker plant capital cost</td>
                    <td className="text-right">{formatCurrency(INFRASTRUCTURE_COSTS.peakerCostPerMW)}/MW</td>
                    <td className="pl-4 text-gray-500">New capacity construction cost</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Generation availability factor</td>
                    <td className="text-right">{(DEFAULT_DATA_CENTER.generationAvailability * 100).toFixed(0)}%</td>
                    <td className="pl-4 text-gray-500">Onsite generation credit calculation</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Generation capacity credit</td>
                    <td className="text-right">95%</td>
                    <td className="pl-4 text-gray-500">Value of dispatchable generation</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* LBNL Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                <a href="https://eta.lbl.gov/publications/united-states-data-center-energy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Lawrence Berkeley National Laboratory (LBNL)
                </a>
              </h4>
              <p className="text-sm text-gray-500 mb-3">Data Center Energy and Demand Response Research</p>
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
                    <td className="py-2">Firm load factor</td>
                    <td className="text-right">{(DEFAULT_DATA_CENTER.firmLoadFactor * 100).toFixed(0)}%</td>
                    <td className="pl-4 text-gray-500">Energy consumption - firm scenario</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Flexible load factor</td>
                    <td className="text-right">{(DEFAULT_DATA_CENTER.flexLoadFactor * 100).toFixed(0)}%</td>
                    <td className="pl-4 text-gray-500">Energy consumption - flex scenario</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Curtailable load percentage</td>
                    <td className="text-right">{((1 - DEFAULT_DATA_CENTER.flexPeakCoincidence) * 100).toFixed(0)}%</td>
                    <td className="pl-4 text-gray-500">Peak demand reduction potential</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">Aggregate workload flexibility</td>
                    <td className="text-right">{(DEFAULT_DATA_CENTER.flexibleLoadPercent * 100).toFixed(0)}%</td>
                    <td className="pl-4 text-gray-500">Shiftable workload fraction</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Industry Research */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Industry Research & Academic Literature
              </h4>
              <p className="text-sm text-gray-500 mb-3">Google DeepMind, Microsoft Sustainability Reports, IEEE Publications</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium">Data Point</th>
                    <th className="text-right py-2 font-medium">Value Used</th>
                    <th className="text-left py-2 pl-4 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(WORKLOAD_TYPES).map(([key, wl]) => (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-2">{wl.name} flexibility</td>
                      <td className="text-right">{(wl.flexibility * 100).toFixed(0)}%</td>
                      <td className="pl-4 text-gray-500">Google/Microsoft sustainability research</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section id="infrastructure" title="Infrastructure Cost Assumptions">
          <div className="space-y-4 text-gray-600">
            <p>
              Infrastructure costs are based on industry benchmarks and regulatory filings:
            </p>

            <table className="w-full mt-4 text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium">Component</th>
                  <th className="text-right py-2 font-medium">Cost</th>
                  <th className="text-left py-2 pl-4 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2">Transmission</td>
                  <td className="text-right">{formatCurrency(INFRASTRUCTURE_COSTS.transmissionCostPerMW)}/MW</td>
                  <td className="pl-4 text-gray-500">EIA, FERC filings</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">Distribution</td>
                  <td className="text-right">{formatCurrency(INFRASTRUCTURE_COSTS.distributionCostPerMW)}/MW</td>
                  <td className="pl-4 text-gray-500">Utility rate cases</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">Peaker Capacity</td>
                  <td className="text-right">{formatCurrency(INFRASTRUCTURE_COSTS.peakerCostPerMW)}/MW</td>
                  <td className="pl-4 text-gray-500">NREL ATB 2024</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">Capacity Purchase</td>
                  <td className="text-right">{formatCurrency(INFRASTRUCTURE_COSTS.capacityCostPerMWYear)}/MW-year</td>
                  <td className="pl-4 text-gray-500">PJM, MISO auctions</td>
                </tr>
              </tbody>
            </table>

            <p className="mt-4 text-sm text-gray-500">
              These are order-of-magnitude estimates. Actual costs vary significantly by region,
              terrain, existing infrastructure, and regulatory environment.
            </p>
          </div>
        </Section>

        <Section id="capacity" title="Capacity Markets & Regulated Territories">
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>How capacity costs work differs significantly between market and regulated territories:</strong>
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Regulated Territories (e.g., PSO/SPP)</h4>
                <ul className="text-sm space-y-2 text-blue-800">
                  <li>• Utility <strong>owns generation</strong> and recovers costs through rate base</li>
                  <li>• No capacity market auction - uses bilateral contracts and self-supply</li>
                  <li>• Capacity "cost" = embedded cost of owned fleet (~$80-120/kW-year)</li>
                  <li>• Must maintain SPP reserve margins (~12-15%)</li>
                  <li>• DC demand charges help offset utility's existing generation costs</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">Market Territories (PJM, MISO)</h4>
                <ul className="text-sm space-y-2 text-amber-800">
                  <li>• Capacity procured through <strong>competitive auctions</strong></li>
                  <li>• Recent PJM: $29-269/MW-day ($10k-$98k/MW-year)</li>
                  <li>• Prices are <strong>rising sharply</strong> due to retirements and load growth</li>
                  <li>• Emergency auctions being implemented for large loads</li>
                  <li>• DCs that bring generation get priority interconnection</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">Capacity Scarcity is Increasing</h4>
              <p className="text-sm text-red-800 mb-2">
                The U.S. power grid faces a growing capacity deficit driven by:
              </p>
              <ul className="text-sm space-y-1 text-red-700">
                <li>• <strong>Load growth:</strong> Data centers, EVs, electrification, reshoring</li>
                <li>• <strong>Retirements:</strong> 80+ GW of coal plants retiring by 2030</li>
                <li>• <strong>Intermittency:</strong> Solar/wind require backup for reliability</li>
                <li>• <strong>Interconnection delays:</strong> 5-7 year queues for new generation</li>
              </ul>
              <p className="text-sm text-red-800 mt-3">
                <strong>Implication:</strong> Capacity values are likely to INCREASE over time.
                Data centers that bring their own generation or provide demand response are
                increasingly valuable because they help address this scarcity rather than worsen it.
              </p>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">How This Model Handles Capacity</h4>
              <ul className="text-sm space-y-2 text-green-800">
                <li>
                  <strong>Base capacity cost:</strong> ${(INFRASTRUCTURE_COSTS.capacityCostPerMWYear / 1000).toFixed(0)}k/MW-year
                  (forward-looking blend of market and regulated costs)
                </li>
                <li>
                  <strong>Demand charge offset:</strong> DC pays ~$108k/MW-year through demand charges,
                  which largely covers capacity costs
                </li>
                <li>
                  <strong>DR capacity credit:</strong> Curtailable load valued at 80% of capacity cost
                  (dispatchable during system peaks)
                </li>
                <li>
                  <strong>Generation capacity credit:</strong> Onsite generation valued at 95% of capacity cost
                  (more reliable than DR)
                </li>
              </ul>
              <p className="text-sm text-green-700 mt-3">
                When DR + generation capacity credits exceed infrastructure costs, the DC provides
                a <strong>net benefit</strong> to other ratepayers.
              </p>
            </div>
          </div>
        </Section>

        <Section id="flexibility" title="Workload Flexibility Model">
          <div className="space-y-4 text-gray-600">
            <p>
              Data center flexibility varies by workload type. Our model uses the following
              breakdown based on industry research:
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
                    <td className="pl-4 text-gray-500 text-xs">{wl.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Aggregate Flexibility:</strong> Based on this mix, approximately 42% of
                total facility load can be shifted to off-peak hours with minimal operational impact.
                This is conservative compared to the DCFlex finding that ~90% of workloads can be preempted.
              </p>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Field Demonstration Results</h4>
              <p className="text-sm text-green-800 mb-2">
                The EPRI DCFlex demonstration at Oracle's Phoenix data center (2024) achieved:
              </p>
              <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                <li><strong>25% sustained power reduction</strong> during 3-hour peak grid events</li>
                <li><strong>Up to 40% reduction</strong> demonstrated while maintaining AI quality of service</li>
                <li><strong>~90% of workloads</strong> on representative clusters can be preempted (paused/delayed)</li>
              </ul>
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
                  {' '}- includes Databricks 90% preemptible workload finding
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
                  {' '}- 45+ industry collaborators including Google, Meta, Microsoft, NVIDIA
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <Section id="allocation" title="Cost Allocation Methods">
          <div className="space-y-4 text-gray-600">
            <p>
              Utility costs are allocated to customer classes using various methods.
              We use a hybrid approach that reflects typical regulatory practice:
            </p>

            <table className="w-full mt-4 text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium">Method</th>
                  <th className="text-right py-2 font-medium">Residential Share</th>
                  <th className="text-left py-2 pl-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ALLOCATION_METHODS).map(([key, method]) => (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-2">{method.name}</td>
                    <td className="text-right">{(method.residentialShare * 100).toFixed(0)}%</td>
                    <td className="pl-4 text-gray-500 text-xs">{method.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-4">
              Our default uses the <strong>hybrid method ({(DEFAULT_UTILITY.baseResidentialAllocation * 100).toFixed(0)}% initial residential allocation)</strong>,
              which reflects typical outcomes from rate cases where multiple allocation factors
              are weighted together.
            </p>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> When large loads are added, residential share of costs
                typically <em>decreases</em> over time. This is because:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
                <li>Large loads pay demand charges that offset fixed costs</li>
                <li>Energy revenue from new load dilutes per-kWh infrastructure costs</li>
                <li>Regulatory rate cases reallocate costs as customer mix changes</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">How This Model Calculates Allocation</h4>
              <p className="text-sm text-green-800 mb-2">
                Rather than assuming a fixed decline rate, we <strong>calculate</strong> the residential
                allocation based on actual tariff structure mechanics:
              </p>
              <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                <li><strong>Volumetric share (40% weight):</strong> Residential energy ÷ total system energy</li>
                <li><strong>Demand share (40% weight):</strong> Residential peak contribution ÷ total system peak</li>
                <li><strong>Customer share (20% weight):</strong> Residential customers ÷ total customers</li>
              </ul>
              <p className="text-sm text-green-800 mt-3">
                <strong>When a DC comes online:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-green-700 space-y-1 mt-1">
                <li>System energy increases → residential volumetric share <em>decreases</em></li>
                <li>System peak increases → residential demand share <em>decreases</em> (more for firm load, less for flex)</li>
                <li>Customer count essentially unchanged (DC is 1 customer vs 560k+ residential)</li>
              </ul>
              <p className="text-sm text-green-800 mt-3">
                <strong>Regulatory lag:</strong> Changes don't happen immediately. We model a 5-year
                phase-in period to reflect the typical rate case cycle where allocations are updated.
              </p>
            </div>
          </div>
        </Section>

        <Section id="limitations" title="Limitations & Caveats">
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

        <Section id="contribute" title="Open Source & Contributing">
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
      </div>

      {/* Contact */}
      <div className="bg-gray-800 text-white rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Questions or Feedback?</h3>
        <p className="text-gray-300 mb-4">
          If you have questions about the methodology, want to report an error,
          or have suggestions for improvement, we'd love to hear from you.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
          >
            Back to Calculator
          </button>
        </div>
      </div>
    </div>
  );
};

export default MethodologyPage;
