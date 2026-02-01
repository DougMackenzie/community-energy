'use client';

/**
 * Authentication Context for Power Insight
 *
 * Provides identity-gated access to utility benchmarks and scoring data.
 * This is NOT a security wall - it's a "know your user" registry.
 *
 * Users self-register with:
 * - Email (we track domain for auto-approval)
 * - Organization name
 * - Role/title
 * - Intended use
 *
 * Auto-approved domains: .gov, .edu, known utility domains
 * Others: Approved automatically but flagged for review
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  organization: string;
  role: string;
  intendedUse: string;
  registeredAt: string;
  lastAccessAt: string;
  accessCount: number;
  domain: string;
  autoApproved: boolean;
  status: 'active' | 'pending' | 'revoked';
}

export interface RegistrationData {
  email: string;
  name: string;
  organization: string;
  role: string;
  intendedUse: string;
}

interface AuthContextType {
  // State
  user: RegisteredUser | null;
  isLoading: boolean;
  isRegistered: boolean;
  showRegistration: boolean;

  // Actions
  register: (data: RegistrationData) => Promise<{ success: boolean; error?: string }>;
  checkAccess: () => Promise<boolean>;
  logout: () => void;
  openRegistration: () => void;
  closeRegistration: () => void;
}

// ============================================
// AUTO-APPROVE DOMAINS
// ============================================

const AUTO_APPROVE_DOMAINS = [
  // Government
  '.gov',
  '.gov.uk',
  '.gc.ca',

  // Education
  '.edu',
  '.ac.uk',

  // Research institutions
  'epri.com',
  'lbl.gov',
  'nrel.gov',
  'anl.gov',
  'ornl.gov',
  'pnnl.gov',

  // Regulatory bodies
  'ferc.gov',
  'eia.gov',
  'naruc.org',

  // Major utilities (add more as needed)
  'duke-energy.com',
  'dominionenergy.com',
  'pge.com',
  'sce.com',
  'xcelenergy.com',
  'entergy.com',
  'aep.com',
  'southerncompany.com',
  'nexteraenergy.com',
  'exeloncorp.com',
];

const isAutoApprovedDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return AUTO_APPROVE_DOMAINS.some(approved =>
    domain.endsWith(approved) || domain === approved.replace('.', '')
  );
};

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<RegisteredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Check localStorage for session token
        const sessionToken = localStorage.getItem('power_insight_session');
        if (sessionToken) {
          // Validate session with API
          const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: sessionToken }),
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Invalid session, clear it
            localStorage.removeItem('power_insight_session');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Register new user
  const register = useCallback(async (data: RegistrationData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store session token
        localStorage.setItem('power_insight_session', result.token);
        setUser(result.user);
        setShowRegistration(false);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  // Check if user has access (for protected routes)
  const checkAccess = useCallback(async (): Promise<boolean> => {
    if (user && user.status === 'active') {
      // Log access for analytics
      fetch('/api/auth/log-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      }).catch(() => {}); // Fire and forget

      return true;
    }
    return false;
  }, [user]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('power_insight_session');
    setUser(null);
  }, []);

  // Registration modal controls
  const openRegistration = useCallback(() => setShowRegistration(true), []);
  const closeRegistration = useCallback(() => setShowRegistration(false), []);

  const value: AuthContextType = {
    user,
    isLoading,
    isRegistered: !!user,
    showRegistration,
    register,
    checkAccess,
    logout,
    openRegistration,
    closeRegistration,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export utility function
export { isAutoApprovedDomain };
