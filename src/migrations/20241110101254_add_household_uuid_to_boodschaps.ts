import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, let's check what values we have
  const results = await knex.raw(`
    SELECT DISTINCT household_name 
    FROM boodschap_schema.boodschaps 
    ORDER BY household_name;
  `);
  console.log('Unique household_name values:', results.rows);

  // Add the new column
  await knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
    table.uuid('household');
  });

  // Update with better null handling
  await knex.raw(`
    UPDATE boodschap_schema.boodschaps
    SET household = 
      CASE household_name
        WHEN 'masdeslucioles' THEN '4819de64-1b84-464d-bbbb-4e1ad2f6d83d'::uuid
        WHEN 'barnfield' THEN '17167c43-09ba-4fe6-b00f-77be60559f01'::uuid
        -- Add a default UUID for null or unknown values
        ELSE '00000000-0000-0000-0000-000000000000'::uuid
      END
  `);

  // Verify no nulls remain
  const nullCheck = await knex.raw(`
    SELECT COUNT(*) 
    FROM boodschap_schema.boodschaps 
    WHERE household IS NULL;
  `);
  console.log('Null count after update:', nullCheck.rows[0].count);

  // Make the column not nullable after population
  await knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
    table.uuid('household').notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('boodschap_schema').alterTable('boodschaps', (table) => {
    table.dropColumn('household');
  });
}