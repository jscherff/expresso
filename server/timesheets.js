// Import express and instantiate the router.
const timesheetsRouter = require('express').Router();
module.exports = timesheetsRouter;

// Import input validation functions.
const validation = require('./validation');

// Import SQL and database.
const sql = require('../store/sql');
const db = require('../store/db');

// =======================================================================
// Helper Middleware.
// =======================================================================

// Verify required object properties are present in the request body and
// have valid values. If valid, seed key-value store object with objects
// properties. If not valid, return HTTP 400 'Bad Request' status.
function validateTimesheet(req, res, next) {
  const timesheet = req.body.timesheet;
  switch(true) {
    case !timesheet:
    case !(timesheet.hours && validation.isNumber(timesheet.hours)):
    case !(timesheet.rate && validation.isNumber(timesheet.rate)):
    case !(timesheet.date && validation.isNumber(timesheet.date)):
      res.sendStatus(400);
      break;
    default:
      // Fix bug in Codecademy UI, which supplies superfluous id field
      // in the passed object even though it is already provided as a
      // route parameter.
      delete(timesheet.id);
      timesheet.hours = Number(timesheet.hours);
      timesheet.rate = Number(timesheet.rate);
      timesheet.date = Number(timesheet.date);
      req.kvs.seed(timesheet, true);
      next();
  }
}

// Retrieve the object associated with an object ID from the database.
// If found, Embed the result in the request object. If not found, return
// HTTP 404 'Not Found' status.
function getTimesheet(req, res, next) {
  db.get(sql.getTimesheet, req.kvs.entry('$timesheetId'), function(err, row) {
    if(err) {
      next(err);
    } else if (!row) {
      res.sendStatus(404);
    } else {
      req.timesheet = row;
      next();
    }
  });
}

// Retrieve all objects associated with a specific parent object from the
// database. If found, embed the results in the request object. If not found,
// return HTTP 404 'Not Found' status.
function getTimesheets(req, res, next) {
  db.all(sql.getTimesheets, req.kvs.entry('$employeeId'), function(err, rows) {
    if(err) {
      next(err);
    } else if (!rows) {
      res.sendStatus(404);
    } else {
      req.timesheets = rows;
      next();
    }
  });
}

// Create a new object in the database and set the object ID parameter
// in the KV store to the ID of the new row.
function createTimesheet(req, res, next) {
  db.run(sql.createTimesheet, req.kvs.entries(), function(err) {
    if(err) {
      next(err);
    } else {
      req.kvs.set('$timesheetId', this.lastID);
      next();
    }
  });
}

// Update an existing object in the database.
function updateTimesheet(req, res, next) {
  db.run(sql.updateTimesheet, req.kvs.entries(), function(err) {
    if(err) {
      next(err);
    } else {
      next();
    }
  });
}

// Delete an existing object from the database.
function deleteTimesheet(req, res, next) {
  db.run(sql.deleteTimesheet, req.kvs.entry('$timesheetId'), function(err) {
    if(err) {
      next(err);
    } else {
      next();
    }
  });
}

// Extract ID parameter from the path. Verify that it is numeric, positive,
// and finite. If not, return HTTP 400 'Bad Request' status; otherwise, set
// the object ID parameter in the KV store to the parameter value. Finally,
// retrieve the associated object from the database and embed in the request
// object.
timesheetsRouter.param('timesheetId', function(req, res, next, id, name) {
  if(!validation.isIdentifier(id)) {
    res.status(400).end();
  } else {
    req.kvs.set('$' + name, Number(id));
    getTimesheet(req, res, next);
  }
});

// =======================================================================
// Route Handlers.
// =======================================================================

// Set the handler path to '/api/employees/:employeeId/timesheets.'
timesheetsRouter.route('/')

// GET /api/employees/:employeeId/timesheets. Returns a 200 response containing
// all saved timesheets related to the employee with the supplied employee ID
// on the timesheets property of the response body. If an employee with the
// supplied employee ID doesn't exist, returns a 404 response.
.get(getTimesheets, function(req, res, next) {
  res.status(200).send({timesheets: req.timesheets});
  next();
})

// POST /api/employees/:employeeId/timesheets. Creates a new timesheet, related
// to the employee with the supplied employee ID, with the information from the
// timesheet property of the request body and saves it to the database. Returns
// a 201 response with the newly-created timesheet on the timesheet property of
// the response body. If an employee with the supplied employee ID doesn't
// exist, returns a 404 response.
.post(validateTimesheet, createTimesheet, getTimesheet, function(req, res, next) {
  res.status(201).send({timesheet: req.timesheet});
  next();
});

// -----------------------------------------------------------------------
// Handlers for /api/employees/:employeeId/timesheets/:timesheetId routes.
// -----------------------------------------------------------------------

// Set the handler path to '/api/employees/:employeeId/timesheets/:timesheetId.'
timesheetsRouter.route('/:timesheetId')

// PUT /api/employees/:employeeId/timesheets/:timesheetId. Updates the
// timesheet with the specified timesheet ID using the information from the
// timesheet property of the request body and saves it to the database.
// Returns a 200 response with the updated timesheet on the timesheet property
// of the response body. If any required fields are missing, returns a 400
// response. If an employee with the supplied employee ID doesn't exist,
// returns a 404 response. If an timesheet with the supplied timesheet ID
// doesn't exist, returns a 404 response.
.put(validateTimesheet, updateTimesheet, getTimesheet, function(req, res, next) {
  res.status(200).send({timesheet: req.timesheet});
  next();
})

// DELETE /api/employees/:employeeId/timesheets/:timesheetId. Deletes the
// timesheet with the supplied timesheet ID from the database. Returns a 204
// response. If an employee with the supplied employee ID doesn't exist,
// returns a 404 response. If an timesheet with the supplied timesheet ID
// doesn't exist, returns a 404 response.
.delete(deleteTimesheet, function(req, res, next) {
  res.sendStatus(204);
  next();
});
