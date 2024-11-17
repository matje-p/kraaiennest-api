import { Router } from 'express';
import { isError } from '../index';
import { convertKeysSnakeToCamel } from '../utils/caseConversions';
import exp from 'constants';

const router = Router();

// New endpoint to get users by household
router.get('/users', async (req, res) => {

    const householdUuid = req.query.householdUuid as string;
    if (!householdUuid) {
      return res.status(400).json({ error: 'householdUuid is required' });
    }
  
    try {
        const query = `
        SELECT DISTINCT 
            u.user_uuid,
            u.first_name,
            u.last_name
        FROM 
            user_schema.users u
        WHERE 
            $1 = ANY(u.households)
        ORDER BY 
            u.first_name ASC
        `;

    const result = await req.db.query(query, [householdUuid]);
    
    res.json(result.rows.map(row => convertKeysSnakeToCamel(row)));
  } catch (err) {
    console.error('Error fetching household users:', err);
    if (isError(err)) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

export default router;