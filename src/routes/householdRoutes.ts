import { Router } from 'express';
import { isError } from '../index';
import { convertKeysSnakeToCamel } from '../utils/caseConversions';

const router = Router();

router.get('/:householdUuid', async (req, res) => {
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
        h.household_uuid`;  // Added household_uuid to GROUP BY

    const result = await req.db.query(query, [householdUuid]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    const transformed = convertKeysSnakeToCamel(result.rows[0]);
    // Filter out any null members that might come from the LEFT JOIN
    
    res.json(transformed);

  } catch (err) {
    console.error('Error fetching household:', err);
    if (isError(err)) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

export default router;