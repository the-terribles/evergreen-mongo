'use strict';

var util = require('util');

/**
 * Really shitty way to call "super" on an error.
 * @param name {String} Name of the Error.
 * @param message {String} Message passed to Error.
 */
var superError = function(name, message){
  var error = Error.call(this, message);
  this.name = name;
  this.message = error.message;
  this.stack = error.stack;
};

/**
 * Thrown if the MongoDirective was not configured correctly.
 * @constructor
 */
function EvergreenMongoNotConfiguredError(){
  superError.call(
    this,
    'EvergreenMongoNotConfiguredError',
    'The Evergreen Mongo directive was not configured correctly.  Did you set the environment variable "EV_MONGO_URI"?'
  );
}

util.inherits(EvergreenMongoNotConfiguredError, Error);

exports.EvergreenMongoNotConfiguredError = EvergreenMongoNotConfiguredError;

/**
 * Thrown if no documents were found matching the query
 * @param collection {String} collection name
 * @param query {Object} query
 * @constructor
 */
function MongoDocumentNotFoundError(collection, query){
  superError.call(
    this,
    'MongoDocumentNotFoundError',
    util.format(
      'The %s collection does not have any documents that match query: %s',
      collection, JSON.stringify(query, null, 2))
  );

  this.collection = collection;
  this.query = query;
}

util.inherits(MongoDocumentNotFoundError, Error);

exports.MongoDocumentNotFoundError = MongoDocumentNotFoundError;

/**
 * Should be thrown if the supplied expression is invalid
 * @param expression {String} Expression
 * @constructor
 */
function EvergreenMongoExpressionError(expression){
  superError.call(
    this,
    'EvergreenMongoExpressionError',
    util.format(
      'The supplied expression is invalid: %s', expression)
  );

  this.expression = expression;
}

util.inherits(EvergreenMongoExpressionError, Error);

exports.EvergreenMongoExpressionError = EvergreenMongoExpressionError;