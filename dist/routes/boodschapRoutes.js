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
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send('Boodschappen API Running');
});
// Fetch all boodschappen or filter by household
router.get(':householdName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { householdName } = req.params;
    try {
        const result = yield req.db.query('SELECT * FROM boodschaps WHERE household_name = $1', [householdName]);
        res.json(result.rows);
    }
    catch (err) {
        if ((0, index_1.isError)(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// // Add new Boodschap
// router.post('/boodschappen', async (req, res) => {
//   console.log('Incoming request body:', req.body);
//   try {
//     const { household_name, item, user_added } = req.body;
//     const result = await req.db.query(
//       'INSERT INTO boodschaps (household_name, item, user_added, date_added) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
//       [household_name, item, user_added]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     if (isError(err)) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });
// // Edit boodschap
// router.patch('/boodschappen/:id', async (req, res) => {
//   const { id } = req.params;
//   const { item, user_last_change } = req.body;
//   console.log(`Edit request for boodschap id: ${id}`);
//   try {
//     const result = await req.db.query(
//       'UPDATE boodschaps SET item = $1, user_last_change = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
//       [item, user_last_change, id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Boodschap not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     if (isError(err)) {
//       console.error('Error editing boodschap:', err.message);
//       res.status(500).json({ error: err.message });
//     } else {
//       console.error('Unknown error editing boodschap');
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });
// // Delete boodschap
// router.delete('/boodschappen/:id', async (req, res) => {
//   console.log(`Delete request for boodschap id: ${req.params.id}`);
//   try {
//     const result = await req.db.query('DELETE FROM boodschaps WHERE id = $1 RETURNING *', [req.params.id]);
//     if (result.rows.length === 0) {
//       console.error(`Boodschap with id ${req.params.id} not found`);
//       return res.status(404).json({ message: 'Boodschap not found' });
//     }
//     res.json({ message: 'Boodschap deleted successfully' });
//   } catch (err) {
//     if (isError(err)) {
//       console.error('Error deleting boodschap:', err.message);
//       res.status(500).json({ error: err.message });
//     } else {
//       console.error('Unknown error deleting boodschap');
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });
// // Mark boodschap as done
// router.patch('/boodschappen/:id/done', async (req, res) => {
//   try {
//     const result = await req.db.query(
//       'UPDATE boodschaps SET done = $1, date_done = CURRENT_TIMESTAMP, user_done = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
//       [req.body.done, req.body.user_done, req.params.id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Boodschap not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     if (isError(err)) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });
// // Upsert boodschap
// router.put('/boodschappen/:id', async (req, res) => {
//   console.log(`Put request for boodschap id: ${req.params.id}`);
//   try {
//     const { household_name, item, user_added, user_done, date_done, done, user_last_change } = req.body;
//     const result = await req.db.query(
//       `INSERT INTO boodschaps (id, household_name, item, user_added, user_done, date_done, done, user_last_change, date_added, updated_at)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//        ON CONFLICT (id) DO UPDATE
//        SET household_name = $2, item = $3, user_added = $4, user_done = $5, date_done = $6, done = $7, user_last_change = $8, updated_at = CURRENT_TIMESTAMP
//        RETURNING *`,
//       [req.params.id, household_name, item, user_added, user_done, date_done, done, user_last_change]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     if (isError(err)) {
//       console.error('Error upserting boodschap:', err.message);
//       res.status(500).json({ error: err.message });
//     } else {
//       console.error('Unknown error upserting boodschap');
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });
exports.default = router;
