import faunadb from 'faunadb';

export function createFaunaClientWithQ(options?: { forceProd: boolean }) {
  let secret =
    process.env.NEXT_PUBLIC_APPLICATION_ENV === 'development'
      ? process.env.FAUNADB_DEV_SECRET_KEY ?? ''
      : process.env.FAUNADB_SECRET_KEY ?? '';

  if (options?.forceProd) {
    secret = process.env.FAUNADB_SECRET_KEY ?? '';
  }

  const faunaClient = new faunadb.Client({
    secret,
    domain: 'db.us.fauna.com',
    port: 443,
    scheme: 'https',
  });
  const q = faunadb.query;

  return { faunaClient, q };
}

export const FAUNA_MAX_PAGE_SIZE = 100_000;
