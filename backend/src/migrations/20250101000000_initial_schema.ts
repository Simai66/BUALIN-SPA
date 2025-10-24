import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('phone', 50);
    table.string('password_hash', 255).notNullable();
    table.boolean('is_verified').defaultTo(false);
    table.string('verify_token', 255);
    table.timestamp('verify_token_expires');
    table.enum('role', ['admin', 'user']).defaultTo('user');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('services', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.text('description');
    table.integer('duration_minutes').notNullable();
    table.decimal('base_price', 10, 2).notNullable();
    table.string('image_path', 500);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('service_prices', (table) => {
    table.increments('id').primary();
    table.integer('service_id').unsigned().notNullable()
      .references('id').inTable('services').onDelete('CASCADE');
    table.decimal('price', 10, 2).notNullable();
    table.timestamp('started_at').notNullable();
    table.timestamp('ended_at').nullable();
    table.index(['service_id', 'started_at']);
  });

  await knex.schema.createTable('promotions', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description');
    table.enum('discount_type', ['percent', 'amount']).notNullable();
    table.decimal('discount_value', 10, 2).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.index(['start_date', 'end_date', 'is_active']);
  });

  await knex.schema.createTable('therapists', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('specialty', 255);
    table.text('bio');
    table.boolean('is_active').defaultTo(true);
  });

  await knex.schema.createTable('schedules', (table) => {
    table.increments('id').primary();
    table.integer('therapist_id').unsigned().notNullable()
      .references('id').inTable('therapists').onDelete('CASCADE');
    table.timestamp('start_datetime').notNullable();
    table.timestamp('end_datetime').notNullable();
    table.string('note', 500);
    table.index(['therapist_id', 'start_datetime', 'end_datetime']);
  });

  await knex.schema.createTable('timesheets', (table) => {
    table.increments('id').primary();
    table.integer('therapist_id').unsigned().notNullable()
      .references('id').inTable('therapists').onDelete('CASCADE');
    table.timestamp('clock_in').notNullable();
    table.timestamp('clock_out').nullable();
    table.index(['therapist_id', 'clock_in']);
  });

  await knex.schema.createTable('gallery', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.string('image_path', 500).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('bookings', (table) => {
    table.increments('id').primary();
    table.string('customer_name', 255).notNullable();
    table.string('customer_phone', 50).notNullable();
    table.integer('service_id').unsigned().notNullable()
      .references('id').inTable('services').onDelete('RESTRICT');
    table.integer('therapist_id').unsigned().notNullable()
      .references('id').inTable('therapists').onDelete('RESTRICT');
    table.timestamp('booking_datetime').notNullable();
    table.enum('status', ['pending', 'confirmed', 'done', 'cancelled']).defaultTo('pending');
    table.decimal('price_at_booking', 10, 2).notNullable();
    table.integer('promotion_id').unsigned().nullable()
      .references('id').inTable('promotions').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['booking_datetime', 'status']);
    table.index(['service_id']);
    table.index(['therapist_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bookings');
  await knex.schema.dropTableIfExists('gallery');
  await knex.schema.dropTableIfExists('timesheets');
  await knex.schema.dropTableIfExists('schedules');
  await knex.schema.dropTableIfExists('therapists');
  await knex.schema.dropTableIfExists('promotions');
  await knex.schema.dropTableIfExists('service_prices');
  await knex.schema.dropTableIfExists('services');
  await knex.schema.dropTableIfExists('users');
}
