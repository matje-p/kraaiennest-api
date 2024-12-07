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
        // First rename the existing columns
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.renameColumn('user_added', 'user_added_firstname');
            table.renameColumn('user_done', 'user_done_firstname');
            table.renameColumn('user_changed', 'user_changed_firstname');
            table.renameColumn('user_removed', 'user_removed_firstname');
        });
        // Add new UUID columns
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.uuid('user_added');
            table.uuid('user_done');
            table.uuid('user_changed');
            table.uuid('user_removed');
        });
        // Update the new columns based on the firstname mappings
        yield knex.raw(`
    UPDATE boodschap_schema.boodschaps
    SET 
      user_added = CASE user_added_firstname
        WHEN 'Jelle' THEN 'f6867ee7-da4b-401d-a58b-e00749a01f04'::uuid
        WHEN 'Frederic' THEN 'a8e6d59c-5859-4e76-8545-99b0f583d286'::uuid
        WHEN 'Matthias' THEN '4f5f832f-56e5-43d9-8eb6-4e0a4673f6f4'::uuid
        WHEN 'Sarah' THEN '623c884d-cad4-4979-866e-62690716509d'::uuid
        WHEN 'Anna' THEN 'b7357cfd-e91b-4bb8-8b3a-4a9e4a42bcc1'::uuid
        WHEN 'Ruben' THEN 'd4b95be2-8872-4877-8d3a-bd624dafa4b0'::uuid
        WHEN 'Luka' THEN 'ae2504d4-6981-4d7d-8f35-78544b7cf44d'::uuid
      END,
      user_done = CASE user_done_firstname
        WHEN 'Jelle' THEN 'f6867ee7-da4b-401d-a58b-e00749a01f04'::uuid
        WHEN 'Frederic' THEN 'a8e6d59c-5859-4e76-8545-99b0f583d286'::uuid
        WHEN 'Matthias' THEN '4f5f832f-56e5-43d9-8eb6-4e0a4673f6f4'::uuid
        WHEN 'Sarah' THEN '623c884d-cad4-4979-866e-62690716509d'::uuid
        WHEN 'Anna' THEN 'b7357cfd-e91b-4bb8-8b3a-4a9e4a42bcc1'::uuid
        WHEN 'Ruben' THEN 'd4b95be2-8872-4877-8d3a-bd624dafa4b0'::uuid
        WHEN 'Luka' THEN 'ae2504d4-6981-4d7d-8f35-78544b7cf44d'::uuid
      END,
      user_changed = CASE user_changed_firstname
        WHEN 'Jelle' THEN 'f6867ee7-da4b-401d-a58b-e00749a01f04'::uuid
        WHEN 'Frederic' THEN 'a8e6d59c-5859-4e76-8545-99b0f583d286'::uuid
        WHEN 'Matthias' THEN '4f5f832f-56e5-43d9-8eb6-4e0a4673f6f4'::uuid
        WHEN 'Sarah' THEN '623c884d-cad4-4979-866e-62690716509d'::uuid
        WHEN 'Anna' THEN 'b7357cfd-e91b-4bb8-8b3a-4a9e4a42bcc1'::uuid
        WHEN 'Ruben' THEN 'd4b95be2-8872-4877-8d3a-bd624dafa4b0'::uuid
        WHEN 'Luka' THEN 'ae2504d4-6981-4d7d-8f35-78544b7cf44d'::uuid
      END,
      user_removed = CASE user_removed_firstname
        WHEN 'Jelle' THEN 'f6867ee7-da4b-401d-a58b-e00749a01f04'::uuid
        WHEN 'Frederic' THEN 'a8e6d59c-5859-4e76-8545-99b0f583d286'::uuid
        WHEN 'Matthias' THEN '4f5f832f-56e5-43d9-8eb6-4e0a4673f6f4'::uuid
        WHEN 'Sarah' THEN '623c884d-cad4-4979-866e-62690716509d'::uuid
        WHEN 'Anna' THEN 'b7357cfd-e91b-4bb8-8b3a-4a9e4a42bcc1'::uuid
        WHEN 'Ruben' THEN 'd4b95be2-8872-4877-8d3a-bd624dafa4b0'::uuid
        WHEN 'Luka' THEN 'ae2504d4-6981-4d7d-8f35-78544b7cf44d'::uuid
      END
  `);
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // First drop the UUID columns
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.dropColumn('user_added');
            table.dropColumn('user_done');
            table.dropColumn('user_changed');
            table.dropColumn('user_removed');
        });
        // Then rename the columns back to their original names
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.renameColumn('user_added_firstname', 'user_added');
            table.renameColumn('user_done_firstname', 'user_done');
            table.renameColumn('user_changed_firstname', 'user_changed');
            table.renameColumn('user_removed_firstname', 'user_removed');
        });
    });
}