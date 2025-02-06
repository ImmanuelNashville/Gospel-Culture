import faunadb from 'faunadb';
import { FAUNA_COLLECTIONS, FAUNA_INDEXES, IndexFQL } from '../fauna/definitions';
import dotenv from 'dotenv';

dotenv.config();

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNADB_DEV_SECRET_KEY ?? '',
  domain: 'db.us.fauna.com',
  port: 443,
  scheme: 'https',
});
const q = faunadb.query;

async function newCollection(name: string, history_days = 30, ttl_days = null) {
  try {
    try {
      await faunaClient.query(q.Get(q.Collection(name)));
      console.info(`Skipping creating Collection "${name}" because it already exists`);
    } catch (error) {
      // @ts-expect-error
      if (error.description.startsWith('Ref refers to undefined collection')) {
        const collection = await faunaClient.query(q.CreateCollection({ name, history_days, ttl_days }));
        console.info(`Successfully created ${name}`);
        return collection;
      }
    }
  } catch (error) {
    console.error(`Failed when creating "${name}"" collection: ${String(error)}`);
    return null;
  }
}

async function newIndex(fql: IndexFQL) {
  try {
    try {
      await faunaClient.query(q.Get(q.Index(fql.name)));
      console.info(`Skipping creating Index "${fql.name}" because it already exists`);
    } catch (error) {
      // @ts-expect-error
      if (error.description.startsWith('Ref refers to undefined index')) {
        const index = await faunaClient.query(
          q.CreateIndex({
            ...fql,
            source: q.Collection(fql.source),
          })
        );
        console.info(`Successfully created "${fql.name}" index on "${fql.source}"`);
        return index;
      }
    }
  } catch (error) {
    console.error(`Failed when creating "${fql.name}"" index: ${String(error)}`);
    return null;
  }
}

async function main() {
  // Create Collections
  console.info('CREATING COLLECTIONS...');
  for (const collection of FAUNA_COLLECTIONS) {
    await newCollection(collection);
  }

  // Create Indexes
  console.info('CREATING INDEXES...');
  for (const index of FAUNA_INDEXES) {
    await newIndex(index);
  }
}

main();
