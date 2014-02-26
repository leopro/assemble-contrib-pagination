/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2014 Assemble.
 * Licensed under the MIT License (MIT).
 */

var Collection = module.exports = function (options) {
  if (!(this instanceof Collection)){
    return new Collection(options);
  }

  options = options || {};
  this.items = options.items || [];
};

Collection.prototype.add = function(item) {
  this.items.push(item);
};

Collection.prototype.getItems = function(start, count) {
  start = start || 0;
  count = count || this.items.length;

  var end = Math.min(this.items.length, (start + count));
  return this.items.slice(start, end).map(function (item) { return item.getObject(); });
};

Collection.prototype.empty = function() {
  this.items = [];
};