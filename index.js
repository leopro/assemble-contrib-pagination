/*
 * Assemble Plugin: assemble-contrib-pagination
 * https://github.com/assemble/assemble-contrib-pagination
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 Brian Woodward, Jon Schlinkert, contributors
 * Licensed under the MIT license.
 */

var matter = require('gray-matter');
var file = require('fs-utils');
var path = require('path');
var _ = require('lodash');


var options = {
  stage: 'options:post:configuration'
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

    opts = _.extend({
      dest: '.',
      structure: ':num/index:ext',
      per_page: 10
    }, opts);

    var template = [

      '<a href="{{page.pagination.previous_page_path}}">Previous</a> | <a href="{{page.pagination.next_page_path}}">Next</a>',
      '{{#each page.pagination.items}}',
      '<div>{{this.data.src}}</div>',
      '<div>{{this.data.summary}}</div>',
      '{{/each}}'

    ].join('\n');

    grunt.verbose.writeln('Template: '.bold, opts.template);
    if (opts.template && opts.template.length > 0) {
      template = file.readFileSync(opts.template);
    }

    grunt.verbose.writeln('Source: '.bold, opts.src);
    // Expand given filepaths
    var filepaths = file.expand(opts.src || '');
    var total = filepaths.length;
    var per_page = opts.per_page;
    var total_pages = Math.round(total/per_page);

    var currentItem = 0;
    var currentPage = 1;
    var prevPage = 1;
    var nextPage = 2;

    var pages = {};
    var items = [];

    _.each(filepaths, function (filepath, index) {

      grunt.verbose.writeln('Filepath: '.bold, filepath);
      var item = file.readFileSync(filepath);
      var itemObj = matter(item);

      var context = _.extend({}, itemObj.context);
      context.src = filepath;

      items.push({
        filename: filepath,
        content: itemObj.content,
        data: context
      });

    });

    var makePage = function(name) {
      return {
        filename: name,
        content: template,
        data: {
          pagination: {
            items: []
          }
        }
      };
    };

    do {

      var page = makePage(path.join(opts.dest, String(currentPage), 'index.html'));

      page.data.pagination.page = currentPage;
      page.data.pagination.per_page = per_page;
      page.data.pagination.items = items.slice(currentItem, Math.min(total, currentItem + per_page));
      page.data.pagination.total_items = total;
      page.data.pagination.total_pages = total_pages;
      page.data.pagination.previous_page = prevPage;
      page.data.pagination.previous_page_path = path.join(opts.dest, String(prevPage), 'index.html');
      page.data.pagination.next_page = nextPage;
      page.data.pagination.next_page_path = path.join(opts.dest, String(nextPage), 'index.html');

      pages[page.filename] = page;

      currentPage++;
      prevPage = currentPage - 1;
      nextPage = currentPage + (currentPage === total_pages ? 0 : 1);
      currentItem += per_page;

    } while (currentPage <= total_pages);

    grunt.verbose.writeln('Pages: '.bold, require('util').inspect(pages));
    params.assemble.options.pages = _.extend({}, (params.assemble.options.pages || {}), pages);

  }

  done();

};

module.exports.options = options;