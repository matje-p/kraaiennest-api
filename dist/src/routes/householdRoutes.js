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
const express_1 = require("express");
const index_1 = require("../index");
const caseConversions_1 = require("../utils/caseConversions");
const router = (0, express_1.Router)();
// Fetch households for a user
router.get('/', (req, res) => {
    console.log('Household root route hit');
    res.send('Household API Running');
});
router.get('/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailAddress } = req.query;
    try {
        console.log(`Fetching households for user: ${emailAddress}`);
        const userResult = yield req.db.query('SELECT households FROM user_schema.users WHERE email_address = $1', [emailAddress]);
        // Check if the user exists
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get the list of household names from the user's record
        const { households } = userResult.rows[0];
        // If no households are found, return an empty array
        if (households.length === 0) {
            return res.json([]);
        }
        // Query to fetch the household details from the household_schema.households table
        const householdsResult = yield req.db.query(`SELECT * FROM household_schema.households WHERE household_name = ANY($1::text[])`, [households]);
        // Convert keys from snake_case to camelCase if needed
        const householdData = householdsResult.rows.map(row => (0, caseConversions_1.convertKeysSnakeToCamel)(row));
        res.json(householdData);
    }
    catch (err) {
        console.error('Error fetching household data:', err);
        if ((0, index_1.isError)(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
exports.default = router;
