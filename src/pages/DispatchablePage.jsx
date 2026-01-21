/**
 * DispatchablePage Component
 *
 * Explains the optimal scenario with both demand response AND onsite generation.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useCalculator } from '../hooks/useCalculator';
import { SCENARIOS, formatCurrency, calculateAggregateFlexibility } from '../data/constants';

const DispatchablePage = ({ onNavigate }) => {
  const { trajectories, utility, dataCenter, projectionYears } = useCalculator();

  const baselineFinal = trajectories.baseline[trajectories.baseline.length - 1];
  const unoptimizedFinal = trajectories.unoptimized[trajectories.unoptimized.length - 1];
  const flexibleFinal = trajectories.flexible[trajectories.flexible.length - 1];
  const dispatchableFinal = trajectories.dispatchable[trajectories.dispatchable.length - 1];

  const savingsVsUnoptimized = unoptimizedFinal.monthlyBill - dispatchableFinal.monthlyBill;
  const savingsVsFlexible = flexibleFinal.monthlyBill - dispatchableFinal.monthlyBill;
  const impactVsBaseline = dispatchableFinal.monthlyBill - baselineFinal.monthlyBill;

  const dispatchMetrics = trajectories.dispatchable[trajectories.dispatchable.length - 1].metrics || {};
  const aggregateFlexibility = calculateAggregateFlexibility();
  const onsiteGenMW = dataCenter.onsiteGenerationMW || dataCenter.capacityMW * 0.2;

  // Calculate total grid relief (DR + generation)
  const curtailableMW = dataCenter.capacityMW * (1 - (dataCenter.flexPeakCoincidence || 0.80));
  const totalGridReliefMW = curtailableMW + onsiteGenMW;
  const effectivePeakMW = Math.max(0, dataCenter.capacityMW * (dataCenter.flexPeakCoincidence || 0.80) - onsiteGenMW);

  // All scenarios comparison
  const comparisonData = trajectories.baseline.map((point, i) => ({
    year: point.year,
    baseline: point.monthlyBill,
    unoptimized: trajectories.unoptimized[i].monthlyBill,
    flexible: trajectories.flexible[i].monthlyBill,
    dispatchable: trajectories.dispatchable[i].monthlyBill,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="rounded-2xl p-8"
        style={{ backgroundColor: SCENARIOS.dispatchable.colorLight }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: SCENARIOS.dispatchable.color }}
          />
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Scenario 4 - Best Case
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Flexible + Dispatchable Generation
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          The optimal configuration combines demand response with onsite generation. During
          peak grid congestion, the data center can both reduce its load AND run its generators
          to provide additional grid support - creating maximum value for all ratepayers.
        </p>
      </div>

      {/* Impact summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border-2 border-green-300 text-center">
          <p className="text-xs text-gray-600 mb-1">Savings vs Firm Load</p>
          <p className="text-2xl font-bold" style={{ color: SCENARIOS.dispatchable.color }}>
            ${savingsVsUnoptimized.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">/month per household</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
          <p className="text-xs text-gray-600 mb-1">Total Grid Relief</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalGridReliefMW.toFixed(0)} MW
          </p>
          <p className="text-xs text-gray-500">during peak events</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
          <p className="text-xs text-gray-600 mb-1">Onsite Generation</p>
          <p className="text-2xl font-bold text-gray-900">
            {onsiteGenMW} MW
          </p>
          <p className="text-xs text-gray-500">dispatchable capacity</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
          <p className="text-xs text-gray-600 mb-1">vs Baseline</p>
          <p className={`text-2xl font-bold ${impactVsBaseline <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
            {impactVsBaseline <= 0 ? '-' : '+'}${Math.abs(impactVsBaseline).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">/month impact</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          How Dispatchable Generation Works
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Peak Event Response</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Grid Signals Peak Stress</p>
                  <p className="text-sm text-gray-600">
                    Utility or grid operator sends signal during high-demand periods
                    (typically hot summer afternoons).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Demand Response Activates</p>
                  <p className="text-sm text-gray-600">
                    Data center shifts {(dataCenter.capacityMW * aggregateFlexibility).toFixed(0)} MW of
                    flexible workloads to later hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Generators Start</p>
                  <p className="text-sm text-gray-600">
                    Onsite natural gas or dual-fuel generators ramp up within 10 minutes,
                    providing {onsiteGenMW} MW of additional capacity.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Grid Sees Relief</p>
                  <p className="text-sm text-gray-600">
                    Combined effect: {totalGridReliefMW.toFixed(0)} MW reduction in
                    net grid draw during the most critical hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Grid Impact Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Normal Operation</span>
                  <span className="font-medium">{dataCenter.capacityMW} MW draw</span>
                </div>
                <div className="h-4 bg-red-200 rounded-full"></div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">After Demand Response</span>
                  <span className="font-medium">{(dataCenter.capacityMW - dataCenter.capacityMW * aggregateFlexibility).toFixed(0)} MW draw</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(1 - aggregateFlexibility) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">After DR + Generation</span>
                  <span className="font-medium text-green-600">{effectivePeakMW.toFixed(0)} MW net draw</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.max(5, (effectivePeakMW / dataCenter.capacityMW) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Total Peak Relief</span>
                  <span className="font-bold text-green-600">{totalGridReliefMW.toFixed(0)} MW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why onsite generation makes sense */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Why Onsite Generation Creates Value
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Backup Power</h3>
            <p className="text-sm text-gray-600">
              Data centers need backup power anyway. Designing that backup to also serve
              grid needs turns a cost center into a value creator.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Response</h3>
            <p className="text-sm text-gray-600">
              Modern gas generators can reach full output in under 10 minutes - faster
              than traditional peaker plants. This is valuable during sudden demand spikes.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Avoided Peaker Costs</h3>
            <p className="text-sm text-gray-600">
              Every MW of dispatchable capacity at the data center is a MW the utility doesn't
              need to build or purchase at {formatCurrency(150000)}/MW-year.
            </p>
          </div>
        </div>

        {/* Transition path note */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-900 mb-2">A Bridge to Clean Energy</h4>
          <p className="text-sm text-amber-800">
            Natural gas generation isn't the long-term answer, but it serves as valuable bridging
            capacity. As battery storage costs fall and clean firm power emerges, these generators
            can be replaced. Meanwhile, they provide grid reliability that enables more renewable
            integration.
          </p>
        </div>
      </div>

      {/* All scenarios chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          All Four Scenarios Compared
        </h2>
        <p className="text-gray-600 mb-6">
          The green line (Flex + Generation) provides the best outcome for ratepayers.
        </p>

        <ResponsiveContainer width="100%" height={400}>
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
            <Line
              type="monotone"
              dataKey="baseline"
              stroke={SCENARIOS.baseline.color}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Baseline"
            />
            <Line
              type="monotone"
              dataKey="unoptimized"
              stroke={SCENARIOS.unoptimized.color}
              strokeWidth={2}
              dot={false}
              name="Firm Load"
            />
            <Line
              type="monotone"
              dataKey="flexible"
              stroke={SCENARIOS.flexible.color}
              strokeWidth={2}
              dot={false}
              name="Flexible"
            />
            <Line
              type="monotone"
              dataKey="dispatchable"
              stroke={SCENARIOS.dispatchable.color}
              strokeWidth={3}
              dot={false}
              name="Flex + Gen"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {Object.values(SCENARIOS).map(scenario => {
            const final = comparisonData[comparisonData.length - 1][scenario.id];
            return (
              <div key={scenario.id} className="p-3 rounded-lg" style={{ backgroundColor: scenario.colorLight }}>
                <p className="text-xs text-gray-600">{scenario.shortName}</p>
                <p className="text-lg font-bold" style={{ color: scenario.color }}>
                  ${final.toFixed(0)}/mo
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-green-600 text-white rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-3">
          Ready to See Your Community's Numbers?
        </h3>
        <p className="text-green-100 mb-4">
          Use our calculator to input your utility's specific parameters and see how these
          scenarios would play out in your community.
        </p>
        <button
          onClick={() => onNavigate('calculator')}
          className="px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50"
        >
          Open the Calculator →
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={() => onNavigate('flexible')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back: Flexible Load
        </button>
        <button
          onClick={() => onNavigate('calculator')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          Try the Calculator
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DispatchablePage;
