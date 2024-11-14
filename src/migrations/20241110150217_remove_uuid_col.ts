import { Knex } from 'knex';

exports.up = function(knex: Knex): Promise<void> {
  return knex.schema.withSchema('boodschap_schema').table('boodschaps', function(table) {
    // Remove the uuid column since it's redundant with boodschap_uuid
    table.dropColumn('uuid');
  });
};

exports.down = function(knex: Knex): Promise<void> {
  return knex.schema.withSchema('boodschap_schema').table('boodschaps', function(table) {
    // Restore the uuid column
    // Note: This will restore the column but the data will be lost
    table.uuid('uuid');

    // Optionally, you could copy data from boodschap_uuid to uuid if needed
    // This would need to be done in a separate raw query after the column is created
    /* 
    knex.raw(`
      UPDATE boodschap_schema.boodschaps 
      SET uuid = boodschap_uuid 
      WHERE uuid IS NULL;
    `);
    */
  });
};