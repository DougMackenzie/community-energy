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

  // Check for existing session on mount - use localStorage directly
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        // Check localStorage for session token and user data
        const sessionToken = localStorage.getItem('power_insight_session');
        const storedUser = localStorage.getItem('power_insight_user');

        if (sessionToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser) as RegisteredUser;
            // Update last access time
            userData.lastAccessAt = new Date().toISOString();
            userData.accessCount = (userData.accessCount || 0) + 1;
            localStorage.setItem('power_insight_user', JSON.stringify(userData));
            setUser(userData);
          } catch {
            // Invalid stored data, clear it
            localStorage.removeItem('power_insight_session');
            localStorage.removeItem('power_insight_user');
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

  // Register new user - client-side storage for Vercel compatibility
  const register = useCallback(async (data: RegistrationData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate required fields
      if (!data.email || !data.name || !data.organization) {
        return { success: false, error: 'Please fill in all required fields' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Generate session token
      const sessionToken = crypto.randomUUID();
      const domain = data.email.split('@')[1]?.toLowerCase() || '';
      const autoApproved = isAutoApprovedDomain(data.email);

      // Create user object
      const newUser: RegisteredUser = {
        id: crypto.randomUUID(),
        email: data.email.toLowerCase(),
        name: data.name,
        organization: data.organization,
        role: data.role || '',
        intendedUse: data.intendedUse || '',
        registeredAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString(),
        accessCount: 1,
        domain,
        autoApproved,
        status: 'active',
      };

      // Store in localStorage
      localStorage.setItem('power_insight_session', sessionToken);
      localStorage.setItem('power_insight_user', JSON.stringify(newUser));

      setUser(newUser);
      setShowRegistration(false);

      // Also try to log to server (fire and forget - won't fail if server unavailable)
      try {
        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).catch(() => {}); // Ignore errors - localStorage is the source of truth
      } catch {
        // Ignore server errors
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
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
    localStorage.removeItem('power_insight_user');
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
