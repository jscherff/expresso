// Import express and instantiate the router.
const menuItemsRouter = require('express').Router();
module.exports = menuItemsRouter;

// Import input validation functions.
const validation = require('./validation');

// Import SQL and database.
const sql = require('../store/sql');
const db = require('../store/db');

// =======================================================================
// Helper Middleware.
// =======================================================================

// Extract ID from the path, verify that it is numeric, positive, and finite.
menuItemsRouter.param('menuItemId', function(req, res, next, id, name) {
  if(isNaN(parseFloat(id)) || !isFinite(id) || id < 0) {
    res.status(400).end();
  } else {
    req.kvs.set('$' + name, id);
    next();
  }
});

// =======================================================================
// Helper Middleware.
// =======================================================================

// Verify required object properties are present in the request body and
// have valid values. If valid, seed key-value store object with objects
// properties. If not valid, return HTTP 400 'Bad Request' status.
function validateMenuItem(req, res, next) {
  const menuItem = req.body.menuItem;
  switch(true) {
    case !menuItem:
    case !menuItem.name:
    case !menuItem.description:
    case !(menuItem.inventory && validation.isNumber(menuItem.inventory)):
    case !(menuItem.price && validation.isNumber(menuItem.price)):
      res.sendStatus(400);
      break;
    default:
      // Fix bug in Codecademy UI, which supplies superfluous id field
      // in the passed object even though it is already provided as a
      // route parameter.
      delete(menuItem.id);
      menuItem.inventory = Number(menuItem.inventory);
      menuItem.price = Number(menuItem.price);
      req.kvs.seed(menuItem, true);
      next();
  }
}

// Retrieve the object associated with an object ID from the database.
// If found, embed the result in the request object. If not found, return
// HTTP 404 'Not Found' status.
function getMenuItem(req, res, next) {
  db.get(sql.getMenuItem, req.kvs.entry('$menuItemId'), function(err, row) {
    if(err) {
      next(err);
    } else if (!row) {
      res.sendStatus(404);
    } else {
      req.menuItem = row;
      next();
    }
  });
}

// Retrieve all objects associated with a specific parent object from the
// database. Embed the results in the request object, even if empty.
function getMenuItems(req, res, next) {
  db.all(sql.getMenuItems, req.kvs.entry('$menuId'), function(err, rows) {
    if(err) {
      next(err);
    } else {
      req.menuItems = rows;
      next();
    }
  });
}

// Create a new object in the database and set the object ID parameter
// in the KV store to the ID of the new row.
function createMenuItem(req, res, next) {
  db.run(sql.createMenuItem, req.kvs.entries(), function(err) {
    if(err) {
      next(err);
    } else {
      req.kvs.set('$menuItemId', this.lastID);
      next();
    }
  });
}

// Update an existing object in the database.
function updateMenuItem(req, res, next) {
  db.run(sql.updateMenuItem, req.kvs.entries(), function(err) {
    if(err) {
      next(err);
    } else {
      next();
    }
  });
}

// Delete an existing object from the database.
function deleteMenuItem(req, res, next) {
  db.run(sql.deleteMenuItem, req.kvs.entry('$menuItemId'), function(err) {
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
menuItemsRouter.param('menuItemId', function(req, res, next, id, name) {
  if(!validation.isIdentifier(id)) {
    res.status(400).end();
  } else {
    req.kvs.set('$' + name, Number(id));
    getMenuItem(req, res, next);
  }
});

// =======================================================================
// Route Handlers.
// =======================================================================

// Set the handler path to '/api/menus/:menuId/menu-items.'
menuItemsRouter.route('/')

// GET /api/menus/:menuId/menu-items. Returns a 200 response containing all
// saved menu items related to the menu with the supplied menu ID on the
// menuItems property of the response body. If a menu with the supplied menu
// ID doesn't exist, returns a 404 response.
.get(getMenuItems, function(req, res, next) {
  res.status(200).send({menuItems: req.menuItems});
  next();
})

// POST /api/menus/:menuId/menu-items. Creates a new menu item, related to
// the menu with the supplied menu ID, with the information from the menuItem
// property of the request body and saves it to the database. Returns a 201
// response with the newly-created menu item on the menuItem property of the
// response body. If any required fields are missing, returns a 400 response.
// If a menu with the supplied menu ID doesn't exist, returns a 404 response.
.post(validateMenuItem, createMenuItem, getMenuItem, function(req, res, next) {
  res.status(201).send({menuItem: req.menuItem});
  next();
});

// Set the handler path to '/api/menus/:menuId/menu-items/:menuItemId.'
menuItemsRouter.route('/:menuItemId')

// PUT /api/menus/:menuId/menu-items/:menuItemId. Updates the menu item with
// the specified menu item ID using the information from the menuItem property
// of the request body and saves it to the database. Returns a 200 response
// with the updated menu item on the menuItem property of the response body.
// If any required fields are missing, returns a 400 response. If a menu with
// the supplied menu ID doesn't exist, returns a 404 response. If a menu item
// with the supplied menu item ID doesn't exist, returns a 404 response.
.put(validateMenuItem, updateMenuItem, getMenuItem, function(req, res, next) {
  res.status(200).send({menuItem: req.menuItem});
  next();
})

// DELETE /api/menus/:menuId/menu-items/:menuItemId. Deletes the menu item with
// the supplied menu item ID from the database. Returns a 204 response. If a
// menu with the supplied menu ID doesn't exist, returns a 404 response. If a
// menu item with the supplied menu item ID doesn't exist, returns a 404
// response.
.delete(deleteMenuItem, function(req, res, next) {
  res.sendStatus(204);
  next();
});
