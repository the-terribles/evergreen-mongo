'use strict';

var MongoDirective = require('./lib/directive');

/**
 * Evergreen Module Declaration syntax
 * @type {{directives: Array}}
 */
module.exports = {
  directives: [ new MongoDirective() ]
};