/*
 * Assemble Plugin: assemble-contrib-pagination
 * https://github.com/assemble/assemble-contrib-pagination
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 Brian Woodward, Jon Schlinkert, contributors
 * Licensed under the MIT license.
 */

// node_modules
var matter = require('gray-matter');
var file = require('fs-utils');
var path = require('path');
var _ = require('lodash');

// local libs
var Item = require('./lib/item');
var Page = require('./lib/page');
var Collection = require('./lib/collection');

var options = {
  stage: 'options:post:configuration'
};

var generatePagePath = function (dest, index) {
  var result = '';
  if (index === 1) {
    result = path.join(dest, 'index.html');
  } else {
    result = path.join(dest, String(index), 'index.html');
  }
  return file.normalizeSlash(result);
};

module.exports = function(params, done) {
  'use strict';

  var grunt = params.grunt;

  grunt.verbose.subhead('Running:'.bold, '"assemble-contrib-pagination"');
  grunt.verbose.writeln('Stage:  '.bold, '"' + params.stage + '"\n');

  var opts = params.assemble.options.pagination;
  grunt.verbose.writeln('Options: '.bold, require('util').inspect(opts));

  /**
   * accepted options
   *
   * options: {
   *   pagination: {
   *     template: 'src/templates/blog/index.hbs',
   *     dest: 'blog/',
   *     structure: 'page:num/index:ext', // permalinks structure
   *     per_page: 10,
   *     src: 'src/templates/*.hbs'
   *   }
   * }
   */
  if (opts) {

    // extend the options with some defaults
    opts = _.extend({
      dest: '.',
      structure: ':num/index:ext',
      per_page: 10
    }, opts);


    // setup a default template if none is specified
    var template = [

      '<a href="{{page.pagination.previous_page_path}}">Previous</a> | <a href="{{page.pagination.next_page_path}}">Next</a>',
      '{{#each page.pagination.items}}',
      '<div>{{this.data.src}}</div>',
      '<div>{{this.data.summary}}</div>',
      '{{/each}}'

    ].join('\n');

    // read in the template if one is specified
    grunt.verbose.writeln('Template: '.bold, opts.template);
    if (opts.template && opts.template.length > 0) {
      template = file.readFileSync(opts.template);
    }

    // Expand given filepaths of the items/pages/posts/etc...
    grunt.verbose.writeln('Source: '.bold, opts.src);
    var filepaths = file.expand(opts.src || '');

    // setup the state
    var state = {
      // item info
      currentItemIndex: 0,
      totalItems: filepaths.length,
      // page info
      perPage: opts.per_page,
      currentPageIndex: 1,
      prevPageIndex: 1
    };
    state.totalPages = Math.round(state.totalItems / state.perPage);
    state.nextPageIndex = Math.min(2, state.totalPages);

    // load all the items/pages/posts/etc..
    var items = _.map(filepaths, function (filepath, index) {
      grunt.verbose.writeln('Filepath: '.bold, filepath);
      var content = file.readFileSync(filepath);
      var info = matter(content);
      return new Item({
        filename: filepath,
        src: filepath,
        content: info.content,
        data: _.extend({src: filepath}, info.context)
      });
    });

    // collection is a convenience for getting items out later
    var collection = new Collection({items: items});

    // generate each list page based on how many items there are
    var pages = {};
    do {

      // create a new page from the template with the items in the context
      var page = new Page({
        filename: generatePagePath(opts.dest, state.currentPageIndex),
        content: template,
        context: {
          pagination: {
            page: state.currentPageIndex,
            per_page: state.perPage,
            items: collection.getItems(state.currentItemIndex, state.perPage),
            total_items: state.totalItems,
            total_pages: state.totalPages,
            previous_page: state.prevPageIndex,
            previous_page_path: generatePagePath(opts.dest, state.prevPageIndex),
            next_page: state.nextPageIndex,
            next_page_path: generatePagePath(opts.dest, state.nextPageIndex)
          }
        }
      });


      pages[page.filename] = page;

      // update state information
      state.currentPageIndex++;
      state.prevPageIndex = state.currentPageIndex - 1;
      state.nextPageIndex = state.currentPageIndex + (state.currentPageIndex === state.totalPages ? 0 : 1);
      state.currentItemIndex += state.perPage;

    } while (state.currentPageIndex <= state.totalPages);

    // add the new pages to the assemble.options.pages collection
    grunt.verbose.writeln('Pages: '.bold, require('util').inspect(pages));
    params.assemble.options.pages = _.extend({}, (params.assemble.options.pages || {}), pages);

  }

  done();

};

module.exports.options = options;