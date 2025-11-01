import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('therapist_days_off', (table) => {
    table.increments('id').primary();
    table
      .integer('therapist_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('therapists')
      .onDelete('CASCADE');
    // Use DATE (stored as text in SQLite) in YYYY-MM-DD format
    table.date('day_off').notNullable();
    table.string('note', 500);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['therapist_id', 'day_off']);
    table.index(['therapist_id', 'day_off']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('therapist_days_off');
}