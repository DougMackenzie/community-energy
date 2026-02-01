'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function LearnMoreButton() {
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-slate-900 font-semibold rounded-full hover:bg-amber-300 transition-all duration-200 hover:scale-105"
      >
        Learn More
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showOptions && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <Link
            href="/learn-more"
            onClick={() => setShowOptions(false)}
            className="w-full px-4 py-4 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center flex-shrink-0 transition-colors">
              <svg className="w-5 h-5 text-slate-500 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">Community Guide</span>
              <span className="text-xs text-slate-500">FAQs, deep dives & glossary</span>
            </div>
          </Link>
          <Link
            href="/share/community-guide"
            onClick={() => setShowOptions(false)}
            className="w-full px-4 py-4 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-t border-slate-100 group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center flex-shrink-0 transition-colors">
              <svg className="w-5 h-5 text-slate-500 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">Community Leader 1-Pager</span>
              <span className="text-xs text-slate-500">Printable guide for meetings</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
