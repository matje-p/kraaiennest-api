import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add UUID column to boodschaps
  await knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
    table.uuid('boodschap_uuid').unique();
  });

  // Add UUID column to users
  await knex.schema.withSchema('user_schema').alterTable('users', (table) => {
    table.uuid('user_uuid').unique();
  });

  // Add UUID column to households
  await knex.schema.withSchema('household_schema').alterTable('households', (table) => {
    table.uuid('household_uuid').unique();
  });

  // Generate and populate UUIDs
  await knex.raw(`
    UPDATE boodschap_schema.boodschaps 
    SET boodschap_uuid = gen_random_uuid()
    WHERE boodschap_uuid IS NULL
  `);

  await knex.raw(`
    UPDATE user_schema.users 
    SET user_uuid = gen_random_uuid()
    WHERE user_uuid IS NULL
  `);

  await knex.raw(`
    UPDATE household_schema.households 
    SET household_uuid = gen_random_uuid()
    WHERE household_uuid IS NULL
  `);

  // Make UUID columns not nullable after population
  await knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
    table.uuid('boodschap_uuid').notNullable().alter();
  });

  await knex.schema.withSchema('user_schema').alterTable('users', (table) => {
    table.uuid('user_uuid').notNullable().alter();
  });

  await knex.schema.withSchema('household_schema').alterTable('households', (table) => {
    table.uuid('household_uuid').notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
    table.dropColumn('boodschap_uuid');
  });

  await knex.schema.withSchema('user_schema').alterTable('users', (table) => {
    table.dropColumn('user_uuid');
  });

  await knex.schema.withSchema('household_schema').alterTable('households', (table) => {
    table.dropColumn('household_uuid');
  });
}