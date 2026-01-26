'use client';

import Link from 'next/link';
import { useCalculator } from '@/hooks/useCalculator';
import { formatMW } from '@/lib/constants';
import CarbonFooter from '@/components/CarbonFooter';
import TrajectoryChart from '@/components/TrajectoryChart';
import USDataCenterHeatMap from '@/components/USDataCenterHeatMap';

export default function HomePage() {
  const { summary, utility, dataCenter, projectionYears } = useCalculator();

  const baselineFinalBill = summary.finalYearBills.baseline;
  const firmLoadDiff = summary.finalYearBills.unoptimized - baselineFinalBill;
  const dispatchableDiff = summary.finalYearBills.dispatchable - baselineFinalBill;

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-4xl animate-fade-in">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              The Scale of AI and Planning for{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Responsible Energy Growth
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              The public needs to understand how the rapid expansion of data centers impacts
              electricity costs. Individuals and community leaders can use this website to get
              the real numbers and advocate for responsible development and policy.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/calculator"
                className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Calculate My Electric Costs
              </Link>
              <Link
                href="/methodology"
                className="px-8 py-4 bg-blue-600/80 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-blue-500 transition-all duration-200 border-2 border-white/20 hover:border-white/40"
              >
                See Our Data Sources
              </Link>
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 md:h-20 fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* The Data Center Boom by the Numbers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
            The Data Center Boom by the Numbers
          </h2>

          <div className="space-y-4 text-slate-300 leading-relaxed mb-8">
            <p>
              Today, data centers make up about <strong className="text-white">4% of total U.S. electricity
              consumption</strong>. By 2030, this share is projected to reach <strong className="text-white">6 to 9%</strong> —
              that's equivalent to building approximately <strong className="text-white">100 nuclear power plants</strong> or
              100 GW of new power generation capacity.
            </p>
            <p>
              This growth, driven by the AI revolution, has led to a backlog of power demand. U.S.
              utilities around the country have received requests for <strong className="text-white">1,000 GW of power</strong>.
              This massive demand creates a supply-constrained market where there isn't enough power
              to meet all of these requests.
            </p>
          </div>

          {/* US Heat Map */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Data Center Load Requests Across the U.S.
            </h3>
            <USDataCenterHeatMap />
          </div>

          {/* Link to Story page */}
          <div className="text-center">
            <Link
              href="/story"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors font-medium"
            >
              Learn more about the scale of data centers from the chip to community level with the{' '}
              <span className="font-bold text-purple-200 underline decoration-purple-400 underline-offset-2">
                AI Energy Explorer
              </span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <p className="text-xs text-slate-500 mt-6 border-t border-slate-700 pt-4">
            Sources: <a href="https://eta.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white underline">LBNL 2024 Report</a>,
            <a href="https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white underline ml-1">U.S. DOE</a>,
            <a href="https://gridstrategiesllc.com/wp-content/uploads/National-Load-Growth-Report-2024.pdf" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white underline ml-1">Grid Strategies</a>,
            <a href="https://semianalysis.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white underline ml-1">SemiAnalysis</a>.
          </p>
        </div>
      </section>

      {/* Household Costs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-slide-up">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Household Costs
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              One large data center uses as much power as <strong>300,000 homes</strong>. Here's how costs flow to your bill.
            </p>
          </div>

          {/* Visual Scale Comparison */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-6">
              {/* Data center icon */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="4" width="18" height="4" rx="1" />
                    <rect x="3" y="10" width="18" height="4" rx="1" />
                    <rect x="3" y="16" width="18" height="4" rx="1" />
                    <circle cx="6" cy="6" r="1" className="text-green-400" fill="currentColor" />
                    <circle cx="6" cy="12" r="1" className="text-green-400" fill="currentColor" />
                    <circle cx="6" cy="18" r="1" className="text-green-400" fill="currentColor" />
                  </svg>
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-700 whitespace-nowrap">1 Data Center</span>
              </div>
              <span className="text-3xl font-bold text-gray-400">=</span>
              {/* Houses grid */}
              <div className="relative">
                <div className="grid grid-cols-5 gap-1 p-3 bg-amber-100 rounded-2xl">
                  {[...Array(15)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5L18 10v9H6v-9l6-4.5z"/>
                      <rect x="10" y="14" width="4" height="5" />
                    </svg>
                  ))}
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-amber-700 whitespace-nowrap">300,000 Homes</span>
              </div>
            </div>
          </div>

          {/* How Costs Flow */}
          <div className="mb-8">
            <h3 className="font-display text-xl font-bold text-gray-900 mb-6 text-center">How Costs Flow to Your Bill</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center w-full md:w-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg mb-2">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <line x1="4" y1="9" x2="20" y2="9" />
                    <line x1="4" y1="14" x2="20" y2="14" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-sm">Data Center Needs Power</span>
              </div>
              {/* Arrow */}
              <svg className="w-8 h-8 text-gray-300 rotate-90 md:rotate-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center w-full md:w-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg mb-2">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-sm">Utility Builds</span>
              </div>
              {/* Arrow */}
              <svg className="w-8 h-8 text-gray-300 rotate-90 md:rotate-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center w-full md:w-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg mb-2">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v4l2 2" />
                    <path d="M8 12h.01M16 12h.01" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-sm">Costs Shared</span>
              </div>
              {/* Arrow */}
              <svg className="w-8 h-8 text-gray-300 rotate-90 md:rotate-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center w-full md:w-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg mb-2">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="4" width="14" height="17" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="12" y2="17" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-sm">Your Bill</span>
              </div>
            </div>
          </div>

          {/* Bill Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {/* Baseline */}
            <div className="p-6 bg-gray-100 rounded-xl border-2 border-gray-300 text-center transform transition-all duration-200 hover:scale-105">
              <p className="text-sm font-medium text-gray-500 mb-2">Without Data Center</p>
              <p className="text-4xl font-bold text-gray-700">
                ${baselineFinalBill.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">in {projectionYears} years</p>
              <p className="text-xs text-gray-400 mt-2">Normal rate increases</p>
            </div>

            {/* Typical Data Center */}
            <div className="p-6 bg-red-50 rounded-xl border-2 border-red-200 text-center transform transition-all duration-200 hover:scale-105">
              <p className="text-sm font-medium text-red-700 mb-2">With Typical Data Center</p>
              <p className="text-4xl font-bold text-red-600">
                ${summary.finalYearBills.unoptimized.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">in {projectionYears} years</p>
              <p
                className={`text-sm font-semibold mt-2 ${firmLoadDiff >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}
              >
                {firmLoadDiff >= 0 ? '+' : ''}
                {firmLoadDiff.toFixed(2)}/mo vs baseline
              </p>
            </div>

            {/* Optimized Data Center */}
            <div className="p-6 bg-green-50 rounded-xl border-2 border-green-300 text-center ring-4 ring-green-200 ring-offset-2 transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-center gap-1 mb-2">
                <p className="text-sm font-medium text-green-700">With Optimized Data Center</p>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
                  BEST
                </span>
              </div>
              <p className="text-4xl font-bold text-green-600">
                ${summary.finalYearBills.dispatchable.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">in {projectionYears} years</p>
              <p
                className={`text-sm font-semibold mt-2 ${dispatchableDiff >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}
              >
                {dispatchableDiff >= 0 ? '+' : ''}
                {dispatchableDiff.toFixed(2)}/mo vs baseline
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* The Path Forward Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 px-8 py-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">The Path Forward: Equitable Tariffs and Flexible Operations</h2>
              <p className="text-gray-600">
                In a supply-constrained market, the key to responsible data center development is both in (1) the tariffs
                and policies making sure that data center loads cover any increase in marginal costs, and (2) the data
                centers are designed and operated with flexibility in mind.
              </p>
            </div>
          </div>

          {/* Two Column Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-3">Coordination to Share Costs</h4>
              <p className="text-gray-700">
                With coordinated planning, large industrial loads can put <strong>downward pressure on rates</strong> because
                more customers share fixed infrastructure costs. Greater grid utilization makes for more efficient use of
                existing assets.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-green-100">
              <h4 className="font-semibold text-green-800 mb-3">The Smart Design Model</h4>
              <p className="text-gray-700 mb-4">
                Flexible data center operations rather than size are key to maximizing benefits and minimizing risks:
              </p>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Flexibility provides insurance if local supply and demand don't align</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>On-site generation reduces strain on the shared grid</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>During grid emergencies (like snowstorms), data centers can shed load and push power back to the grid</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Virginia/ERCOT Comparison */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <h4 className="font-semibold text-amber-900 mb-3">Market Structure Matters: Virginia vs. Texas</h4>
            <p className="text-gray-700 mb-3">
              Virginia electricity bills have increased significantly because the market structure doesn't properly
              allocate costs—data centers don't fully pay for the infrastructure they require.
            </p>
            <p className="text-gray-700">
              In contrast, <strong>ERCOT's 4CP (Four Coincident Peak) methodology</strong> allocates transmission costs based on
              contribution during the 4 highest system peak hours each year. This incentivizes large loads to reduce consumption
              during critical periods, protecting existing ratepayers while rewarding flexible operations.
            </p>
          </div>

          {/* Data Center Operations in Practice */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
            <h4 className="font-semibold text-gray-900 mb-6 text-center">Data Center Operations in Practice</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-2">
                  <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4" />
                  </svg>
                </div>
                <h5 className="font-bold text-red-700 text-sm">Firm Load</h5>
                <p className="text-xs text-gray-500 mt-1">100% on at all times</p>
                <p className="text-xs text-gray-500">Adds fully to peak demand</p>
                <p className="text-xs font-semibold text-red-600 mt-1">Maximum infrastructure</p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-2">
                  <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v16h16M8 16l4-8 4 4 4-8" />
                  </svg>
                </div>
                <h5 className="font-bold text-amber-700 text-sm">Flexible Load</h5>
                <p className="text-xs text-gray-500 mt-1">25% curtailable (DCFlex validated)</p>
                <p className="text-xs text-gray-500">Higher utilization</p>
                <p className="text-xs font-semibold text-amber-600 mt-1">Reduced infrastructure</p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-2">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <h5 className="font-bold text-green-700 text-sm">Optimized Load</h5>
                <p className="text-xs text-gray-500 mt-1">Flexibility + on-site generation</p>
                <p className="text-xs text-gray-500">Supports grid during emergencies</p>
                <p className="text-xs font-semibold text-green-600 mt-1">Minimum infrastructure</p>
              </div>
            </div>
          </div>

          {/* Cost Impact Trajectory Chart */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 text-center">10-Year Monthly Bill Projection</h4>
            <p className="text-sm text-gray-600 text-center mb-4">
              Based on a {formatMW(dataCenter.capacityMW)} data center in a utility serving {utility.residentialCustomers.toLocaleString()} residential customers
            </p>
            <div className="h-64">
              <TrajectoryChart />
            </div>
          </div>
        </div>
      </section>

      {/* Advocate for Your Community */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Advocate for Your Community
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Key Messages */}
            <div className="rounded-xl bg-white/10 backdrop-blur-sm text-white p-8 border border-white/20">
              <h3 className="font-display text-xl font-bold mb-5">Key Messages</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <span className="text-sm leading-relaxed">Peak demand drives infrastructure costs</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <span className="text-sm leading-relaxed">Flexibility can cut impact dramatically</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span className="text-sm leading-relaxed">Your voice at the Public Utility Commission (PUC) shapes outcomes</span>
                </div>
              </div>
            </div>

            {/* Take Action */}
            <div className="rounded-xl bg-white/10 backdrop-blur-sm text-white p-8 border border-white/20">
              <h3 className="font-display text-xl font-bold mb-5">Take Action</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="text-sm leading-relaxed">Attend utility commission hearings</span>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="text-sm leading-relaxed">Ask about flexibility requirements</span>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="text-sm leading-relaxed">Demand transparent cost allocation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learn More Button */}
          <div className="text-center">
            <Link
              href="/learn"
              className="inline-block px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Learn More About Data Center Development
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card hover:shadow-lg transition-shadow">
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
              Customize for Your Community
            </h3>
            <p className="text-gray-600 mb-6">
              Enter your utility's actual numbers to see a more accurate projection for your
              specific situation.
            </p>
            <Link
              href="/calculator"
              className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
            >
              Open Calculator
            </Link>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
              Understand the Math
            </h3>
            <p className="text-gray-600 mb-6">
              All our calculations are based on publicly available data. Review our methodology and
              sources.
            </p>
            <Link
              href="/methodology"
              className="inline-block px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-sm hover:shadow-md"
            >
              View Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-8 md:p-12 text-center border-2 border-gray-200">
          <h3 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Open Source & Community Driven
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            This tool is free, open source, and not affiliated with any data center company or
            utility. Our goal is to provide objective information so communities can make informed
            decisions.
          </p>
          <a
            href="https://github.com/DougMackenzie/community-energy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">View on GitHub</span>
          </a>

          {/* AI Carbon Footprint Statement - Dynamic */}
          <CarbonFooter />
        </div>
      </section>
    </div>
  );
}
