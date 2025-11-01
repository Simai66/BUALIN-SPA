import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add updated_at column to users table (SQLite: cannot add non-constant default)
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('updated_at');
  });

  // Backfill existing rows to avoid NULLs
  await knex('users').update({ updated_at: knex.fn.now() });
}

export async function down(knex: Knex): Promise<void> {
  // Drop column (SQLite may recreate table under the hood)
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('updated_at');
  });
}