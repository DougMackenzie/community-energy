/**
 * Access Logging API
 *
 * Logs user access for analytics and monitoring.
 * Fire-and-forget endpoint.
 *
 * POST /api/auth/log-access
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// ============================================
// TYPES
// ============================================

interface AccessLog {
  userId: string;
  timestamp: string;
  path?: string;
  userAgent?: string;
}

interface AccessLogFile {
  logs: AccessLog[];
  lastUpdated: string;
}

interface RegisteredUser {
  id: string;
  accessCount: number;
  lastAccessAt: string;
  sessionToken: string;
  [key: string]: unknown;
}

interface UserRegistry {
  users: RegisteredUser[];
  lastUpdated: string;
}

// ============================================
// FILE STORAGE
// ============================================

const REGISTRY_PATH = path.join(process.cwd(), 'data', 'user-registry.json');
const ACCESS_LOG_PATH = path.join(process.cwd(), 'data', 'access-log.json');

async function ensureLogExists(): Promise<void> {
  const dataDir = path.dirname(ACCESS_LOG_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  try {
    await fs.access(ACCESS_LOG_PATH);
  } catch {
    const emptyLog: AccessLogFile = { logs: [], lastUpdated: new Date().toISOString() };
    await fs.writeFile(ACCESS_LOG_PATH, JSON.stringify(emptyLog, null, 2));
  }
}

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
    const { userId, path: accessPath } = body;

    if (!userId) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Update user's access count in registry
    const registry = await getRegistry();
    if (registry) {
      const user = registry.users.find(u => u.id === userId);
      if (user) {
        user.accessCount += 1;
        user.lastAccessAt = new Date().toISOString();
        await saveRegistry(registry);
      }
    }

    // Also log to access log file (for analytics)
    await ensureLogExists();
    const logData = await fs.readFile(ACCESS_LOG_PATH, 'utf-8');
    const accessLog: AccessLogFile = JSON.parse(logData);

    accessLog.logs.push({
      userId,
      timestamp: new Date().toISOString(),
      path: accessPath,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Keep only last 10,000 logs (simple cleanup)
    if (accessLog.logs.length > 10000) {
      accessLog.logs = accessLog.logs.slice(-10000);
    }

    accessLog.lastUpdated = new Date().toISOString();
    await fs.writeFile(ACCESS_LOG_PATH, JSON.stringify(accessLog, null, 2));

    return NextResponse.json({ success: true });

  } catch (error) {
    // Fire and forget - don't fail on logging errors
    console.error('Access logging error:', error);
    return NextResponse.json({ success: true });
  }
}
