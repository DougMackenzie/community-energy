'use client';

/**
 * Protected Content Wrapper
 *
 * Use this component to gate access to utility benchmarks and scoring data.
 * Unregistered users see a preview with registration prompt.
 *
 * Usage:
 *   <ProtectedContent
 *     title="Utility Benchmarks"
 *     description="Compare utility readiness scores across the country"
 *   >
 *     <YourSensitiveComponent />
 *   </ProtectedContent>
 */

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RegistrationForm from './RegistrationForm';

// ============================================
// TYPES
// ============================================

interface ProtectedContentProps {
  children: ReactNode;

  // Content shown to unregistered users
  title?: string;
  description?: string;

  // Optional preview content (blurred or teaser)
  preview?: ReactNode;

  // If true, shows inline registration instead of modal
  inlineRegistration?: boolean;

  // Custom message for why registration is needed
  registrationReason?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function ProtectedContent({
  children,
  title = 'Protected Content',
  description = 'This content requires registration to access.',
  preview,
  inlineRegistration = false,
  registrationReason,
}: ProtectedContentProps) {
  const { user, isLoading, isRegistered, openRegistration, showRegistration } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Registered users see the content
  if (isRegistered && user?.status === 'active') {
    return <>{children}</>;
  }

  // Unregistered users see the gate
  return (
    <div className="relative">
      {/* Preview content (blurred) */}
      {preview && (
        <div className="relative overflow-hidden rounded-xl">
          <div className="filter blur-sm opacity-50 pointer-events-none select-none">
            {preview}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>
      )}

      {/* Registration prompt */}
      <div className={`${preview ? 'absolute inset-0 flex items-center justify-center' : ''}`}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg mx-auto p-8 text-center">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>

          {/* Why register */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Why do we ask for registration?</h3>
            <p className="text-sm text-gray-600">
              {registrationReason ||
                'This utility scoring data requires context to interpret correctly. Knowing who accesses this information helps us ensure it\'s used responsibly and allows us to provide appropriate guidance.'}
            </p>
          </div>

          {/* What's included */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">With registration you get access to:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Utility readiness benchmarks and scores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Geographic comparison view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Detailed scoring methodology</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Downloadable data exports</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          {inlineRegistration ? (
            <div className="border-t pt-6">
              <RegistrationForm inline />
            </div>
          ) : (
            <button
              onClick={openRegistration}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Register for Free Access
            </button>
          )}

          {/* Note */}
          <p className="mt-4 text-xs text-gray-500">
            Free for researchers, regulators, utilities, and the public.
            <br />
            No payment required.
          </p>
        </div>
      </div>

      {/* Registration modal (if not inline) */}
      {!inlineRegistration && showRegistration && <RegistrationForm />}
    </div>
  );
}

// ============================================
// SIMPLE HOOK FOR CHECKING ACCESS
// ============================================

/**
 * Use this hook in components that need to conditionally render
 * based on auth status without the full wrapper.
 *
 * Example:
 *   const { isAllowed, promptRegistration } = useProtectedAccess();
 *   if (!isAllowed) return <button onClick={promptRegistration}>Register</button>;
 */
export function useProtectedAccess() {
  const { user, isRegistered, isLoading, openRegistration } = useAuth();

  return {
    isAllowed: isRegistered && user?.status === 'active',
    isLoading,
    promptRegistration: openRegistration,
  };
}
