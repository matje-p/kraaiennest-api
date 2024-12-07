import { Router } from 'express';
import { isError } from '../index';
import { convertKeysSnakeToCamel } from '../utils/caseConversions';
import isValidUUID from '../utils/isValidUuid';
const router = Router();

// Fetch households for a user
router.get('/', (req, res) => {
  console.log('User root route hit');
  res.send('User API Running');
});

router.get('/me', async (req, res) => {
  console.log('User me route hit');

  const sub = req.user?.sub;
  const accessToken = req.headers.authorization?.split(' ')[1];
  console.log("Request for user data with userId (sub): ", sub);

  if (!sub || !accessToken) {
    return res.status(401).json({ error: 'No user sub or token found in request' });
  }

  try {
    // Fetch user info from Auth0's userinfo endpoint
    const userInfoResponse = await fetch('https://dev-i5bjfw8qrqaclxe2.us.auth0.com/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const auth0User = await userInfoResponse.json();
    console.log("Auth0 user info:", auth0User);
    const userCheck = await req.db.query(`
      SELECT user_uuid FROM user_schema.users WHERE sub = $1
    `, [sub]);
  
    // If user doesn't exist, create basic record with Auth0 data
    if (userCheck.rows.length === 0) {
      try {
        const newUser = await req.db.query(`
          INSERT INTO user_schema.users 
          (
            user_uuid,
            sub, 
            households,
            default_household,
            email_address,
            first_name,
            last_name,
            created_at,
            updated_at
          ) 
          VALUES (
            gen_random_uuid(),
            $1, 
            ARRAY[]::text[],
            null,
            $2,
            $3,
            $4,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING user_uuid
        `, [
          sub,
          auth0User.email,
          auth0User.given_name || auth0User.name?.split(' ')[0] || null,
          auth0User.family_name || auth0User.name?.split(' ')[1] || null
        ]);
    
        console.log('Created new user with UUID:', newUser.rows[0].user_uuid);
        
        return res.json({
          redirect: `/user/${newUser.rows[0].user_uuid}`
        });
      } catch (insertErr) {
        console.error('Error creating new user:', insertErr);
        throw insertErr;
      }
    }

    // Now proceed with full user data query
    const result = await req.db.query(`
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

    // User should exist now, either pre-existing or newly created
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
// Fetch all data for the authenticated user
router.get('/:userUuid', async (req, res) => {
  console.log('userUuid request hit');
  const userUuid = req.params.userUuid;
  console.log('Request for user with userUuid:', userUuid);

  if (!isValidUUID(userUuid)) {
    return res.status(400).json({ error: 'Invalid UUID format' });
  }

  try {
    // Only select specific columns that are needed/safe to share
    const result = await req.db.query(
      `WITH user_data AS (
        SELECT * FROM user_schema.users 
        WHERE user_uuid = $1
        )
        SELECT 
            user_data.user_uuid,
            user_data.email_address,
            user_data.first_name,
            user_data.last_name,
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
            ) as household_data
        FROM user_data
        LEFT JOIN household_schema.households h 
        ON h.household_uuid::text = ANY(user_data.households)
        GROUP BY 
            user_data.user_uuid,
            user_data.email_address,
            user_data.first_name,
            user_data.last_name,
            user_data.households,
            user_data.default_household`,
      [userUuid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = convertKeysSnakeToCamel(result.rows[0]);
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    if (isError(err)) {
      res.status(500).json({ error: 'Failed to fetch user data' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PATCH route for updating default household
router.patch('/me/default-household', async (req, res) => {
  const sub = req.user?.sub;
  const { householdUuid } = req.body;

  if (!sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!householdUuid || !isValidUUID(householdUuid)) {
    return res.status(400).json({ error: 'Invalid household UUID' });
  }

  try {
    const result = await req.db.query(
      `UPDATE user_schema.users 
       SET default_household = $1 
       WHERE sub = $2 
       RETURNING user_uuid, default_household`,
      [householdUuid, sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = convertKeysSnakeToCamel(result.rows[0]);
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating default household:', err);
    if (isError(err)) {
      res.status(500).json({ error: 'Failed to update default household' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;