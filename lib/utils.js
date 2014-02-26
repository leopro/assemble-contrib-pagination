/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2014 Assemble.
 * Licensed under the MIT License (MIT).
 */

// Node.js
var path = require('path');

// node_modules
var matter = require('gray-matter');
var file = require('fs-utils');
var _ = require('lodash');

// local libs
var Item = require('./item');

var utils = module.exports = {};

utils.generatePagePath = function (dest, index) {
  var result = '';
  if (index === 1) {
    result = path.join(dest, 'index.html');
  } else {
    result = path.join(dest, String(index), 'index.html');
  }
  return file.normalizeSlash(result);
};

utils.loadItems = function (src) {

  var filepaths = file.expand(src);

  // load all the items/pages/posts/etc..
  return _.map(filepaths, function (filepath, index) {
    var content = file.readFileSync(filepath);
    var info = matter(content);
    return new Item({
      filename: filepath,
      src: filepath,
      content: info.content,
      metadata: _.extend({src: filepath}, info.context)
    });
  });
};