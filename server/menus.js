// Import express and instantiate the router.
const menusRouter = require('express').Router();
module.exports = menusRouter;

// Instantiate and mount the menu-items subrouter.
const menuItemsRouter = require('./menuitems');
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

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
function validateMenu(req, res, next) {
  const menu = req.body.menu;
  switch(true) {
    case !menu:
    case !menu.title:
      res.sendStatus(400);
      break;
    default:
      // Fix bug in Codecademy UI, which supplies superfluous id field
      // in the passed object even though it is already provided as a
      // route parameter.
      delete(menu.id);
      req.kvs.seed(menu, true);
      next();
  }
}

// Retrieve the object associated with an object ID from the database.
// If found, Embed the result in the request object. If not found, return
// HTTP 404 'Not Found' status.
function getMenu(req, res, next) {
  db.get(sql.getMenu, req.kvs.entry('$menuId'), function(err, row) {
    if(err) {
      next(err);
    } else if (!row) {
      res.sendStatus(404);
    } else {
      req.menu = row;
      next();
    }
  });
}

// Retrieve all objects from the database. If found, embed the results in
// the request object. If not found, return HTTP 404 'Not Found' status.
function getMenus(req, res, next) {
  db.all(sql.getMenus, function(err, rows) {
    if(err) {
      next(err);
    } else if (!rows) {
      res.sendStatus(404);
    } else {
      req.menus = rows;
      next();
    }
  });
}

// Create a new object in the database and set the object ID parameter
// in the KV store to the ID of the new row.
function createMenu(req, res, next) {
  db.run(sql.createMenu, req.kvs.entries(), function(err) {
    if(err) {
      next(err);
    } else {
      req.kvs.set('$menuId', this.lastID);
      next();
    }
  });
}

// Update an existing object in the database.
function updateMenu(req, res, next) {
  db.run(sql.updateMenu, req.kvs.entries(), function(err) {
    if(err) {
      next(err);
    } else {
      next();
    }
  });
}

// Verify that dependent objects do not exist for object about to be deleted.
// If dependent objects exist, return HTTP 400 'Bad Request' status.
function getMenuItems(req, res, next) {
  db.get(sql.getMenuItems, req.kvs.entry('$menuId'), function(err, row) {
    if(err) {
      next(err);
    } else if (row) {
      res.status(400).end();
    } else {
      next();
    }
  });
}

// Delete an existing object from the database.
function deleteMenu(req, res, next) {
  db.run(sql.deleteMenu, req.kvs.entry('$menuId'), function(err) {
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
menusRouter.param('menuId', function(req, res, next, id, name) {
  if(!validation.isIdentifier(id)) {
    res.status(400).end();
  } else {
    req.kvs.set('$' + name, Number(id));
    getMenu(req, res, next);
  }
});

// =======================================================================
// Route Handlers.
// =======================================================================

// Set the handler path to '/api/menus.'
menusRouter.route('/')

// GET /api/menus. Returns a 200 response containing all saved menus on the
// menus property of the response body.
.get(getMenus, function(req, res, next) {
  res.status(200).send({menus: req.menus});
  next();
})

// POST /api/menus. Creates a new menu with the information from the menu
// property of the request body and saves it to the database. Returns a 201
// response with the newly-created menu on the menu property of the response
// body. If any required fields are missing, returns a 400 response.
.post(validateMenu, createMenu, getMenu, function(req, res, next) {
  res.status(201).send({menu: req.menu});
  next();
});

// Set the handler path to '/api/menus/:menuId.'
menusRouter.route('/:menuId')

// GET /api/menus/:menuId. Returns a 200 response containing the menu with
// the supplied menu ID on the menu property of the response body. If a menu
// with the supplied menu ID doesn't exist, returns a 404 response. (No need
// to call helper middleware because the object will have been embedded in
// the request by the 'param' processing middleware.)
.get(function(req, res, next) {
  res.status(200).send({menu: req.menu});
  next();
})

// PUT /api/menus/:menuId. Updates the menu with the specified menu ID using
// the information from the menu property of the request body and saves it to
// the database. Returns a 200 response with the updated menu on the menu
// property of the response body. If any required fields are missing, returns
// a 400 response. If a menu with the supplied menu ID doesn't exist, returns
// a 404 response.
.put(validateMenu, updateMenu, getMenu, function(req, res, next) {
  res.status(200).send({menu: req.menu});
  next();
})

// DELETE /api/menus/:menuId. Deletes the menu with the supplied menu ID from
// the database if that menu has no related menu items. Returns a 204 response.
// If the menu with the supplied menu ID has related menu items, returns a 400
// response. If a menu with the supplied menu ID doesn't exist, returns a 404
// response.
.delete(getMenuItems, deleteMenu, function(req, res, next) {
  res.sendStatus(204);
  next();
});
