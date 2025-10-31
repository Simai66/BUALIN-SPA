import knex from 'knex';
import { env } from './env';

const DATETIME_OID = 1114;
const TIMESTAMPTZ_OID = 1184;

const parseDateTime = (val: string) => val; // Keep as string

export const db = knex({
  client: env.DB_CLIENT,
  connection: {
    filename: env.DB_FILENAME,
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn: any, cb: any) => {
      conn.run('PRAGMA foreign_keys = ON', cb);
    },
  },
  postProcessResponse: (result: any) => {
    // For SQLite, manually convert datetime strings to Date objects if needed
    return result;
  },
  wrapIdentifier: (value: string, origImpl: (value: string) => string) => origImpl(value),
});
