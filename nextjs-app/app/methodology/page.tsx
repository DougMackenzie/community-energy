'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TabNavigation, { TabIcons, useActiveTab, type Tab } from '@/components/ui/TabNavigation';
import ResearchTab from '@/components/methodology/ResearchTab';
import UtilityDataTab from '@/components/methodology/UtilityDataTab';
import EnergyViewTab from '@/components/methodology/EnergyViewTab';
import CalculatorTab from '@/components/methodology/CalculatorTab';
import GeographicTab from '@/components/methodology/GeographicTab';
import { useAuth } from '@/hooks/useAuth';
import RegistrationForm from '@/components/RegistrationForm';

// Define methodology tabs - public only (utility and geographic moved to Utility Portal)
const METHODOLOGY_TABS: Tab[] = [
    {
        id: 'research',
        label: 'Research & Framework',
        icon: TabIcons.book,
    },
    {
        id: 'calculator',
        label: 'Calculator',
        icon: TabIcons.calculator,
    },
    {
        id: 'energy',
        label: 'Energy View',
        icon: TabIcons.map,
    },
];

// Protected tabs that require registration
const PROTECTED_TABS = ['utility', 'geographic'];

// Loading fallback for tab content
function TabLoadingFallback() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading...</p>
            </div>
        </div>
    );
}

// Registration prompt for protected content
function RegistrationPrompt() {
    const { openRegistration, showRegistration } = useAuth();

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-lg mx-auto p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Utility Portal Access</h2>
            <p className="text-gray-600 mb-6">
                This utility data requires registration to access. Help us understand who is using this research tool.
            </p>

            {/* What's included */}
            <div className="text-left mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">With registration you get access to:</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Utility tariff database (88 utilities)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Geographic comparison view</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Protection mechanism analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Rate structure details</span>
                    </li>
                </ul>
            </div>

            {/* CTA */}
            <button
                onClick={openRegistration}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
                Register for Free Access
            </button>

            {/* Note */}
            <p className="mt-4 text-xs text-gray-500">
                Free for researchers, regulators, utilities, and the public.
                <br />
                No payment required.
            </p>

            {/* Registration modal */}
            {showRegistration && <RegistrationForm />}
        </div>
    );
}

// Tab content renderer
function TabContent({ activeTab }: { activeTab: string }) {
    const { isRegistered, user } = useAuth();
    const isProtectedTab = PROTECTED_TABS.includes(activeTab);
    const hasAccess = isRegistered && user?.status === 'active';

    // If trying to access protected tab without registration, show prompt
    if (isProtectedTab && !hasAccess) {
        return <RegistrationPrompt />;
    }

    switch (activeTab) {
        case 'research':
            return <ResearchTab />;
        case 'utility':
            return (
                <Suspense fallback={<TabLoadingFallback />}>
                    <UtilityDataTab />
                </Suspense>
            );
        case 'geographic':
            return (
                <Suspense fallback={<TabLoadingFallback />}>
                    <GeographicTab />
                </Suspense>
            );
        case 'calculator':
            return <CalculatorTab />;
        case 'energy':
            return <EnergyViewTab />;
        default:
            return <ResearchTab />;
    }
}

// Inner component that uses searchParams
function MethodologyContent() {
    const { isRegistered, user, showRegistration } = useAuth();
    const hasAccess = isRegistered && user?.status === 'active';

    // Build tabs list - only show protected tabs to registered users
    const visibleTabs = hasAccess
        ? [
            ...METHODOLOGY_TABS.slice(0, 1), // Research
            { id: 'utility', label: 'Utility Data', icon: TabIcons.database },
            { id: 'geographic', label: 'Geographic View', icon: TabIcons.globe, badge: 'New', badgeColor: 'bg-primary-100 text-primary-700' },
            ...METHODOLOGY_TABS.slice(1), // Calculator, Energy
        ]
        : METHODOLOGY_TABS;

    const activeTab = useActiveTab(visibleTabs, 'research', 'tab');

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-8 border border-slate-200">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                    Methodology & Technical Documentation
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl">
                    This calculator models how large data center loads affect residential electricity bills,
                    with particular attention to <strong>capacity market dynamics</strong> and the supply curve
                    effects that can cause cost spillovers to existing ratepayers.
                </p>
            </div>

            {/* Tab Navigation */}
            <TabNavigation
                tabs={visibleTabs}
                defaultTab="research"
                useUrlParams={true}
                paramName="tab"
            />

            {/* Tab Content */}
            <div className="mt-6">
                <TabContent activeTab={activeTab} />
            </div>

            {/* Registration modal if shown */}
            {showRegistration && <RegistrationForm />}
        </div>
    );
}

// Main page component with Suspense boundary
export default function MethodologyPage() {
    return (
        <Suspense fallback={
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            </div>
        }>
            <MethodologyContent />
        </Suspense>
    );
}
