const path = require('path');

/**
 * Knex configuration (CommonJS) for CLI compatibility
 */
module.exports = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../database.sqlite'),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '../migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.join(__dirname, '../seeds'),
    extension: 'ts',
  },
};