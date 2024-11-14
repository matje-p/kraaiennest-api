import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Delete the failed migration record
  await knex('knex_migrations')
    .where('name', '20241110100237_add_household_uuid_to_boodschaps.ts')
    .del();
}

export async function down(_knex: Knex): Promise<void> {
  // Nothing to do in down migration
}