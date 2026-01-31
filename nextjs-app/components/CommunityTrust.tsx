'use client';

import Link from 'next/link';

/**
 * Revised Hero Section
 * Leads with acknowledgment and positions the site as a neutral resource
 */
export function TrustHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-slate-300 text-sm font-medium border border-white/10">
              Independent Research &bull; Open Data &bull; Community First
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Data Centers Are Coming.{' '}
            <span className="text-amber-300">
              Get the Facts.
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-4 leading-relaxed max-w-3xl">
            Communities across the country are facing proposals for large-scale data centers.
            Some see economic opportunity. Others worry about rising electric bills and strained infrastructure.
          </p>

          <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl font-medium">
            Both concerns are valid. The outcome depends on <em>how</em> these projects are structured
            and whether the right protections are in place.
          </p>

          <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-3xl">
            This site compiles independent research so you can understand the tradeoffs,
            ask the right questions, and advocate for your community.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="#community-questions"
              className="px-8 py-4 bg-amber-400 text-slate-900 font-semibold rounded-full hover:bg-amber-300 transition-all duration-200 hover:scale-105"
            >
              See Common Concerns
            </Link>
            <Link
              href="/methodology"
              className="px-8 py-4 bg-transparent border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-200"
            >
              View Our Sources
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * What Communities Are Asking Section
 * Names the fears explicitly before providing answers
 */
