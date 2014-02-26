/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2014 Assemble.
 * Licensed under the MIT License (MIT).
 */

var Item = module.exports = function (options) {
  if (!(this instanceof Item)) {
    return new Item(options);
  }

  this.props = options || {};
};

Item.prototype.getObject = function() {
  return this.props;
};

Item.prototype.set = function(key, value) {
  var oldValue = null;
  if (this.props.hasOwnProperty(key)){
    oldValue = this.props[key];
  }
  this.props[key] = value;
  return oldValue;
};

Item.prototype.get = function(key) {
  this.props[key];
};