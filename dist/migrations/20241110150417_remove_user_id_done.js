"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = function (knex) {
    return knex.schema.withSchema('boodschap_schema').table('boodschaps', function (table) {
        // Remove user_id_done column
        table.dropColumn('user_id_done');
    });
};
exports.down = function (knex) {
    return knex.schema.withSchema('boodschap_schema').table('boodschaps', function (table) {
        // Restore user_id_done column
        table.integer('user_id_done');
    });
};
