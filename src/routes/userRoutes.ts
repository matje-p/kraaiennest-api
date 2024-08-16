import { Router } from 'express';
import { isError } from '../index';
import { convertKeysSnakeToCamel } from '../utils/caseConversions';
const router = Router();

// Fetch households for a user
router.get('/', (req, res) => { 
  console.log('User root route hit');
  res.send('User API Running');
});


// Fetch all data for a particular user
router.get('/email', async (req, res) => {
  const { emailAddress } = req.query; // Retrieve emailAddress from query parameters

  try {
      // Query the database for the user data by email_address
      const result = await req.db.query(
          'SELECT * FROM user_schema.users WHERE email_address = $1', 
          [emailAddress]
      );
      
      // Check if the user exists
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Convert keys from snake_case to camelCase if needed
      const userData = convertKeysSnakeToCamel(result.rows[0]);

      res.json(userData);
  } catch (err) {
      console.error('Error fetching user data:', err);
      if (isError(err)) {
          res.status(500).json({ error: err.message });
      } else {
          res.status(500).json({ error: 'Unknown error' });
      }
  }
});


export default router;