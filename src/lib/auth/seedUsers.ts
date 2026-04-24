import bcrypt from 'bcrypt';
import { upsertUser } from '../database/database';

/**
 * Seeds the 3 auth accounts from environment variables.
 * Idempotent — re-runs are safe (upsert, not insert).
 * Called on app boot via next.config.ts instrumentation.
 */
export async function seedAuthUsers(): Promise<void> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const reviewerPassword = process.env.REVIEWER_PASSWORD;
  const observerPassword = process.env.OBSERVER_PASSWORD;

  if (!adminPassword || !reviewerPassword || !observerPassword) {
    console.warn(
      '[auth] Missing password env vars (ADMIN_PASSWORD / REVIEWER_PASSWORD / OBSERVER_PASSWORD). Skipping user seed.'
    );
    return;
  }

  const SALT_ROUNDS = 10;

  upsertUser(
    'admin@argus-platform.onrender.com',
    await bcrypt.hash(adminPassword, SALT_ROUNDS),
    'admin',
    'Administrator'
  );

  upsertUser(
    'reviewer@argus-platform.com',
    await bcrypt.hash(reviewerPassword, SALT_ROUNDS),
    'allocator',
    'Reviewer'
  );

  upsertUser(
    'observer@argus-platform.com',
    await bcrypt.hash(observerPassword, SALT_ROUNDS),
    'analyst',
    'Observer'
  );

  console.log('[auth] Seeded 3 user accounts (admin/allocator/analyst)');
}
