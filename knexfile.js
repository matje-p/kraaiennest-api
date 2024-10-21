// knexfile.js

require('ts-node/register');

module.exports = {
    development: {
      client: 'pg',
      connection: {
        host: 'localhost',
        user: 'matje-p',
        password: 'eShSNm7Xyz1',  // Development password
        database: 'boodschappenlijstje-dev',
        port: 5432
      },
      migrations: {
        directory: './src/migrations',
        extension: 'ts'  // Use TypeScript for migrations in development
      },
      seeds: {
        directory: './src/seeds',
        extension: 'ts'  // Use TypeScript for seeds in development
      }
    },
    production: {
      client: 'pg',
      connection: {
        host: 'boodschappenlijstje.cjsiga4w48pq.eu-north-1.rds.amazonaws.com',
        user: 'matjep',
        password: '%Mky9Uhw7P%2',  // Production password
        database: 'boodschappenlijstje_prod',
        port: 5432,
        ssl: {
            rejectUnauthorized: false  // This disables certificate validation; useful for testing
          }
      },
      migrations: {
        directory: './dist/migrations',  // Transpiled JavaScript in production
        extension: 'js',  // JavaScript in production
        schemaName: 'public'  // Add this to ensure the public schema is used
      },
      seeds: {
        directory: './dist/seeds',
        extension: 'js'  // JavaScript in production
      }
    }
  };
  