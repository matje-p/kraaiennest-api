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
        yield knex.schema.withSchema('household_schema').createTable('invitations', (table) => {
            table.uuid('invite_uuid').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('household_uuid').notNullable().references('household_uuid').inTable('household_schema.households');
            table.text('invite_code').notNullable().unique();
            table.uuid('created_by_uuid').notNullable().references('user_uuid').inTable('user_schema.users');
            table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
            table.timestamp('expires_at', { useTz: true });
            table.specificType('used_by_uuid', 'UUID[]').defaultTo('{}');
            table.integer('max_uses');
            table.boolean('is_active').notNullable().defaultTo(true);
        });
        // Create indexes
        yield knex.schema.raw('CREATE INDEX idx_invitations_household ON household_schema.invitations(household_uuid)');
        yield knex.schema.raw('CREATE INDEX idx_invitations_invite_code ON household_schema.invitations(invite_code)');
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.withSchema('household_schema').dropTableIfExists('invitations');
    });
}
