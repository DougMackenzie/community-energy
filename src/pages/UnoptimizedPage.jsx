/**
 * UnoptimizedPage Component
 *
 * Explains the impact of firm, always-on data center load.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useCalculator } from '../hooks/useCalculator';
import { SCENARIOS, formatCurrency, INFRASTRUCTURE_COSTS } from '../data/constants';

const UnoptimizedPage = ({ onNavigate }) => {
  const { trajectories, utility, dataCenter, projectionYears } = useCalculator();

  const baselineFinal = trajectories.baseline[trajectories.baseline.length - 1];
  const unoptimizedFinal = trajectories.unoptimized[trajectories.unoptimized.length - 1];
  const additionalCost = unoptimizedFinal.monthlyBill - baselineFinal.monthlyBill;

  // Get infrastructure costs from metrics
  const metrics = trajectories.unoptimized[trajectories.unoptimized.length - 1].metrics;

  // Chart data comparing baseline to unoptimized
  const comparisonData = trajectories.baseline.map((point, i) => ({
    year: point.year,
    baseline: point.monthlyBill,
    unoptimized: trajectories.unoptimized[i].monthlyBill,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="rounded-2xl p-8"
        style={{ backgroundColor: SCENARIOS.unoptimized.colorLight }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: SCENARIOS.unoptimized.color }}
          />
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Scenario 2
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Firm Load: The Costly Approach
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          When a data center operates as "firm" load - running 24/7 at full capacity
          with no flexibility - it adds directly to peak demand. This triggers expensive
          infrastructure investments that get passed on to all ratepayers.
        </p>
      </div>

      {/* Impact summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border-2 border-red-200 text-center">
          <p className="text-sm text-gray-600 mb-1">
            {additionalCost >= 0 ? 'Additional Monthly Cost' : 'Monthly Savings'}
          </p>
          <p className="text-3xl font-bold" style={{ color: additionalCost >= 0 ? SCENARIOS.unoptimized.color : '#10B981' }}>
            {additionalCost >= 0 ? `+$${additionalCost.toFixed(2)}` : `-$${Math.abs(additionalCost).toFixed(2)}`}
          </p>
          <p className="text-sm text-gray-500">per household vs baseline</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-1">Peak Demand Added</p>
          <p className="text-3xl font-bold text-gray-900">
            {dataCenter.capacityMW} MW
          </p>
          <p className="text-sm text-gray-500">100% adds to system peak</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-1">Infrastructure Required</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency((metrics?.transmissionCost || 0) + (metrics?.distributionCost || 0))}
          </p>
          <p className="text-sm text-gray-500">transmission & distribution</p>
        </div>
      </div>

      {/* The problem explained */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Why Firm Load Is Expensive for Everyone
        </h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Adds 100% of Capacity to Peak Demand</h3>
              <p className="text-gray-600">
                A {dataCenter.capacityMW} MW firm data center at {((dataCenter.firmLoadFactor || 0.80) * 100).toFixed(0)}% load factor
                adds the full {dataCenter.capacityMW} MW to system peak. During the hottest summer afternoons
                when everyone runs AC, the data center draws full power too - this is when infrastructure
                is most stressed and expensive.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Triggers Infrastructure Investments</h3>
              <p className="text-gray-600">
                New transmission lines cost ~{formatCurrency(INFRASTRUCTURE_COSTS.transmissionCostPerMW)}/MW.
                For {dataCenter.capacityMW} MW of firm load, that's {formatCurrency(dataCenter.capacityMW * INFRASTRUCTURE_COSTS.transmissionCostPerMW)} in
                new transmission alone - plus distribution upgrades and additional generation capacity.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Costs Allocated Across All Customers</h3>
              <p className="text-gray-600">
                The data center pays demand charges (~$9,050/MW-month) and energy costs, which helps offset
                infrastructure investments. However, initially about 40% of remaining costs are allocated to
                residential customers. Over time, this share decreases as the large load absorbs more
                of the utility's fixed costs - but the transition can take years.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">4</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">No Flexibility Benefits</h3>
              <p className="text-gray-600">
                A firm load can't help during grid emergencies. When the grid is stressed, a firm
                data center keeps drawing full power, potentially contributing to blackouts rather
                than helping avoid them.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Baseline vs. Firm Load
        </h2>
        <p className="text-gray-600 mb-6">
          The gap between these lines represents the additional cost burden on ratepayers.
        </p>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(value) => [`$${value.toFixed(2)}/mo`]}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <ReferenceLine
              y={utility.averageMonthlyBill}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              label={{ value: 'Current', position: 'right', fill: '#9ca3af' }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              stroke={SCENARIOS.baseline.color}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Baseline (No DC)"
            />
            <Line
              type="monotone"
              dataKey="unoptimized"
              stroke={SCENARIOS.unoptimized.color}
              strokeWidth={3}
              dot={false}
              name="With Firm Load DC"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Annotation */}
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 text-sm">
            <strong>The shaded area</strong> between the lines represents {formatCurrency(additionalCost * 12 * utility.residentialCustomers)} per year
            in additional costs across all {utility.residentialCustomers.toLocaleString()} residential customers.
          </p>
        </div>
      </div>

      {/* What could be different */}
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          But What If the Data Center Was Flexible?
        </h3>
        <p className="text-amber-800 mb-4">
          The problem isn't data centers themselves - it's <em>how</em> they connect to the grid.
          Many data center workloads can be shifted to off-peak hours or temporarily reduced
          during grid stress. This changes everything.
        </p>
        <button
          onClick={() => onNavigate('flexible')}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          See the Flexible Load Scenario →
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={() => onNavigate('baseline')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back: Baseline
        </button>
        <button
          onClick={() => onNavigate('flexible')}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
        >
          Next: Flexible Load
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UnoptimizedPage;
