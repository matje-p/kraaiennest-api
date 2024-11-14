import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    UPDATE user_schema.users
    SET default_household = 
      CASE 
        WHEN default_household = 'masdeslucioles' THEN '4819de64-1b84-464d-bbbb-4e1ad2f6d83d'
        WHEN default_household = 'barnfield' THEN '17167c43-09ba-4fe6-b00f-77be60559f01'
        ELSE default_household
      END
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    UPDATE user_schema.users
    SET default_household = 
      CASE 
        WHEN default_household = '4819de64-1b84-464d-bbbb-4e1ad2f6d83d' THEN 'masdeslucioles'
        WHEN default_household = '17167c43-09ba-4fe6-b00f-77be60559f01' THEN 'barnfield'
        ELSE default_household
      END
  `);
}