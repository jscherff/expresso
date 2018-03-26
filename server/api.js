// Import express and instantiate the router.
const apiRouter = require('express').Router();
module.exports = apiRouter;

// Instantiate subrouters.
const employeesRouter = require('./employees');
const menusRouter = require('./menus');

// Import the key-value store module
const kvs = require('../store/kvs');

// Create an empty key-value store object in the request object. This allows
// us to create and accumulate named parameters for sqlite3 queries from the
// request object as we encounter them. We can then pass 'req.kvs.entries()'
// as the second argument to sqlite3 queries rather than construct the named
// parameters object at the time of the query.
apiRouter.use(function(req, res, next) {
  req.kvs = new kvs();
  next();
});

// Mount the subrouters.
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);
