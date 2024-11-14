import { Knex } from 'knex';

exports.up = function(knex: Knex): Promise<void> {
 return knex.schema.withSchema('boodschap_schema').table('boodschaps', function(table) {
   // Remove user_id_done column
   table.dropColumn('user_id_done');
 });
};

exports.down = function(knex: Knex): Promise<void> {
 return knex.schema.withSchema('boodschap_schema').table('boodschaps', function(table) {
   // Restore user_id_done column
   table.integer('user_id_done');
 });
};