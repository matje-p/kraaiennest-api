import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    UPDATE user_schema.users
    SET households = ARRAY(
      SELECT CASE 
        WHEN value = 'masdeslucioles' THEN '4819de64-1b84-464d-bbbb-4e1ad2f6d83d'
        WHEN value = 'barnfield' THEN '17167c43-09ba-4fe6-b00f-77be60559f01'
        ELSE value
      END
      FROM unnest(households) AS value
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    UPDATE user_schema.users
    SET households = ARRAY(
      SELECT CASE 
        WHEN value = '4819de64-1b84-464d-bbbb-4e1ad2f6d83d' THEN 'masdeslucioles'
        WHEN value = '17167c43-09ba-4fe6-b00f-77be60559f01' THEN 'barnfield'
        ELSE value
      END
      FROM unnest(households) AS value
    )
  `);
}