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
router.get('/', (req, res) => {
    console.log('Boodschappen root route hit');
    res.send('Boodschappen API Running');
});
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Adding new boodschap:', req.body);
    try {
        const { householdUuid, item = "", userAddedUuid, // Changed from userAddedUuidFirstname
        userAddedFirstname, // Added this
        dateAdded = new Date().toISOString() } = req.body;
        const result = yield req.db.query(`INSERT INTO boodschap_schema.boodschaps 
      (household_uuid, item, user_added_uuid, user_added_firstname, date_added, removed, done, changed, boodschap_uuid) 
      VALUES ($1, $2, $3, $4, $5, FALSE, FALSE, FALSE, gen_random_uuid()) 
      RETURNING *`, [householdUuid, item, userAddedUuid, userAddedFirstname, dateAdded] // Added userAddedFirstname
        );
        res.json((0, caseConversions_1.convertKeysSnakeToCamel)(result.rows[0]));
    }
    catch (err) {
        console.error('Error adding boodschap:', err);
        if ((0, index_1.isError)(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Do a patch operation on boodschap
router.patch('/:boodschapId/:operation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { boodschapId, operation } = req.params;
    console.log(`Doing operation: "${operation}" on boodschap with id: ${boodschapId}`);
    console.log('Request body:', req.body);
    try {
        let result;
        if (operation === 'toggledone') {
            const { done, userDoneUuid, userDoneFirstname } = (0, caseConversions_1.convertKeysSnakeToCamel)(req.body);
            result = yield req.db.query('UPDATE boodschap_schema.boodschaps SET done = $1, user_done_uuid = $2, user_done_firstname = $3, date_done = CURRENT_TIMESTAMP WHERE boodschap_id = $4 RETURNING *', [done, userDoneUuid, userDoneFirstname, boodschapId]);
        }
        else if (operation === 'remove') {
            const { userRemovedUuid, userRemovedFirstname } = (0, caseConversions_1.convertKeysSnakeToCamel)(req.body);
            result = yield req.db.query('UPDATE boodschap_schema.boodschaps SET removed = TRUE, user_removed_uuid = $1, user_removed_firstname = $2, date_removed = CURRENT_TIMESTAMP WHERE boodschap_id = $3 RETURNING *', [userRemovedUuid, userRemovedFirstname, boodschapId]);
        }
        else if (operation === 'edit') {
            const { item, userChangedUuid, userChangedFirstname } = (0, caseConversions_1.convertKeysSnakeToCamel)(req.body);
            result = yield req.db.query('UPDATE boodschap_schema.boodschaps SET item = $1, user_changed_uuid = $2, user_changed_firstname = $3, date_changed = CURRENT_TIMESTAMP, changed = TRUE WHERE boodschap_id = $4 RETURNING *', [item, userChangedUuid, userChangedFirstname, boodschapId]);
        }
        else {
            return res.status(400).json({ error: 'Invalid operation' });
        }
        // Check if the update affected any rows
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Boodschap not found' });
        }
        res.json((0, caseConversions_1.convertKeysSnakeToCamel)(result.rows[0]));
    }
    catch (error) {
        console.error('Error during patch operation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.patch('/unaddlatest', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      UPDATE boodschap_schema.boodschaps
      SET removed = true
      WHERE date_added = (
        SELECT MAX(date_added)
        FROM boodschap_schema.boodschaps
        WHERE removed = false
      )
      AND removed = false
      RETURNING *;
    `;
        const result = yield req.db.query(query);
        // Using optional chaining and checking for a positive rowCount
        if ((result === null || result === void 0 ? void 0 : result.rowCount) && result.rowCount > 0) {
            res.json({ message: 'Successfully updated the most recent record', record: result.rows[0] });
        }
        else {
            res.status(404).json({ message: 'No matching record found' });
        }
    }
    catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ message: 'An error occurred while updating the record' });
    }
}));
router.put('/:boodschapId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { boodschapId } = req.params;
    const updatedBoodschap = req.body;
    console.log(`Put request for boodschap id: ${boodschapId}`); // Log the request id
    try {
        const query = `
    INSERT INTO boodschap_schema.boodschaps (
      boodschap_id,
      user_removed_uuid,
      user_changed_uuid,
      user_done_uuid,
      user_added_uuid,
      household_uuid,
      boodschap_uuid,
      changed,
      removed,
      date_removed,
      user_removed_firstname,
      date_changed,
      user_changed_firstname,
      done,
      date_done,
      user_done_firstname,
      user_added_firstname,
      date_added,
      item
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
    )
    ON CONFLICT (boodschap_uuid) 
    DO UPDATE SET 
      user_removed_uuid = EXCLUDED.user_removed_uuid,
      user_changed_uuid = EXCLUDED.user_changed_uuid,
      user_done_uuid = EXCLUDED.user_done_uuid,
      user_added_uuid = EXCLUDED.user_added_uuid,
      household_uuid = EXCLUDED.household_uuid,
      changed = EXCLUDED.changed,
      removed = EXCLUDED.removed,
      date_removed = EXCLUDED.date_removed,
      user_removed_firstname = EXCLUDED.user_removed_firstname,
      date_changed = EXCLUDED.date_changed,
      user_changed_firstname = EXCLUDED.user_changed_firstname,
      done = EXCLUDED.done,
      date_done = EXCLUDED.date_done,
      user_done_firstname = EXCLUDED.user_done_firstname,
      user_added_firstname = EXCLUDED.user_added_firstname,
      date_added = EXCLUDED.date_added,
      item = EXCLUDED.item
    RETURNING *;
  `;
        const values = [
            boodschapId, // $1
            updatedBoodschap.userRemovedUuid, // $2
            updatedBoodschap.userChangedUuid, // $3
            updatedBoodschap.userDoneUuid, // $4
            updatedBoodschap.userAddedUuid, // $5
            updatedBoodschap.householdUuid, // $6
            updatedBoodschap.boodschapUuid, // $7
            updatedBoodschap.changed, // $8
            updatedBoodschap.removed || false, // $9
            updatedBoodschap.dateRemoved, // $10
            updatedBoodschap.userRemovedFirstname, // $11
            updatedBoodschap.dateChanged, // $12
            updatedBoodschap.userChangedFirstname, // $13
            updatedBoodschap.done, // $14
            updatedBoodschap.dateDone, // $15
            updatedBoodschap.userDoneFirstname, // $16
            updatedBoodschap.userAddedFirstname, // $17
            updatedBoodschap.dateAdded, // $18
            updatedBoodschap.item // $19
        ];
        const result = yield req.db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Boodschap not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        if ((0, index_1.isError)(err)) {
            console.error('Error upserting boodschap:', err.message);
            res.status(500).json({ error: err.message });
        }
        else {
            console.error('Unknown error upserting boodschap');
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
exports.default = router;
