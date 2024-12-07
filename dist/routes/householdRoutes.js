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
router.get('/:householdUuid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Fetching household data for household:', req.params.householdUuid);
    const { householdUuid } = req.params;
    if (!householdUuid) {
        return res.status(400).json({ error: 'householdUuid is required' });
    }
    try {
        const query = `
      SELECT 
        h.household_full_name,
        h.household_uuid,
        json_agg(
          json_build_object(
            'firstName', u.first_name,
            'lastName', u.last_name,
            'userUuid', u.user_uuid 
          )
        ) as household_members
      FROM household_schema.households h
      LEFT JOIN user_schema.users u ON ($1::uuid)::text = ANY(u.households)
      WHERE h.household_uuid = $1::uuid
      GROUP BY 
        h.household_full_name,
        h.household_uuid`; // Added household_uuid to GROUP BY
        const result = yield req.db.query(query, [householdUuid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Household not found' });
        }
        const transformed = (0, caseConversions_1.convertKeysSnakeToCamel)(result.rows[0]);
        // Filter out any null members that might come from the LEFT JOIN
        res.json(transformed);
    }
    catch (err) {
        console.error('Error fetching household:', err);
        if ((0, index_1.isError)(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
router.post('/:householdUuid/invitations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { householdUuid } = req.params;
    const sub = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
    if (!householdUuid) {
        return res.status(400).json({ error: 'householdUuid is required' });
    }
    if (!sub) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Get user's UUID from their sub
        const userQuery = `
      SELECT user_uuid 
      FROM user_schema.users 
      WHERE sub = $1`;
        const userResult = yield req.db.query(userQuery, [sub]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userUuid = userResult.rows[0].user_uuid;
        // Verify user has access to this household
        const accessQuery = `
      SELECT 1 FROM user_schema.users 
      WHERE sub = $1 
      AND $2::uuid::text = ANY(households)`;
        const accessResult = yield req.db.query(accessQuery, [sub, householdUuid]);
        if (accessResult.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to create invitations for this household' });
        }
        // Generate a random invite code (6 characters)
        const generateInviteCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        };
        // Keep generating until we find a unique code
        let inviteCode;
        let isUnique = false;
        while (!isUnique) {
            inviteCode = generateInviteCode();
            const checkResult = yield req.db.query('SELECT 1 FROM household_schema.invitations WHERE invite_code = $1', [inviteCode]);
            isUnique = checkResult.rows.length === 0;
        }
        // Insert the invitation
        const query = `
      INSERT INTO household_schema.invitations (
        invite_uuid,
        household_uuid,
        invite_code,
        created_by_uuid,
        expires_at,
        used_by_uuid,
        max_uses,
        is_active
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      ) RETURNING invite_code`;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        const result = yield req.db.query(query, [
            householdUuid,
            inviteCode,
            userUuid, // Now using the UUID we got from the user query
            expirationDate,
            [],
            null,
            true
        ]);
        res.json({ inviteCode: result.rows[0].invite_code });
    }
    catch (err) {
        console.error('Error creating invitation:', err);
        if ((0, index_1.isError)(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Failed to create invitation' });
        }
    }
}));
router.post('/invitations/:inviteCode/accept', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { inviteCode } = req.params;
    const sub = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
    if (!sub) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Get invitation details
        const inviteQuery = `
      SELECT household_uuid, is_active, expires_at 
      FROM household_schema.invitations 
      WHERE invite_code = $1`;
        const inviteResult = yield req.db.query(inviteQuery, [inviteCode]);
        if (inviteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invitation not found' });
        }
        const invite = inviteResult.rows[0];
        if (!invite.is_active) {
            return res.status(400).json({ error: 'Invitation is no longer active' });
        }
        if (new Date() > invite.expires_at) {
            return res.status(400).json({ error: 'Invitation has expired' });
        }
        // Add household to user's households array
        const updateQuery = `
      UPDATE user_schema.users 
      SET households = array_append(households, $1::text)
      WHERE sub = $2
      RETURNING user_uuid`;
        const updateResult = yield req.db.query(updateQuery, [invite.household_uuid, sub]);
        // Mark invitation as used
        yield req.db.query(`
      UPDATE household_schema.invitations 
      SET used_by_uuid = array_append(used_by_uuid, $1::uuid)
      WHERE invite_code = $2`, [updateResult.rows[0].user_uuid, inviteCode]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Error accepting invitation:', err);
        if ((0, index_1.isError)(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Failed to accept invitation' });
        }
    }
}));
exports.default = router;
