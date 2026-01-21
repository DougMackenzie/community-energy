/**
 * BaselinePage Component
 *
 * Explains what drives electricity costs even without new large loads.
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCalculator } from '../hooks/useCalculator';
import { SCENARIOS, TIME_PARAMS, INFRASTRUCTURE_COSTS } from '../data/constants';

const BaselinePage = ({ onNavigate }) => {
  const { trajectories, utility, projectionYears } = useCalculator();

  // Prepare stacked area data showing cost components
  // The baseline trajectory uses compound growth from:
  // - General inflation: ~2.5%/year
  // - Infrastructure replacement: ~1.5%/year
  // - Grid modernization: ~0.5%/year
  // Total: ~4.5% annual compound growth
  const costBreakdownData = useMemo(() => {
    const inflationRate = TIME_PARAMS.generalInflation; // 2.5%
    const infraRate = INFRASTRUCTURE_COSTS.annualBaselineUpgradePercent + 0.005; // 1.5% + 0.5% = 2%
    const totalRate = inflationRate + infraRate; // 4.5%

    return trajectories.baseline.map((point, index) => {
      const baseComponent = utility.averageMonthlyBill;

      // The actual total increase from the trajectory
      const totalIncrease = point.monthlyBill - baseComponent;

      // Proportionally allocate the increase between inflation and infrastructure
      // based on their relative contribution to the total rate
      const inflationShare = inflationRate / totalRate;
      const infraShare = infraRate / totalRate;

      const inflationComponent = totalIncrease * inflationShare;
      const infrastructureComponent = totalIncrease * infraShare;

      return {
        year: point.year,
        base: baseComponent,
        inflation: inflationComponent,
        infrastructure: infrastructureComponent,
        total: point.monthlyBill,
      };
    });
  }, [trajectories, utility]);

  const finalYear = trajectories.baseline[trajectories.baseline.length - 1];
  const totalIncrease = finalYear.monthlyBill - utility.averageMonthlyBill;
  const percentIncrease = (totalIncrease / utility.averageMonthlyBill) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-100 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: SCENARIOS.baseline.color }}
          />
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Scenario 1
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          The Baseline: Costs Without New Load
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Even without any new data centers or large industrial customers, electricity
          costs are rising. Understanding this baseline helps us see the true impact
          of new load - and how it can be managed.
        </p>
      </div>

      {/* Key stat */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-1">Current Monthly Bill</p>
          <p className="text-3xl font-bold text-gray-900">
            ${utility.averageMonthlyBill.toFixed(0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-1">Projected in {projectionYears} Years</p>
          <p className="text-3xl font-bold" style={{ color: SCENARIOS.baseline.color }}>
            ${finalYear.monthlyBill.toFixed(0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-1">Total Increase</p>
          <p className="text-3xl font-bold text-gray-900">
            +${totalIncrease.toFixed(0)} <span className="text-lg text-gray-500">({percentIncrease.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* What drives costs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          What Drives Electricity Cost Increases?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Aging Infrastructure</h3>
            <p className="text-sm text-gray-600">
              Power lines, transformers, and substations built decades ago need
              replacement. Utilities spend ~{(INFRASTRUCTURE_COSTS.annualBaselineUpgradePercent * 100).toFixed(1)}%
              of their rate base annually on upgrades.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">General Inflation</h3>
            <p className="text-sm text-gray-600">
              Labor costs, materials, fuel, and other operating expenses increase
              at roughly {(TIME_PARAMS.generalInflation * 100).toFixed(1)}% per year, driving up
              the cost to deliver electricity.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Modest Load Growth</h3>
            <p className="text-sm text-gray-600">
              Even without major new customers, residential electricity use tends
              to grow slightly each year through population growth and electrification.
            </p>
          </div>
        </div>
      </div>

      {/* Cost breakdown chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Where Your Bill Increase Comes From
        </h2>
        <p className="text-gray-600 mb-6">
          This chart shows the components of your monthly bill over time.
        </p>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={costBreakdownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(v) => `$${v}`}
              label={{ value: 'Monthly Bill', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            />
            <Tooltip
              formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="base"
              stackId="1"
              stroke="#9ca3af"
              fill="#e5e7eb"
              name="Base Cost"
            />
            <Area
              type="monotone"
              dataKey="inflation"
              stackId="1"
              stroke="#f59e0b"
              fill="#fef3c7"
              name="Inflation"
            />
            <Area
              type="monotone"
              dataKey="infrastructure"
              stackId="1"
              stroke="#3b82f6"
              fill="#dbeafe"
              name="Infrastructure"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key takeaway */}
      <div className="bg-gray-800 text-white rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Key Takeaway</h3>
        <p className="text-gray-300 mb-4">
          Your electricity bill is likely to increase by about <strong className="text-white">${totalIncrease.toFixed(0)}/month</strong> over
          the next {projectionYears} years even without any major new loads. This is the baseline against which we compare
          the impact of data center development.
        </p>
        <p className="text-gray-300">
          The question isn't whether costs will rise - they will. The question is whether new large
          customers will add to that burden or help offset it through their contributions.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={() => onNavigate('home')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </button>
        <button
          onClick={() => onNavigate('unoptimized')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          Next: Firm Load Impact
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BaselinePage;
