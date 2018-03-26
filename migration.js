// Import the database and SQL script modules.
const db = require('./store/db');
const sql = require('./store/sql');

// Create the database tables if they don't already exist.
db.serialize(() => {
  db.run(sql.createEmployeeTable, (err) => {
    if(err) {
      console.log(err.message);
    }
  });
  db.run(sql.createTimesheetTable, (err) => {
    if(err) {
      console.log(err.message);
    }
  });
  db.run(sql.createMenuTable, (err) => {
    if(err) {
      console.log(err.message);
    }
  });
  db.run(sql.createMenuItemTable, (err) => {
    if(err) {
      console.log(err.message);
    }
  });
});
