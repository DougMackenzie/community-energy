'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Calculator Redirect Page
 * Redirects to /methodology?tab=calculator
 * Preserves backward compatibility for bookmarks and external links
 */
export default function CalculatorRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/methodology?tab=calculator');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Redirecting to Calculator...</p>
            </div>
        </div>
    );
}
