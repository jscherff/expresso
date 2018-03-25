function kv() {
  this._store = {};
  this.set = function(key, value) {
		this._store[key] = value;
	};
	this.get = function(key) {
    return this._store[key];
	};
  this.entry = function(key) {
    return {[key]: this._store[key]};
  };
  this.entries = function() {
    return this._store;
  };
  this.unset = function(key) {
    delete(this._store[key]);
  };
	this.reset = function() {
    Object.keys(this._store).map(key => {
      delete(this._store[key]);
    });
	};
  this.params = function(object) {
    Object.keys(object).map(key => {
      this.set(key, object[key]);
    });
  };
  this.namedParams = function(object) {
    Object.keys(object).map(key => {
      this.set('$' + key, object[key]);
    });
  };
}

module.exports = kv;
