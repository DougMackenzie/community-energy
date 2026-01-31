'use client';

import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function CommunityGuidePage() {
  const siteUrl = 'https://power-insight.org';

  return (
    <div className="min-h-screen bg-white">
      {/* Print-friendly styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header */}
      <header className="bg-slate-800 text-white py-6 no-print">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl">Power Insight</span>
          </Link>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-amber-200 text-sm"
          >
            power-insight.org
          </a>
        </div>
      </header>

      {/* Printable Header */}
      <div className="hidden print:block py-4 border-b-2 border-slate-200 mb-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">PI</span>
            </div>
            <span className="font-bold text-lg text-slate-800">Power Insight</span>
            <span className="text-slate-500 text-sm ml-auto">power-insight.org</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            What Communities Are Asking About Data Centers
          </h1>
          <p className="text-lg text-slate-600">
            Evidence-based answers to common questions
          </p>
        </div>

        {/* FAQ Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Question 1 */}
          <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">&quot;Will my electric bill go up?&quot;</h3>
                <p className="text-sm text-amber-600 font-medium mb-2">With the right policy, data centers apply downward pressure on rates.</p>
                <p className="text-sm text-slate-600">
                  Large customers bring new revenue that helps cover shared infrastructure costs.
                  The E3 study found data centers can lower nearby bills by 1-2%.
                </p>
              </div>
            </div>
          </div>

          {/* Question 2 */}
          <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">&quot;Who pays for all the new infrastructure?&quot;</h3>
                <p className="text-sm text-amber-600 font-medium mb-2">Industrial tariffs ensure data centers pay their full cost of service.</p>
                <p className="text-sm text-slate-600">
                  Utilities are creating dedicated rate classes with demand charges that recover transmission and
                  distribution costs directly from large loads.
                </p>
              </div>
            </div>
          </div>

          {/* Question 3 */}
          <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">&quot;What happens if the data center leaves?&quot;</h3>
                <p className="text-sm text-amber-600 font-medium mb-2">Tariff structures include minimum contract terms to ensure full cost recovery.</p>
                <p className="text-sm text-slate-600">
                  Policies like AEP Ohio&apos;s 12-year minimum demand requirements and exit fees protect
                  ratepayers from stranded asset risk.
                </p>
              </div>
            </div>
          </div>

          {/* Question 4 */}
          <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">&quot;Will I have power outages?&quot;</h3>
                <p className="text-sm text-amber-600 font-medium mb-2">Modern data centers actually help stabilize the grid during emergencies.</p>
                <p className="text-sm text-slate-600">
                  Data centers can reduce operations and activate on-site generators during peak demand,
                  helping prevent brownouts and blackouts. Many include battery storage that acts as grid backup.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="rounded-xl bg-slate-100 p-8 mb-10 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Questions to Ask About Any Proposal</h2>
          <p className="text-slate-500 text-sm text-center mb-6">Use this checklist when evaluating data center proposals in your community.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Cost Allocation */}
            <div>
              <h4 className="text-sm font-semibold text-amber-600 mb-3">Cost Allocation</h4>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  What rate schedule will the data center be on?
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  Does the rate cover full cost-of-service including demand charges?
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  Who pays for grid upgrades needed to serve the facility?
                </li>
              </ul>
            </div>

            {/* Grid Reliability */}
            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-3">Grid Reliability</h4>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  Is any of the load flexible?
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  Can operations be curtailed during grid emergencies?
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  Is on-site generation or battery storage included?
                </li>
              </ul>
            </div>

            {/* Risk Protection */}
            <div>
              <h4 className="text-sm font-semibold text-amber-600 mb-3">Risk Protection</h4>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  Are there minimum purchase requirements?
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  What happens if the data center closes or reduces load?
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 rounded flex-shrink-0 mt-0.5"></span>
                  Who bears the risk of stranded assets?
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <QRCodeSVG
              value={siteUrl}
              size={150}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Scan to visit Power Insight
          </p>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-500">
            Generated from{' '}
            <a href={siteUrl} className="text-amber-600 hover:underline font-medium no-print">
              Power Insight
            </a>
            <span className="hidden print:inline font-medium">Power Insight</span>
            {' '}&mdash; Open Data for Smarter Energy Decisions
          </p>
        </div>

        {/* Action Buttons - No Print */}
        <div className="flex justify-center gap-4 mt-8 no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-medium rounded-full hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print this Guide
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-slate-900 font-medium rounded-full hover:bg-amber-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Visit Full Site
          </Link>
        </div>
      </main>
    </div>
  );
}
