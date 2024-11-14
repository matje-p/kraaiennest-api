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
// Fetch all data for the authenticated user
router.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sub = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
    console.log("Request for user data with userId (sub): ", sub);
    try {
        const result = yield req.db.query(`
        WITH user_data AS (
        SELECT * FROM user_schema.users 
        WHERE sub = $1
        )
        SELECT 
        user_data.user_uuid,
        user_data.email_address,
        user_data.first_name,
        user_data.last_name,
        user_data.sub,
        user_data.households,
        user_data.default_household,
        COALESCE(
            json_agg(
            json_build_object(
                'household_uuid', h.household_uuid,
                'name', h.household_full_name
            )
            ) FILTER (WHERE h.household_uuid IS NOT NULL),
            '[]'::json
        ) as household_data,
        COALESCE(
            (
            SELECT json_agg(
                json_build_object(
                    'boodschap_id', b.boodschap_id,
                    'item', b.item,
                    'date_added', b.date_added,
                    'date_done', b.date_done,
                    'done', b.done,
                    'date_changed', b.date_changed,
                    'date_removed', b.date_removed,
                    'changed', b.changed,
                    'boodschap_uuid', b.boodschap_uuid,
                    'household_uuid', b.household_uuid,
                    'user_added_uuid', b.user_added_uuid,
                    'user_done_uuid', b.user_done_uuid,
                    'user_changed_uuid', b.user_changed_uuid,
                    'user_removed_uuid', b.user_removed_uuid,
                    'user_added_firstname', b.user_added_firstname,
                    'user_done_firstname', b.user_done_firstname,
                    'user_changed_firstname', b.user_changed_firstname,
                    'user_removed_firstname', b.user_removed_firstname
                )
            )
            FROM boodschap_schema.boodschaps b
            WHERE b.household_uuid::uuid = ANY(user_data.households::uuid[])
            AND b.removed = false
            ),
            '[]'::json
        ) as boodschaps_data
        FROM user_data
        LEFT JOIN household_schema.households h 
        ON h.household_uuid::text = ANY(user_data.households)
        GROUP BY 
        user_data.user_uuid,
        user_data.email_address,
        user_data.first_name,
        user_data.last_name,
        user_data.sub,
        user_data.households,
        user_data.default_household
    `, [sub]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
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
