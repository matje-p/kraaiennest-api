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
// Adding a 'sub' column to the 'users' table and updating specific records
exports.up = function (knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add 'sub' column to 'users' table
        yield knex.schema.withSchema('user_schema').table('users', function (table) {
            table.string('sub'); // Add the new 'sub' column
        });
        // Update specific records with 'sub' values based on 'first_name'
        yield knex('user_schema.users').where('first_name', 'Matthias').update({ sub: 'auth0|66896ddca76872a0cb060171' });
        yield knex('user_schema.users').where('first_name', 'Sarah').update({ sub: 'auth0|6692dadc8072c6037885d95e' });
        yield knex('user_schema.users').where('first_name', 'Anna').update({ sub: 'auth0|669fa836f169e435dbdaff12' });
        yield knex('user_schema.users').where('first_name', 'Ruben').update({ sub: 'auth0|669fa7cae6d5fdc532ae8161' });
        yield knex('user_schema.users').where('first_name', 'Luka').update({ sub: 'auth0|669fad7af169e435dbdb0589' });
    });
};
// Rollback: removing the 'sub' column
exports.down = function (knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.withSchema('user_schema').table('users', function (table) {
            table.dropColumn('sub');
        });
    });
};
