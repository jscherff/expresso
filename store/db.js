// Import the sqlite3 database module/driver.
const sqlite3 = require('sqlite3');

// Obtain the database name and instantiate the database object.
const dbFile = process.env.TEST_DATABASE || './database.sqlite';
const db = new sqlite3.Database(dbFile);

module.exports = db;
