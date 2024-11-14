import { Knex } from 'knex';

// Adding a 'sub' column to the 'users' table and updating specific records
exports.up = async function(knex: Knex): Promise<void> {
  // Add 'sub' column to 'users' table
  await knex.schema.withSchema('user_schema').table('users', function(table) {
    table.string('sub'); // Add the new 'sub' column
  });

  // Update specific records with 'sub' values based on 'first_name'
  await knex('user_schema.users').where('first_name', 'Matthias').update({ sub: 'auth0|66896ddca76872a0cb060171' });
  await knex('user_schema.users').where('first_name', 'Sarah').update({ sub: 'auth0|6692dadc8072c6037885d95e' });
  await knex('user_schema.users').where('first_name', 'Anna').update({ sub: 'auth0|669fa836f169e435dbdaff12' });
  await knex('user_schema.users').where('first_name', 'Ruben').update({ sub: 'auth0|669fa7cae6d5fdc532ae8161' });
  await knex('user_schema.users').where('first_name', 'Luka').update({ sub: 'auth0|669fad7af169e435dbdb0589' });
};

// Rollback: removing the 'sub' column
exports.down = async function(knex: Knex): Promise<void> {
  await knex.schema.withSchema('user_schema').table('users', function(table) {
    table.dropColumn('sub');
  });
};
