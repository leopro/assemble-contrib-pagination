/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2014 Assemble.
 * Licensed under the MIT License (MIT).
 */

var Page = module.exports = function (options) {
  if (!(this instanceof Page)){
    return new Page(options);
  }

  options = options || {};
  this.filename = options.filename || options.src || '';
  this.src = options.src || '';
  this.metadata = options.context;
  this.content = options.content;
};

