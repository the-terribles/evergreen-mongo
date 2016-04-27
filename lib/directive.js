'use strict';

var errors = require('./errors'),
    safeEval = require('safe-eval'),
    EvergreenMongoNotConfiguredError = errors.EvergreenMongoNotConfiguredError,
    MongoDocumentNotFoundError = errors.MongoDocumentNotFoundError,
    EvergreenMongoExpressionError = errors.EvergreenMongoExpressionError,
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;

/**
 * Initialize the MongoDirective.
 *
 * Usage in the template:
 *
 *   $mongo:<collection>/<query>
 *
 *   Where "collection" is a MongoDB collection
 *   and "query" is a valid MongoDB $where query.
 *
 * Example:
 *
 *   // Get document by ID
 *   $mongo:config/{_id:"507f1f77bcf86cd799439011"}
 *
 *   // Get document by query
 *   $mongo:config/{ environment: "blue", service: "email" }
 *
 * @param config {{ uri: {String} }} optional configuration.
 *               If the 'uri' is not specified, then the environment variable will be used.
 * @constructor
 */
function MongoDirective(config){
  config = config || {};
  this.strategy = 'mongo';
  this.uri = config.uri || process.env[MongoDirective.EnvironmentKey];
  if (!this.uri) throw new EvergreenMongoNotConfiguredError();
}

/**
 * The environment key for MongoDirective.
 * @type {string}
 * @private
 */
MongoDirective.EnvironmentKey = 'EV_MONGO_URI';

/**
 * The name of the strategy.  This is also the directive prefix.
 * @type {string}
 */
MongoDirective.prototype.strategy = 'mongo';

/**
 * Parse the expression.  If the expression is invalid, it will throw an error.  Also, if the
 * expression includes an "_id", it will be converted to a Mongo ObjectID.
 * @param expression {String}
 * @returns {{collection: *, query: *}}
 */
MongoDirective.parseExpression = function(expression){
  if (expression.indexOf('/') < 1) throw new EvergreenMongoExpressionError(expression);
  // Cut the expression.
  var mongoCollection, query, evaluatedQuery;

  try {
    mongoCollection = expression.slice(0, expression.indexOf('/'));
    query = expression.slice(expression.indexOf('/') + 1);
    evaluatedQuery = safeEval(query);
    if (evaluatedQuery._id) evaluatedQuery._id = new ObjectID(evaluatedQuery._id);
  }
  catch (e){
    throw new EvergreenMongoExpressionError(expression);
  }

  return { collection: mongoCollection, query: evaluatedQuery };
};

/**
 * Close the connection and execute the callback (passing the error).
 * @param err {*} Error
 * @param db {MongoClient} Database
 * @param callback {Function}
 */
MongoDirective.closeAndFail = function(err, db, callback){
  if (db) db.close();
  return callback(err);
};

/**
 * Handle the expression.
 * @param context {DirectiveContext} Evergreen directive context
 * @param _tree {Object} tree (not used)
 * @param _metadata {Object} metadata about the tree (not used)
 * @param callback {Function}
 */
MongoDirective.prototype.handle = function(context, _tree, _metadata, callback){
  var parsed = null;

  try {
    parsed = MongoDirective.parseExpression(context.expression);
  }
  catch (e){
    return callback(e);
  }

  MongoClient.connect(this.uri, function(err, db){

    if (err) return MongoDirective.closeAndFail(err, db, callback);

    db.collection(parsed.collection).find(parsed.query).limit(1).next(function(err, doc){

      if (err) return MongoDirective.closeAndFail(err, db, callback);

      if (!doc) return MongoDirective.closeAndFail(
                          new MongoDocumentNotFoundError(parsed.collection, parsed.query), db, callback);

      db.close();

      //doc._id = doc._id.toString();

      callback(null, context.resolve(doc));
    });
  });
};

module.exports = MongoDirective;