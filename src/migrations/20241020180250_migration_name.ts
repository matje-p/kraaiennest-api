import { Knex } from 'knex';

exports.up = function(knex: Knex): Promise<void> {
  return knex.schema.withSchema('user_schema').table('users', function(table) {
    table.string('last_name');
    table.integer('default_household_id')
  });
};

exports.down = function(knex: Knex): Promise<void> {
  return knex.schema.withSchema('user_schema').table('users', function(table) {
    table.dropColumn('last_name');
    table.dropColumn('default_household_id');
  });
};
