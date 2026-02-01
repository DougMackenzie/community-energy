/**
 * Session Validation API
 *
 * Validates a session token and returns the user if valid.
 *
 * POST /api/auth/validate
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

async function saveRegistry(registry: UserRegistry): Promise<void> {
  registry.lastUpdated = new Date().toISOString();
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

// ============================================
// API HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    const registry = await getRegistry();

    if (!registry) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 401 }
      );
    }

    // Find user by session token
    const user = registry.users.find(u => u.sessionToken === token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if user is still active
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Update last access time
    user.lastAccessAt = new Date().toISOString();
    await saveRegistry(registry);

    // Return user without session token
    const { sessionToken, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
