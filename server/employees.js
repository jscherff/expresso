// Import express and instantiate the router.
const employeesRouter = require('express').Router(function(req, res, next) {});
module.exports = employeesRouter;

// Instantiate and mount the timesheets subrouter.
const timesheetsRouter = require('./timesheets');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

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
function validateEmployee(req, res, next) {
  const employee = req.body.employee;
  switch(true) {
    case !employee:
    case !employee.name:
    case !employee.position:
    case !(employee.wage && validation.isNumber(employee.wage)):
      res.sendStatus(400);
      break;
    case typeof employee.isCurrentEmployee === 'undefined':
      employee.isCurrentEmployee = 1;
    default:
      // Fix bug in Codecademy UI, which supplies superfluous id field
      // in the passed object even though it is already provided as a
      // route parameter.
      delete(employee.id);
      employee.wage = Number(employee.wage);
      req.kvs.seed(employee, true);
      next();
  }
}

// Retrieve the object associated with an object ID from the database.
// If found, embed the result in the request object. If not found, return
// HTTP 404 'Not Found' status.
function getEmployee(req, res, next) {
  db.get(sql.getEmployee, req.kvs.entry('$employeeId'), function(err, row) {
    if(err) {
      next(err);
    } else if (!row) {
      res.sendStatus(404);
    } else {
      req.employee = row;
      next();
    }
  });
}

// Retrieve all objects from the database. If found, embed the results in
// the request object. If not found, return HTTP 404 'Not Found' status.
function getEmployees(req, res, next) {
  db.all(sql.getEmployees, function(err, rows) {
    if(err) {
      next(err);
    } else if (!rows) {
      res.sendStatus(404);
    } else {
      req.employees = rows;
      next();
    }
  });
}

// Create a new object in the database and set the object ID parameter
// in the KV store to the ID of the new row.
function createEmployee(req, res, next) {
  db.run(sql.createEmployee, req.kvs.entries(), function(err) {
    if(err) {
      next(err);
    } else {
      req.kvs.set('$employeeId', this.lastID);
      next();
    }
  });
}

// Update an existing object in the database.
function updateEmployee(req, res, next) {
  db.run(sql.updateEmployee, req.kvs.entries(), function(err) {
    if(err) {
      next(err);
    } else {
      next();
    }
  });
}

// Delete an existing object from the database.
function deleteEmployee(req, res, next) {
  db.run(sql.deleteEmployee, req.kvs.entry('$employeeId'), function(err) {
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
employeesRouter.param('employeeId', function(req, res, next, id, name) {
  if(!validation.isIdentifier(id)) {
    res.status(400).end();
  } else {
    req.kvs.set('$' + name, Number(id));
    getEmployee(req, res, next);
  }
});

// =======================================================================
// Route Handlers.
// =======================================================================

// Set the handler path to '/api/employees.'
employeesRouter.route('/')

// GET /api/employees. Returns a 200 response containing all saved currently
// employed employees on the employees property of the response body.
.get(getEmployees, function(req, res, next) {
  res.status(200).send({employees: req.employees});
  next();
})

// POST /api/employees. Creates a new employee with the information from the
// employee property of the request body and saves it to the database. Returns
// a 201 response with the newly-created employee on the employee property of
// the response body. If any required fields are missing, returns a 400
// response.
.post(validateEmployee, createEmployee, getEmployee, function(req, res, next) {
  res.status(201).send({employee: req.employee});
  next();
});

// Set the handler path to '/api/employees/:employeeId.'
employeesRouter.route('/:employeeId')

// GET /api/employees/:employeeId. Returns a 200 response containing the
// employee with the supplied employee ID on the employee property of the
// response body. If an employee with the supplied employee ID doesn't exist,
// returns a 404 response. (No need to call helper middleware because the
// object will have been embedded in the request by the 'param' processing
// middleware.)
.get(function(req, res, next) {
  res.status(200).send({employee: req.employee});
  next();
})

// PUT /api/employees/:employeeId. Updates the employee with the specified
// employee ID using the information from the employee property of the request
// body and saves it to the database. Returns a 200 response with the updated
// employee on the employee property of the response body. If any required
// fields are missing, returns a 400 response. If an employee with the
// supplied employee ID doesn't exist, returns a 404 response.
.put(validateEmployee, updateEmployee, getEmployee, function(req, res, next) {
  res.status(200).send({employee: req.employee});
  next();
})

// DELETE /api/employees/:employeeId. Updates the employee with the specified
// employee ID to be unemployed (is_current_employee equal to 0). Returns a
// 200 response. If an employee with the supplied employee ID doesn't exist,
// returns a 404 response.
.delete(deleteEmployee, getEmployee, function(req, res, next) {
  res.status(200).send({employee: req.employee});
  next();
});
