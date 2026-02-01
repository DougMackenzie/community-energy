'use client';

/**
 * Registration Form for Power Insight
 *
 * Collects user identity for access to utility benchmarks and scoring.
 * Designed to be low-friction while capturing meaningful information.
 */

import { useState, FormEvent } from 'react';
import { useAuth, isAutoApprovedDomain, type RegistrationData } from '@/hooks/useAuth';

// ============================================
// INTENDED USE OPTIONS
// ============================================

const INTENDED_USE_OPTIONS = [
  { value: 'research', label: 'Academic / Research' },
  { value: 'utility_planning', label: 'Utility Planning & Analysis' },
  { value: 'regulatory', label: 'Regulatory / Policy Analysis' },
  { value: 'journalism', label: 'Journalism / Media' },
  { value: 'consulting', label: 'Energy Consulting' },
  { value: 'community', label: 'Community Advocacy' },
  { value: 'personal', label: 'Personal Interest / Education' },
  { value: 'developer', label: 'Data Center Developer' },
  { value: 'other', label: 'Other' },
];

// ============================================
// COMPONENT
// ============================================

interface RegistrationFormProps {
  onClose?: () => void;
  inline?: boolean; // If true, renders without modal wrapper
}

export default function RegistrationForm({ onClose, inline = false }: RegistrationFormProps) {
  const { register, closeRegistration } = useAuth();

  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    name: '',
    organization: '',
    role: '',
    intendedUse: '',
  });
  const [otherUse, setOtherUse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailDomainNote, setEmailDomainNote] = useState<string | null>(null);

  // Check email domain on change
  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));

    if (email.includes('@')) {
      if (isAutoApprovedDomain(email)) {
        setEmailDomainNote('✓ Recognized institutional domain');
      } else {
        setEmailDomainNote(null);
      }
    } else {
      setEmailDomainNote(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate
    if (!formData.email || !formData.name || !formData.organization || !formData.intendedUse) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Prepare data
    const submissionData: RegistrationData = {
      ...formData,
      intendedUse: formData.intendedUse === 'other' ? otherUse : formData.intendedUse,
    };

    const result = await register(submissionData);

    if (result.success) {
      onClose?.();
    } else {
      setError(result.error || 'Registration failed');
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    closeRegistration();
    onClose?.();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Access Utility Data</h2>
        <p className="text-gray-600 mt-2">
          Help us understand who's using this research tool.
          <br />
          <span className="text-sm text-gray-500">All fields are required. Your information won't be shared publicly.</span>
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="you@organization.com"
          required
        />
        {emailDomainNote && (
          <p className="mt-1 text-sm text-green-600">{emailDomainNote}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="Your name"
          required
        />
      </div>

      {/* Organization */}
      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
          Organization
        </label>
        <input
          type="text"
          id="organization"
          value={formData.organization}
          onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="Company, university, agency, etc."
          required
        />
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role / Title
        </label>
        <input
          type="text"
          id="role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="Your position or role"
        />
      </div>

      {/* Intended Use */}
      <div>
        <label htmlFor="intendedUse" className="block text-sm font-medium text-gray-700 mb-1">
          How will you use this data?
        </label>
        <select
          id="intendedUse"
          value={formData.intendedUse}
          onChange={(e) => setFormData(prev => ({ ...prev, intendedUse: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          required
        >
          <option value="">Select primary use...</option>
          {INTENDED_USE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {formData.intendedUse === 'other' && (
          <input
            type="text"
            value={otherUse}
            onChange={(e) => setOtherUse(e.target.value)}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Please describe your intended use..."
            required
          />
        )}
      </div>

      {/* Context note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Why we ask:</strong> This tool presents utility scoring that requires context to interpret correctly.
        Knowing our users helps us provide appropriate guidance and understand how the data is being used.
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Registering...' : 'Access Utility Data'}
      </button>

      {/* Privacy note */}
      <p className="text-xs text-gray-500 text-center">
        By registering, you acknowledge this is a research tool and results should be interpreted with appropriate expertise.
        We don't sell or share your personal information.
      </p>
    </form>
  );

  // If inline, just return the form
  if (inline) {
    return formContent;
  }

  // Otherwise, wrap in modal
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {formContent}
      </div>
    </div>
  );
}
