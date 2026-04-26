/**
 * Next.js instrumentation hook — runs once on server boot.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  console.log('[instrumentation] register() invoked. NEXT_RUNTIME =', process.env.NEXT_RUNTIME);
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { seedAuthUsers } = await import('./src/lib/auth/seedUsers');
      await seedAuthUsers();
    } catch (err) {
      console.error('[instrumentation] FATAL — register() threw:', err);
    }
  }
}
