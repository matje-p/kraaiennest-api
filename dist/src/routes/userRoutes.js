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
    console.log('User root route hit');
    res.send('User API Running');
});
// Fetch all data for a particular user
router.get('/email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailAddress } = req.query; // Retrieve emailAddress from query parameters
    try {
        // Query the database for the user data by email_address
        const result = yield req.db.query('SELECT * FROM user_schema.users WHERE email_address = $1', [emailAddress]);
        // Check if the user exists
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Convert keys from snake_case to camelCase if needed
        const userData = (0, caseConversions_1.convertKeysSnakeToCamel)(result.rows[0]);
        res.json(userData);
    }
    catch (err) {
        console.error('Error fetching user data:', err);
        if ((0, index_1.isError)(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
exports.default = router;
