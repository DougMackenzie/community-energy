/**
 * HomePage Component
 *
 * Landing page with overview of the tool and key insights.
 */

import TrajectoryChart from '../components/TrajectoryChart';
import SummaryCards from '../components/SummaryCards';
import { useCalculator } from '../hooks/useCalculator';
import { SCENARIOS, formatCurrency } from '../data/constants';

const HomePage = ({ onNavigate }) => {
  const { summary, utility, dataCenter, projectionYears } = useCalculator();

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          How Will a Data Center Affect Your Electricity Bill?
        </h1>
        <p className="text-lg text-green-100 mb-6 max-w-3xl">
          Large data centers are coming to communities across America. This tool helps you
          understand how different approaches to integrating these facilities can impact
          what you pay for electricity.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate('calculator')}
            className="px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
          >
            Try the Calculator
          </button>
          <button
            onClick={() => onNavigate('methodology')}
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors border border-green-500"
          >
            Learn the Methodology
          </button>
        </div>
      </div>

      {/* Key insight */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              The Key Insight: Flexibility Creates Value
            </h2>
            <p className="text-amber-800 mb-3">
              <strong>Firm load</strong> (always-on at 80% utilization) adds 100% of capacity to peak demand,
              requiring expensive infrastructure upgrades. <strong>Flexible load</strong> (95% utilization with
              20% curtailable) only adds 80% to peak - meaning the <em>same grid</em> can support 25% MORE
              data center capacity.
            </p>
            <p className="text-amber-800">
              More capacity at higher utilization means more revenue for the utility, more jobs for the community,
              and less cost per ratepayer. Data centers that pay their fair share through demand charges and
              energy margins help offset infrastructure costs for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* Main visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your Monthly Bill: Four Possible Futures
          </h2>
          <p className="text-gray-600">
            Based on a {dataCenter.capacityMW} MW data center in a community with{' '}
            {utility.residentialCustomers.toLocaleString()} residential customers.
            Click any scenario to show/hide it.
          </p>
        </div>

        <TrajectoryChart height={350} />

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {Object.values(SCENARIOS).map(scenario => (
            <div key={scenario.id} className="p-3 rounded-lg" style={{ backgroundColor: scenario.colorLight }}>
              <p className="text-xs text-gray-600">{scenario.shortName}</p>
              <p className="text-lg font-bold" style={{ color: scenario.color }}>
                ${summary.finalYearBills[scenario.id].toFixed(0)}/mo
              </p>
              <p className="text-xs text-gray-500">in {projectionYears} years</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick summary cards */}
      <SummaryCards compact />

      {/* What you'll learn */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Explore the Scenarios
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              id: 'baseline',
              title: 'Baseline: No New Load',
              description: 'What happens to electricity costs even without a data center? Understand the factors driving rate increases.',
              color: SCENARIOS.baseline.color,
              bgColor: SCENARIOS.baseline.colorLight,
            },
            {
              id: 'unoptimized',
              title: 'Firm Load: The Costly Approach',
              description: 'What happens when a data center runs 24/7 at full capacity with no flexibility? See how infrastructure costs get allocated.',
              color: SCENARIOS.unoptimized.color,
              bgColor: SCENARIOS.unoptimized.colorLight,
            },
            {
              id: 'flexible',
              title: 'Flexible Load: Demand Response',
              description: 'How shifting workloads away from peak hours reduces infrastructure needs and can lower costs for everyone.',
              color: SCENARIOS.flexible.color,
              bgColor: SCENARIOS.flexible.colorLight,
            },
            {
              id: 'dispatchable',
              title: 'Flex + Generation: Best Case',
              description: 'Combining load flexibility with onsite generation creates the most benefit for the community.',
              color: SCENARIOS.dispatchable.color,
              bgColor: SCENARIOS.dispatchable.colorLight,
            },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="p-4 rounded-lg border-2 text-left hover:shadow-md transition-shadow"
              style={{ borderColor: item.color, backgroundColor: item.bgColor }}
            >
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-sm font-medium mt-3" style={{ color: item.color }}>
                Learn more →
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Open source callout */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Open Source & Transparent
        </h3>
        <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
          This tool is open source. All calculations are based on publicly available
          utility data and industry-standard methodologies. Review our assumptions
          and contribute improvements.
        </p>
        <button
          onClick={() => onNavigate('methodology')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          View Methodology & Sources
        </button>
      </div>
    </div>
  );
};

export default HomePage;
