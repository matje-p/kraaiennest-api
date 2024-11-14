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
        // First, let's check what values we have
        const results = yield knex.raw(`
    SELECT DISTINCT household_name 
    FROM boodschap_schema.boodschaps 
    ORDER BY household_name;
  `);
        console.log('Unique household_name values:', results.rows);
        // Add the new column
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.uuid('household');
        });
        // Update with better null handling
        yield knex.raw(`
    UPDATE boodschap_schema.boodschaps
    SET household = 
      CASE household_name
        WHEN 'masdeslucioles' THEN '4819de64-1b84-464d-bbbb-4e1ad2f6d83d'::uuid
        WHEN 'barnfield' THEN '17167c43-09ba-4fe6-b00f-77be60559f01'::uuid
        -- Add a default UUID for null or unknown values
        ELSE '00000000-0000-0000-0000-000000000000'::uuid
      END
  `);
        // Verify no nulls remain
        const nullCheck = yield knex.raw(`
    SELECT COUNT(*) 
    FROM boodschap_schema.boodschaps 
    WHERE household IS NULL;
  `);
        console.log('Null count after update:', nullCheck.rows[0].count);
        // Make the column not nullable after population
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.uuid('household').notNullable().alter();
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
            table.dropColumn('household');
        });
    });
}
