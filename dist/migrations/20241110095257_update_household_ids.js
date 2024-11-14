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
        yield knex.raw(`
    UPDATE user_schema.users
    SET households = ARRAY(
      SELECT CASE 
        WHEN value = 'masdeslucioles' THEN '4819de64-1b84-464d-bbbb-4e1ad2f6d83d'
        WHEN value = 'barnfield' THEN '17167c43-09ba-4fe6-b00f-77be60559f01'
        ELSE value
      END
      FROM unnest(households) AS value
    )
  `);
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.raw(`
    UPDATE user_schema.users
    SET households = ARRAY(
      SELECT CASE 
        WHEN value = '4819de64-1b84-464d-bbbb-4e1ad2f6d83d' THEN 'masdeslucioles'
        WHEN value = '17167c43-09ba-4fe6-b00f-77be60559f01' THEN 'barnfield'
        ELSE value
      END
      FROM unnest(households) AS value
    )
  `);
    });
}
