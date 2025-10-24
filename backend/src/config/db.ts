import knex from 'knex';
import { env } from './env';

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
});
