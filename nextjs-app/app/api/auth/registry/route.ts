/**
 * User Registry API (Admin View)
 *
 * Returns all registered users for admin review.
 * In production, add proper authentication for this endpoint.
 *
 * GET /api/auth/registry
 * GET /api/auth/registry?format=csv
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// ============================================
// TYPES
// ============================================

interface RegisteredUser {
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
  sessionToken: string;
}

interface UserRegistry {
  users: RegisteredUser[];
  lastUpdated: string;
}

// ============================================
// FILE STORAGE
// ============================================

const REGISTRY_PATH = path.join(process.cwd(), 'data', 'user-registry.json');

async function getRegistry(): Promise<UserRegistry | null> {
  try {
    const data = await fs.readFile(REGISTRY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// ============================================
// API HANDLER
// ============================================

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, this is accessible but you should add protection
    // Options:
    // 1. Check for admin API key in header
    // 2. Check for admin session
    // 3. IP whitelist
    // 4. Basic auth

    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_API_KEY;

    // If ADMIN_API_KEY is set, require it
    if (expectedKey && adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const registry = await getRegistry();

    if (!registry) {
      return NextResponse.json({
        success: true,
        users: [],
        stats: {
          total: 0,
          autoApproved: 0,
          manualReview: 0,
          byIntendedUse: {},
          byDomain: {},
        },
      });
    }

    // Check format parameter
    const format = request.nextUrl.searchParams.get('format');

    if (format === 'csv') {
      // Return as CSV
      const headers = ['id', 'email', 'name', 'organization', 'role', 'intendedUse', 'registeredAt', 'lastAccessAt', 'accessCount', 'domain', 'autoApproved', 'status'];
      const csvRows = [headers.join(',')];

      for (const user of registry.users) {
        const row = headers.map(h => {
          const value = user[h as keyof RegisteredUser];
          // Escape quotes and wrap in quotes if contains comma
          const strValue = String(value ?? '');
          if (strValue.includes(',') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        });
        csvRows.push(row.join(','));
      }

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="user-registry-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Calculate stats
    const stats = {
      total: registry.users.length,
      autoApproved: registry.users.filter(u => u.autoApproved).length,
      manualReview: registry.users.filter(u => !u.autoApproved).length,
      active: registry.users.filter(u => u.status === 'active').length,
      byIntendedUse: {} as Record<string, number>,
      byDomain: {} as Record<string, number>,
      recentRegistrations: registry.users
        .filter(u => {
          const regDate = new Date(u.registeredAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return regDate > weekAgo;
        })
        .length,
    };

    for (const user of registry.users) {
      // Count by intended use
      const use = user.intendedUse || 'unspecified';
      stats.byIntendedUse[use] = (stats.byIntendedUse[use] || 0) + 1;

      // Count by domain
      const domain = user.domain || 'unknown';
      stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
    }

    // Sort domains by count
    const sortedDomains = Object.entries(stats.byDomain)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    stats.byDomain = Object.fromEntries(sortedDomains);

    // Remove session tokens from user data
    const safeUsers = registry.users.map(({ sessionToken, ...user }) => user);

    return NextResponse.json({
      success: true,
      users: safeUsers,
      stats,
      lastUpdated: registry.lastUpdated,
    });

  } catch (error) {
    console.error('Registry fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
