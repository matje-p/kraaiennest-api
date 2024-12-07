import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
   await knex.schema.withSchema('household_schema').createTable('invitations', (table) => {
       table.uuid('invite_uuid').primary().defaultTo(knex.raw('gen_random_uuid()'));
       table.uuid('household_uuid').notNullable().references('household_uuid').inTable('household_schema.households');
       table.text('invite_code').notNullable().unique();
       table.uuid('created_by_uuid').notNullable().references('user_uuid').inTable('user_schema.users');
       table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
       table.timestamp('expires_at', { useTz: true });
       table.specificType('used_by_uuid', 'UUID[]').defaultTo('{}');
       table.integer('max_uses');
       table.boolean('is_active').notNullable().defaultTo(true);
   });

   // Create indexes
   await knex.schema.raw('CREATE INDEX idx_invitations_household ON household_schema.invitations(household_uuid)');
   await knex.schema.raw('CREATE INDEX idx_invitations_invite_code ON household_schema.invitations(invite_code)');
}

export async function down(knex: Knex): Promise<void> {
   await knex.schema.withSchema('household_schema').dropTableIfExists('invitations');
}