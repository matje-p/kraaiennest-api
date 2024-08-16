import { Router } from 'express';
import { isError } from '../index';
import { convertKeysSnakeToCamel } from '../utils/caseConversions';


const router = Router();

router.get('/', (req, res) => { 
  console.log('Boodschappen root route hit');
  res.send('Boodschappen API Running');
});


// Fetch all not-removed boodschappen per houeshold
router.get('/:householdName', async (req, res) => {
  try {
    console.log(`Fetching boodschappen for household: ${req.params.householdName}`);
    const { householdName } = req.params;

    const result = await req.db.query(
      'SELECT * FROM boodschap_schema.boodschaps WHERE household_name = $1 AND removed = FALSE',
      [householdName]
    );

    res.json(convertKeysSnakeToCamel(result.rows));
  } catch (err) {
    console.error('Error fetching boodschappen:', err);
    if (isError(err)) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });   
    }
  }
});
  
// // Add new Boodschap
router.post('/', async (req, res) => {
  console.log('Adding new boodschap:', req.body);
  try {
    const { householdName, item, userAdded, dateAdded, uuid } = convertKeysSnakeToCamel(req.body);
    const result = await req.db.query(
      'INSERT INTO boodschap_schema.boodschaps (household_name, item, user_added, date_added, removed, uuid) VALUES ($1, $2, $3, $4, FALSE, $5) RETURNING *',
      [householdName, item, userAdded, dateAdded, uuid]
    );
    res.json(convertKeysSnakeToCamel(result.rows[0]));
  } catch (err) {
    console.error('Error adding boodschap:', err);
    if (isError(err)) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Do a patch operation on boodschap

router.patch('/:boodschapId/:operation', async (req, res) => {
  const { boodschapId, operation } = req.params;
  console.log(`Doing operation: "${operation}" on boodschap with id: ${boodschapId}`);
  console.log('Request body:', req.body);

  try {
    let result;
    if (operation === 'toggledone') {
      const { done, userDone } = convertKeysSnakeToCamel(req.body);
      result = await req.db.query(
        'UPDATE boodschap_schema.boodschaps SET done = $1, user_done = $2, date_done = CURRENT_TIMESTAMP WHERE boodschap_id = $3 RETURNING *',
        [done, userDone, boodschapId]
      );
    
    } else if (operation === 'remove') {
      const { userRemoved } = convertKeysSnakeToCamel(req.body);
      result = await req.db.query(
        'UPDATE boodschap_schema.boodschaps SET removed = TRUE, user_removed = $1, date_removed = CURRENT_TIMESTAMP WHERE boodschap_id = $2 RETURNING *',
        [userRemoved, boodschapId]
      );

    } else if (operation === 'edit') {
      const { item, userChanged } = convertKeysSnakeToCamel(req.body);
      result = await req.db.query(
        'UPDATE boodschap_schema.boodschaps SET item = $1, user_changed = $2, date_changed = CURRENT_TIMESTAMP WHERE boodschap_id = $3 RETURNING *',
        [item, userChanged, boodschapId]
      );
    } else {
      return res.status(400).json({ error: 'Invalid operation' });
    }
    res.json(convertKeysSnakeToCamel(result.rows[0]));
    // Check if the update affected any rows
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Boodschap not found' });
    }

  } catch (error) {
    console.error('Error during patch operation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/unaddlatest', async (req, res) => {
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

    const result = await req.db.query(query);

    // Using optional chaining and checking for a positive rowCount
    if (result?.rowCount && result.rowCount > 0) {
      res.json({ message: 'Successfully updated the most recent record', record: result.rows[0] });
    } else {
      res.status(404).json({ message: 'No matching record found' });
    }
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ message: 'An error occurred while updating the record' });
  }
});

router.put('/:boodschapId', async (req, res) => {
  const { boodschapId } = req.params;
  const updatedBoodschap = req.body;
  
  console.log(`Put request for boodschap id: ${boodschapId}`); // Log the request id

  try {
    const query = `
      INSERT INTO boodschap_schema.boodschaps (
        boodschap_id, changed, date_added, date_changed, date_done, date_removed,
        done, household_id, household_name, item, removed, user_added,
        user_changed, user_changed_id, user_done, user_id_added, user_id_done, user_removed, user_removed_id, uuid
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT (boodschap_id) 
      DO UPDATE SET 
        changed = EXCLUDED.changed,
        date_added = EXCLUDED.date_added,
        date_changed = EXCLUDED.date_changed,
        date_done = EXCLUDED.date_done,
        date_removed = EXCLUDED.date_removed,
        done = EXCLUDED.done,
        household_id = EXCLUDED.household_id,
        household_name = EXCLUDED.household_name,
        item = EXCLUDED.item,
        removed = EXCLUDED.removed,
        user_added = EXCLUDED.user_added,
        user_changed = EXCLUDED.user_changed,
        user_changed_id = EXCLUDED.user_changed_id,
        user_done = EXCLUDED.user_done,
        user_id_added = EXCLUDED.user_id_added,
        user_id_done = EXCLUDED.user_id_done,
        user_removed = EXCLUDED.user_removed,
        user_removed_id = EXCLUDED.user_removed_id,
        uuid = EXCLUDED.uuid
      RETURNING *;
    `;

    const values = [
      boodschapId,
      updatedBoodschap.changed,
      updatedBoodschap.dateAdded,
      updatedBoodschap.dateChanged,
      updatedBoodschap.dateDone,
      updatedBoodschap.dateRemoved,
      updatedBoodschap.done,
      updatedBoodschap.householdId,
      updatedBoodschap.householdName,
      updatedBoodschap.item,
      updatedBoodschap.removed,
      updatedBoodschap.userAdded,
      updatedBoodschap.userChanged,
      updatedBoodschap.userChangedId,
      updatedBoodschap.userDone,
      updatedBoodschap.userIdAdded,
      updatedBoodschap.userIdDone,
      updatedBoodschap.userRemoved,
      updatedBoodschap.userRemovedId,
      updatedBoodschap.uuid
    ];
    
    const result = await req.db.query(query, values);

    res.json(result.rows[0]); // Return the updated/inserted boodschap
  } catch (err: unknown) {
    if (isError(err)) {
      console.error('Error upserting boodschap:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error('Unknown error upserting boodschap');
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});


export default router;