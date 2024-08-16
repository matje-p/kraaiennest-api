import { Router } from 'express';
import { isError } from '../index';
import { convertKeysSnakeToCamel } from '../utils/caseConversions';

const router = Router();

// Fetch households for a user
router.get('/', (req, res) => { 
  console.log('Household root route hit');
  res.send('Household API Running');
});

router.get('/data', async (req, res) => {
  const { emailAddress } = req.query;

  try {
    console.log(`Fetching households for user: ${emailAddress}`);
    const userResult = await req.db.query(
      'SELECT households FROM user_schema.users WHERE email_address = $1',
      [emailAddress]
    );

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
    const householdsResult = await req.db.query(
      `SELECT * FROM household_schema.households WHERE household_name = ANY($1::text[])`,
      [households]
    );

    // Convert keys from snake_case to camelCase if needed
    const householdData = householdsResult.rows.map(row => convertKeysSnakeToCamel(row));

    res.json(householdData);
  } catch (err) {
    console.error('Error fetching household data:', err);
    if (isError(err)) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

export default router;
