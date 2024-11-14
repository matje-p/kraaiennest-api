// migrations/YYYYMMDDHHMMSS_alter_user_id_type.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.raw(`
        ALTER TABLE user_schema.users 
        ALTER COLUMN user_id TYPE TEXT;
    `);
}

export async function down(knex: Knex): Promise<void> {
    return knex.raw(`
        ALTER TABLE user_schema.users 
        ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);
    `);
}