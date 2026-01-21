/**
 * MethodologyPage Component
 *
 * Detailed explanation of the mathematical models and data sources.
 */

import { useState } from 'react';
import {
  INFRASTRUCTURE_COSTS,
  TIME_PARAMS,
  WORKLOAD_TYPES,
  ALLOCATION_METHODS,
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
          Methodology & Sources
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
          <li><strong>Unoptimized:</strong> Data center as firm load, adding to peak demand</li>
          <li><strong>Flexible:</strong> Data center with demand response capability</li>
          <li><strong>Dispatchable:</strong> Demand response plus onsite generation</li>
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

            <p className="mt-4"><strong>Key Insight - Firm vs Flexible:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Firm load:</strong> 80% load factor, 100% contributes to peak demand</li>
              <li><strong>Flexible load:</strong> 95% load factor, only 80% at peak (20% curtailable)</li>
              <li>Same grid can support 25% MORE flexible capacity than firm</li>
            </ul>

            <p className="mt-4"><strong>Revenue Offset:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Demand charges: $9,050/MW-month (based on coincident peak)</li>
              <li>Energy margin: $4.88/MWh (utility's wholesale spread)</li>
              <li>Higher load factor = more energy = more revenue</li>
            </ul>

            <p className="mt-4"><strong>Residential Allocation (Calculated from Tariff Structure):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Starts at ~40% (typical for utilities per FERC/EIA data)</li>
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
                <strong>Aggregate Flexibility:</strong> Based on this mix, approximately 32% of
                total facility load can be shifted to off-peak hours with minimal operational impact.
              </p>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Sources: Google DeepMind carbon-aware computing research, Microsoft sustainability reports,
              academic literature on data center demand response.
            </p>
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
              Our default uses the <strong>hybrid method (40% initial residential allocation)</strong>,
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

        <Section id="sources" title="Data Sources & References">
          <div className="space-y-4 text-gray-600">
            <p>Key data sources used in this model:</p>

            <ul className="space-y-4 mt-4">
              <li>
                <a href="https://www.eia.gov/electricity/data.php" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                  Energy Information Administration (EIA)
                </a>
                <br />
                <span className="text-sm text-gray-500">
                  Electricity data, utility statistics, average retail prices, system capacity
                </span>
                <br />
                <span className="text-xs text-gray-400">
                  Used for: Average monthly bills ($130), residential energy share (35%), baseline rates
                </span>
              </li>
              <li>
                <a href="https://atb.nrel.gov/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                  National Renewable Energy Laboratory (NREL) - Annual Technology Baseline
                </a>
                <br />
                <span className="text-sm text-gray-500">
                  Generation technology costs, capacity factors, cost projections
                </span>
                <br />
                <span className="text-xs text-gray-400">
                  Used for: Peaker capacity costs ($1.2M/MW), generation availability assumptions
                </span>
              </li>
              <li>
                <a href="https://www.ferc.gov/industries-data/electric" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                  Federal Energy Regulatory Commission (FERC) - Electric Industry Data
                </a>
                <br />
                <span className="text-sm text-gray-500">
                  Utility financial filings (Form 1), transmission costs, interconnection data
                </span>
                <br />
                <span className="text-xs text-gray-400">
                  Used for: Transmission costs ($350k/MW), utility rate base data
                </span>
              </li>
              <li>
                <a href="https://www.pjm.com/markets-and-operations/rpm" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                  PJM Interconnection - Capacity Markets
                </a>
                <br />
                <span className="text-sm text-gray-500">
                  Capacity market clearing prices, demand response program data
                </span>
                <br />
                <span className="text-xs text-gray-400">
                  Used for: Capacity costs ($150k/MW-year), demand response value
                </span>
              </li>
              <li>
                <a href="https://www.misoenergy.org/markets-and-operations/resource-adequacy/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                  MISO - Resource Adequacy
                </a>
                <br />
                <span className="text-sm text-gray-500">
                  Planning reserve margins, capacity auction results
                </span>
                <br />
                <span className="text-xs text-gray-400">
                  Used for: Regional capacity value benchmarks, reserve margin requirements
                </span>
              </li>
              <li>
                <a href="https://eta.lbl.gov/publications/united-states-data-center-energy" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                  Lawrence Berkeley National Laboratory - Data Center Energy
                </a>
                <br />
                <span className="text-sm text-gray-500">
                  Data center energy consumption, efficiency trends, demand response potential
                </span>
                <br />
                <span className="text-xs text-gray-400">
                  Used for: Load factors, workload flexibility estimates, PUE assumptions
                </span>
              </li>
              <li>
                <a href="https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=5165411" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                  IEEE Transactions on Smart Grid
                </a>
                <br />
                <span className="text-sm text-gray-500">
                  Academic research on demand response, grid integration, load flexibility
                </span>
                <br />
                <span className="text-xs text-gray-400">
                  Used for: Demand response modeling methodology, curtailment value calculations
                </span>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note on Data Values:</strong> The specific values used in this model (e.g., $9,050/MW-month demand charge,
                $350k/MW transmission cost) represent industry averages and benchmarks. Actual values vary significantly by utility,
                region, and regulatory environment. Users should consult local utility tariffs and regulatory filings for region-specific data.
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
                github.com/community-energy/calculator
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