export function CommunityQuestions() {
  const questions = [
    {
      question: "Will my electric bill go up?",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      shortAnswer: "It depends on rate design and policy choices.",
      detail: "Without proper protections, large new loads can shift infrastructure costs to residential customers. With the right policies, they can actually help lower bills by spreading fixed costs across more users."
    },
    {
      question: "Who pays for all the new infrastructure?",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      shortAnswer: "This is the key question to ask.",
      detail: "New transmission lines and grid upgrades can cost billions. Whether data centers pay their fair share—or costs get socialized to all ratepayers—is determined by utility rate cases and state policy."
    },
    {
      question: "What happens if the data center leaves?",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      ),
      shortAnswer: "Stranded assets are a real risk.",
      detail: "If infrastructure is built for a data center that later closes or reduces load, remaining customers could be stuck paying for unused capacity. Minimum purchase requirements and exit fees can protect against this."
    },
    {
      question: "Is this just benefiting big tech while we pay?",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      ),
      shortAnswer: "That's a legitimate concern.",
      detail: "Without proper oversight, benefits can flow to corporations while costs are spread to households. Community advocacy and regulatory engagement are essential to ensuring fair outcomes."
    }
  ];

  return (
    <section id="community-questions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          What Communities Are Asking
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          These are the questions we hear most often. They deserve honest, evidence-based answers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {questions.map((q, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                {q.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  "{q.question}"
                </h3>
                <p className="text-amber-700 font-semibold text-sm">
                  {q.shortAnswer}
                </p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed pl-0 md:pl-[72px]">
              {q.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm">
          Scroll down to see what independent research says about each of these concerns.
        </p>
      </div>
    </section>
  );
}

/**
 * Visual Fact Cards
 * Scannable research findings with visual anchors
 */
export function ResearchFactCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Based on 12+ Independent Studies
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          What Research Actually Shows
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Not industry talking points. Peer-reviewed research and government analysis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: The Fair Share Test */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-green-900">The Fair Share Test</h3>
          </div>

          {/* Visual: Before/After comparison */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center justify-around gap-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" strokeWidth="10"
                      strokeDasharray="283" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">100%</span>
                </div>
                <p className="text-xs text-slate-600">Costs shared by<br/>existing customers</p>
              </div>
              <svg className="w-6 h-6 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="10"
                      strokeDasharray="212" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="10"
                      strokeDasharray="71" strokeDashoffset="-212" transform="rotate(-90 50 50)" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">75% + 25%</span>
                </div>
                <p className="text-xs text-slate-600">Data center pays<br/>its share</p>
              </div>
            </div>
          </div>

          <p className="text-green-800 font-medium mb-2">
            When data centers pay proper rates, they can reduce bills for everyone.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Large customers bring new revenue that helps cover shared infrastructure costs.
            The E3 study found a single data center can bring $2-4M annually—enough to lower nearby bills 1-2%.
          </p>
          <p className="text-xs text-slate-500">
            Source: E3 Ratepayer Impact Study (2025)
          </p>
        </div>

        {/* Card 2: Flexibility Matters */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-900">Flexibility Matters</h3>
          </div>

          {/* Visual: Two buildings comparison */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-end justify-around gap-4">
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-24 bg-red-100 rounded-t-lg border-2 border-red-300 flex items-center justify-center relative">
                    <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <line x1="4" y1="9" x2="20" y2="9" />
                      <line x1="4" y1="14" x2="20" y2="14" />
                    </svg>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M12 9v2m0 4h.01" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-20 h-2 bg-red-200 rounded-b"></div>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">Always-On</p>
                <p className="text-xs text-red-600">100% infrastructure</p>
              </div>

              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-24 bg-green-100 rounded-t-lg border-2 border-green-300 flex items-center justify-center relative">
                    <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <line x1="4" y1="9" x2="20" y2="9" />
                      <line x1="4" y1="14" x2="20" y2="14" />
                    </svg>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-20 h-2 bg-green-200 rounded-b"></div>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">Flexible</p>
                <p className="text-xs text-green-600">~60% infrastructure</p>
              </div>
            </div>
          </div>

          <p className="text-blue-800 font-medium mb-2">
            Flexible data centers need up to 40% less new infrastructure.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            When data centers can reduce power during peak hours, they contribute less to the moments
            when the grid is most stressed—meaning less need for expensive new power plants and transmission lines.
          </p>
          <p className="text-xs text-slate-500">
            Source: MIT Sloan (2025), GridCARE (2025)
          </p>
        </div>

        {/* Card 3: The Risks Are Real */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-900">The Risks Are Real</h3>
          </div>

          {/* Visual: Warning indicators */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-700">Without proper rates → costs shift to households</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-700">Capacity market regions → price spillovers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-700">No exit protections → stranded asset risk</span>
              </div>
            </div>
          </div>

          <p className="text-amber-800 font-medium mb-2">
            Bad policy can lead to bad outcomes.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Research also shows that in regions like PJM, large new loads can trigger capacity price spikes
            that affect <em>all</em> ratepayers. This isn't fear-mongering—it's why proper oversight matters.
          </p>
          <p className="text-xs text-slate-500">
            Source: Grid Strategies (2024), LBNL Queued Up
          </p>
        </div>

        {/* Card 4: Policy Is Working */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-purple-900">Policy Is Working</h3>
          </div>

          <p className="text-purple-800 font-medium mb-2">
            Communities are successfully advocating for protections.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Multiple states are introducing ratepayer protection legislation. Texas SB6 now requires large loads to curtail during emergencies.
            Utilities are creating dedicated rate classes with minimum purchase requirements. Public pressure is reshaping how these projects are approved.
          </p>
          <p className="text-xs text-slate-500">
            Examples:{' '}
            <a href="https://www.utilitydive.com/news/data-center-load-growth-markets-ratepayer/749715/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Texas SB6</a>,{' '}
            <a href="https://www.aepohio.com/company/about/rates/data-center-tariff/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">AEP Ohio Data Center Tariff</a>,{' '}
            <a href="https://indianacapitalchronicle.com/2024/11/26/ratepayer-advocates-hail-landmark-settlement-with-data-centers-utility-company/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Indiana Michigan Power Settlement</a>
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/methodology#literature-review"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
        >
          See all 12+ studies in our research summary
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

/**
 * When It Goes Well / When It Goes Wrong
 * Side-by-side comparison of conditions and outcomes
 */
export function OutcomesComparison() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          The Outcome Depends on the Details
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          The same data center can help or hurt your community depending on how it's structured.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* When It Goes Wrong */}
        <div className="rounded-2xl overflow-hidden border-2 border-red-200">
          <div className="bg-red-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
              When It Goes Wrong
            </h3>
          </div>
          <div className="bg-red-50 p-6">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-red-900">Negotiated "sweetheart" rates</p>
                  <p className="text-sm text-red-700">Data center pays below cost-of-service; gap shifted to residential customers</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-red-900">No flexibility requirements</p>
                  <p className="text-sm text-red-700">Always-on load adds maximum stress to peak demand</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-red-900">Socialized infrastructure costs</p>
                  <p className="text-sm text-red-700">All ratepayers pay for new transmission built primarily for data center</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-red-900">No exit protections</p>
                  <p className="text-sm text-red-700">If data center leaves, remaining customers stuck with stranded assets</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-900">Result: Bills go up 3-8% for existing customers</p>
            </div>
          </div>
        </div>

        {/* When It Goes Well */}
        <div className="rounded-2xl overflow-hidden border-2 border-green-200">
          <div className="bg-green-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              When It Goes Well
            </h3>
          </div>
          <div className="bg-green-50 p-6">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-900">Cost-based rate design</p>
                  <p className="text-sm text-green-700">Data center pays full cost of service including demand charges</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-900">Curtailment during emergencies</p>
                  <p className="text-sm text-green-700">Load can be reduced during peak hours and grid stress events</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-900">Contribution to infrastructure</p>
                  <p className="text-sm text-green-700">Data center pays interconnection costs and contributes to shared grid upgrades</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-900">Minimum purchase requirements</p>
                  <p className="text-sm text-green-700">Long-term commitments protect against stranded asset risk</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">Result: Bills could decrease 1-2% for existing customers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-600 max-w-2xl mx-auto">
          The difference isn't the data center—it's the policy.
          That's why community involvement in utility rate cases and state legislation matters.
        </p>
      </div>
    </section>
  );
}

/**
 * For Community Leaders Section
 * Talking points and responses to common concerns
 */
export function CommunityLeadersSection() {
  const talkingPoints = [
    {
      concern: "Big tech is going to make our bills skyrocket.",
      response: "That's a legitimate concern—and exactly why we need to pay attention. Without proper rate design, large loads can shift infrastructure costs to households. But with the right policies, studies show they can actually help lower bills. The key questions to ask are: What rate will they pay? Who covers infrastructure costs? What happens if they leave?",
      evidence: "E3 study (2025) found properly-structured data centers can reduce nearby bills 1-2%."
    },
    {
      concern: "They're just going to use up all our power.",
      response: "Data centers do use significant power—a large campus can equal 300,000 homes. But they also bring revenue that helps pay for grid infrastructure everyone uses. The real issue is whether that revenue covers their fair share of costs. Ask to see the utility's cost allocation analysis.",
      evidence: "LBNL/Brattle research shows states with growing electricity demand often saw rates decrease."
    },
    {
      concern: "We'll have blackouts because of these data centers.",
      response: "Grid reliability is a valid concern, especially in regions already facing capacity constraints. That's why flexibility requirements matter. Data centers that can reduce power during emergencies actually help prevent blackouts. Texas SB6 now requires this. Ask whether any proposal includes curtailment provisions.",
      evidence: "GridCARE found flexible data centers could cut costs 5% while improving reliability."
    },
    {
      concern: "The utility is just doing this to make money while we pay.",
      response: "Utilities are regulated by your state's Public Utility Commission, which must approve any new rate agreements. You can participate in these proceedings. Ask when the public comment period is, request the cost-benefit analysis, and advocate for residential ratepayer protections.",
      evidence: "Multiple states are now introducing ratepayer protection legislation for large loads."
    }
  ];

  return (
    <section className="bg-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/20 rounded-full text-amber-300 text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            For Council Members & Community Leaders
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Responding to Community Concerns
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            When constituents raise concerns, here's how to respond with facts—while acknowledging their fears are valid.
          </p>
        </div>

        <div className="space-y-6">
          {talkingPoints.map((point, i) => (
            <div key={i} className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium mb-3 italic">
                    "{point.concern}"
                  </p>
                  <div className="bg-slate-800 rounded-xl p-4 mb-3">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {point.response}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{point.evidence}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-amber-400/10 border border-amber-400/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-amber-300 mb-3">Key Principle</h3>
          <p className="text-slate-300">
            Don't dismiss fears—<strong className="text-white">validate them and then provide context</strong>.
            The concerns about rising bills and strained infrastructure are real possibilities without proper oversight.
            Your role is to ensure the right questions are asked and protections are in place,
            not to convince people everything will be fine.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Questions Checklist
 * Printable/shareable checklist for evaluating proposals
 */
export function QuestionsChecklist() {
  const categories = [
    {
      title: "Cost Allocation",
      color: "green",
      questions: [
        "What rate schedule will the data center be on?",
        "Does the rate cover full cost-of-service including demand charges?",
        "Who pays for grid upgrades needed to serve the facility?"
      ]
    },
    {
      title: "Grid Reliability",
      color: "blue",
      questions: [
        "Will the load be firm or flexible?",
        "Can operations be curtailed during grid emergencies?",
        "Is on-site generation or battery storage included?"
      ]
    },
    {
      title: "Risk Protection",
      color: "amber",
      questions: [
        "Are there minimum purchase requirements?",
        "What happens if the data center closes or reduces load?",
        "Who bears the risk of stranded assets?"
      ]
    },
    {
      title: "Public Process",
      color: "purple",
      questions: [
        "When is the public comment period?",
        "Has the PUC conducted a ratepayer impact analysis?",
        "Are consumer advocates reviewing the proposal?"
      ]
    }
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; bullet: string }> = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', bullet: 'bg-green-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', bullet: 'bg-blue-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', bullet: 'bg-amber-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', bullet: 'bg-purple-500' }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
            Questions to Ask About Any Proposal
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Use this checklist when evaluating data center proposals in your community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat, i) => {
            const colors = colorClasses[cat.color];
            return (
              <div key={i} className={`${colors.bg} ${colors.border} border rounded-xl p-5`}>
                <h3 className={`font-bold ${colors.text} mb-4`}>{cat.title}</h3>
                <ul className="space-y-3">
                  {cat.questions.map((q, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5`}></div>
                      <span className="text-sm text-slate-700">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500 mb-4">
            Can't get answers to these questions? That's a red flag worth raising with your utility commission.
          </p>
          <Link
            href="/learn-more#questions-to-ask"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            See detailed guidance for each question
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
