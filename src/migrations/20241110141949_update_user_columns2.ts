import { Knex } from 'knex';

exports.up = function(knex: Knex): Promise<void> {
  return knex.schema.withSchema('boodschap_schema').table('boodschaps', function(table) {
    // Rename columns
    table.renameColumn('household', 'household_uuid');
    table.renameColumn('user_added', 'user_added_uuid');
    table.renameColumn('user_done', 'user_done_uuid');
    table.renameColumn('user_changed', 'user_changed_uuid');
    table.renameColumn('user_removed', 'user_removed_uuid');

    // Remove columns
    table.dropColumn('household_id');
    table.dropColumn('household_name');
    table.dropColumn('user_id_added');
    table.dropColumn('user_changed_id');
    table.dropColumn('user_removed_id');
  });
};

exports.down = function(knex: Knex): Promise<void> {
  return knex.schema.withSchema('boodschap_schema').table('boodschaps', function(table) {
    // Restore original column names
    table.renameColumn('household_uuid', 'household');
    table.renameColumn('user_added_uuid', 'user_added');
    table.renameColumn('user_done_uuid', 'user_done');
    table.renameColumn('user_changed_uuid', 'user_changed');
    table.renameColumn('user_removed_uuid', 'user_removed');

    // Restore removed columns
    table.string('household_id');
    table.string('household_name');
    table.integer('user_id_added');
    table.integer('user_changed_id');
    table.integer('user_removed_id');
  });
};