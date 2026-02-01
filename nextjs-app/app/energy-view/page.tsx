'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Energy View Redirect Page
 * Redirects to /methodology?tab=energy
 * Preserves backward compatibility for bookmarks and external links
 */
export default function EnergyViewRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/methodology?tab=energy');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Redirecting to Energy View...</p>
            </div>
        </div>
    );
}
