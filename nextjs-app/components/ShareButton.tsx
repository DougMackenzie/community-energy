'use client';

import { useState, useRef, useEffect } from 'react';

export default function ShareButton() {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl = 'https://power-insight.org/share/community-guide';

  const emailSubject = 'Data Center Community Guide - Power Insight';
  const emailBody = `I wanted to share this helpful resource about data centers and community energy planning.

View the full guide with all details here:
${shareUrl}

Quick summary of what communities are asking:

• "Will my electric bill go up?" - With the right policy, data centers apply downward pressure on rates.

• "Who pays for all the new infrastructure?" - Industrial tariffs ensure data centers pay their full cost of service.

• "What happens if the data center leaves?" - Tariff structures include minimum contract terms.

• "Will I have power outages?" - Modern data centers help stabilize the grid during emergencies.

The link above includes a printable checklist and QR code for sharing.

---
Powered by Power Insight - Open Data for Smarter Energy Decisions
https://power-insight.org`;

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowOptions(false);
      }, 1500);
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowOptions(false);
      }, 1500);
    }
  };

  const handleEmail = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
    setShowOptions(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-full hover:bg-white/20 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share this Section
      </button>

      {showOptions && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-600 overflow-hidden z-50">
          <button
            onClick={handleCopyLink}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Link Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Link</span>
              </>
            )}
          </button>
          <button
            onClick={handleEmail}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-slate-700 transition-colors flex items-center gap-3 border-t border-slate-600"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email This</span>
          </button>
        </div>
      )}
    </div>
  );
}
