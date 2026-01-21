/**
 * Community Energy Calculator
 *
 * An open-source tool for homeowners and community leaders to understand
 * how data center development impacts electricity costs.
 */

import { useState } from 'react';
import { CalculatorProvider } from './hooks/useCalculator.jsx';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import BaselinePage from './pages/BaselinePage';
import UnoptimizedPage from './pages/UnoptimizedPage';
import FlexiblePage from './pages/FlexiblePage';
import DispatchablePage from './pages/DispatchablePage';
import CalculatorPage from './pages/CalculatorPage';
import MethodologyPage from './pages/MethodologyPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'baseline':
        return <BaselinePage onNavigate={handleNavigate} />;
      case 'unoptimized':
        return <UnoptimizedPage onNavigate={handleNavigate} />;
      case 'flexible':
        return <FlexiblePage onNavigate={handleNavigate} />;
      case 'dispatchable':
        return <DispatchablePage onNavigate={handleNavigate} />;
      case 'calculator':
        return <CalculatorPage onNavigate={handleNavigate} />;
      case 'methodology':
        return <MethodologyPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <CalculatorProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">Community Energy Calculator</span>
                </div>
                <p className="text-sm text-gray-600">
                  An open-source tool to help communities understand the impact of
                  data center development on electricity costs.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Learn More</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      onClick={() => handleNavigate('methodology')}
                      className="text-gray-600 hover:text-green-600"
                    >
                      Methodology & Sources
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigate('calculator')}
                      className="text-gray-600 hover:text-green-600"
                    >
                      Try the Calculator
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Open Source</h4>
                <p className="text-sm text-gray-600 mb-2">
                  This project is open source. View the code, report issues, or contribute.
                </p>
                <p className="text-xs text-gray-500">
                  MIT License
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>
                Built for communities. Not affiliated with any data center company or utility.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CalculatorProvider>
  );
}

export default App;
