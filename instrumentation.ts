/**
 * Next.js instrumentation hook — runs once on server boot.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { seedAuthUsers } = await import('./src/lib/auth/seedUsers');
    await seedAuthUsers();
  }
}
