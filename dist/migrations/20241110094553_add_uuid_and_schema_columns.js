"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add UUID column to boodschaps
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.uuid('boodschap_uuid').unique();
        });
        // Add UUID column to users
        yield knex.schema.withSchema('user_schema').alterTable('users', (table) => {
            table.uuid('user_uuid').unique();
        });
        // Add UUID column to households
        yield knex.schema.withSchema('household_schema').alterTable('households', (table) => {
            table.uuid('household_uuid').unique();
        });
        // Generate and populate UUIDs
        yield knex.raw(`
    UPDATE boodschap_schema.boodschaps 
    SET boodschap_uuid = gen_random_uuid()
    WHERE boodschap_uuid IS NULL
  `);
        yield knex.raw(`
    UPDATE user_schema.users 
    SET user_uuid = gen_random_uuid()
    WHERE user_uuid IS NULL
  `);
        yield knex.raw(`
    UPDATE household_schema.households 
    SET household_uuid = gen_random_uuid()
    WHERE household_uuid IS NULL
  `);
        // Make UUID columns not nullable after population
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.uuid('boodschap_uuid').notNullable().alter();
        });
        yield knex.schema.withSchema('user_schema').alterTable('users', (table) => {
            table.uuid('user_uuid').notNullable().alter();
        });
        yield knex.schema.withSchema('household_schema').alterTable('households', (table) => {
            table.uuid('household_uuid').notNullable().alter();
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.dropColumn('boodschap_uuid');
        });
        yield knex.schema.withSchema('user_schema').alterTable('users', (table) => {
            table.dropColumn('user_uuid');
        });
        yield knex.schema.withSchema('household_schema').alterTable('households', (table) => {
            table.dropColumn('household_uuid');
        });
    });
}
