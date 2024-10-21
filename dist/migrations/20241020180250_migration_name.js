"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = function (knex) {
    return knex.schema.withSchema('user_schema').table('users', function (table) {
        table.string('last_name');
        table.integer('default_household_id');
    });
};
exports.down = function (knex) {
    return knex.schema.withSchema('user_schema').table('users', function (table) {
        table.dropColumn('last_name');
        table.dropColumn('default_household_id');
    });
};
