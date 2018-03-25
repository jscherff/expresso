// Implement a simple in-memory key-value store for accumulating Parameters
// throughout the HTTP request flow and passing those parameters between
// middlewares. 
function kvs() {

  // Key-value store.
  this._store = {};

  // Create a new key-value pair.
  this.set = function(key, value) {
		this._store[key] = value;
	};

  // Retrieve the value for a given key.
	this.get = function(key) {
    return this._store[key];
	};

  // Retrieve the key-value pair for a given key.
  this.entry = function(key) {
    return {[key]: this._store[key]};
  };

  // Retrieve all key-value pairs in the key-value store.
  this.entries = function() {
    return this._store;
  };

  // Delete the key-value pair for the given key.
  this.unset = function(key) {
    delete(this._store[key]);
  };

  // Reset the key-value store by deleting all its entries.
	this.reset = function() {
    Object.keys(this._store).map(key => {
      delete(this._store[key]);
    });
	};

  // Seed the key-value store from properties of an existing object.
  // If 'sqlite' is 'true', prefix key with '$' to prepare for use
  // as database Named Parameters.
  this.seed = function(object, sqlite) {
    Object.keys(object).map(key => {
      this.set(sqlite ? '$' + key : key, object[key]);
    });
  };
}

module.exports = kvs;
