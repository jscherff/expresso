// Import express and instantiate the router.
const apiRouter = require('express').Router();
module.exports = apiRouter;

// Instantiate subrouters.
const employeesRouter = require('./employees');
const menusRouter = require('./menus');

// Import the key-value store module
const kvs = require('../store/kvs');

// Create an empty KV-store object in the request object. This allows us to
// accumulate named parameters for sqlite3 queries from the request object as
// we encounter them.
apiRouter.use(function(req, res, next) {
  req.kvs = new kvs();
  next();
});

// Mount the subrouters.
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);
