'use strict';

var chai = require('chai'),
    expect = chai.expect,
    util = require('util'),
    errors = require('../lib/errors'),
    DirectiveContext = require('trbl-evergreen/lib/directive-context.js'),
    TestUtils = require('trbl-evergreen/test/utils.js'),
    MongoClient = require('mongodb').MongoClient,
    MongoError = require('mongodb').MongoError,
    MongoDirective = require('../lib/directive');

describe('Mongo Branch Source Directive', function() {

  var docId = null,
      close = function(err, db, next){ db.close(); next(err); };

  before(function(next){
    MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
      db.collection('config').insertOne({ foo: 'bar' }, function(err){
        if (err) return close(err, db, next);
        db.collection('config').find({ foo: 'bar' }).limit(1).next(function(err, doc){
          if (err) return close(err, db, next);
          docId = doc._id;
          db.close();
          next();
        });
      });
    });
  });

  it('should return an error if it cannot connect to Mongo', function(next){

    var context = new DirectiveContext('mongo', util.format('config/{_id:"%s"}', docId), [{ field: 'foo' }]),
        mongoDirective = new MongoDirective({ uri: "mongodb://localhost:27018/test" });

    mongoDirective.handle(context, {}, {}, TestUtils.wrapAsync(next, function(err){
      expect(err).to.be.an.instanceOf(MongoError);
    }));
  });

  it('should return an error if the specified database does not exist', function(next){

    var context = new DirectiveContext('mongo', util.format('config/{_id:"%s"}', docId), [{ field: 'foo' }]),
        mongoDirective = new MongoDirective({ uri: "mongodb://localhost:27017/notfound" });

    mongoDirective.handle(context, {}, {}, TestUtils.wrapAsync(next, function(err){
      expect(err).to.be.an.instanceOf(errors.MongoDocumentNotFoundError);
    }));
  });

  it('should return an error if the specified collection does not exist', function(next){

    var context = new DirectiveContext('mongo', util.format('notfound/{_id:"%s"}', docId), [{ field: 'foo' }]),
        mongoDirective = new MongoDirective({ uri: "mongodb://localhost:27017/test" });

    mongoDirective.handle(context, {}, {}, TestUtils.wrapAsync(next, function(err){
      expect(err).to.be.an.instanceOf(errors.MongoDocumentNotFoundError);
    }));
  });

  it('should return an error if no item is returned for the specified query', function(next){
    var context = new DirectiveContext('mongo', 'config/{notfound:"notfound"}', [{ field: 'foo' }]),
        mongoDirective = new MongoDirective({ uri: "mongodb://localhost:27017/test" });

    mongoDirective.handle(context, {}, {}, TestUtils.wrapAsync(next, function(err){
      expect(err).to.be.an.instanceOf(errors.MongoDocumentNotFoundError);
    }));
  });

  it('should return an error if the expression is invalid', function(next){
    var context = new DirectiveContext('mongo', 'asdasdasdfsadf', [{ field: 'foo' }]),
        mongoDirective = new MongoDirective({ uri: "mongodb://localhost:27017/test" });

    mongoDirective.handle(context, {}, {}, TestUtils.wrapAsync(next, function(err){
      expect(err).to.be.an.instanceOf(errors.EvergreenMongoExpressionError);
    }));
  });

  it('should return an error if the query is invalid', function(next){
    var context = new DirectiveContext('mongo', 'config/akjsdhkjasdhdfa', [{ field: 'foo' }]),
        mongoDirective = new MongoDirective({ uri: "mongodb://localhost:27017/test" });

    mongoDirective.handle(context, {}, {}, TestUtils.wrapAsync(next, function(err){
      expect(err).to.be.an.instanceOf(errors.EvergreenMongoExpressionError);
    }));
  });

  it('should throw an error if the directive is not configured properly', function(){

    expect(function(){ new MongoDirective(); }).to.throw(errors.EvergreenMongoNotConfiguredError);
  });

  it('should return the document for the specified query', function(next){

    var context = new DirectiveContext('mongo', util.format('config/{_id:"%s"}', docId), [{ field: 'foo' }]),
        mongoDirective = new MongoDirective({ uri: "mongodb://localhost:27017/test" });

    mongoDirective.handle(context, {}, {}, TestUtils.wrapAsync(next, function(err, _context){
      expect(err).to.be.null;
      expect(_context.value).to.deep.eq({
        _id: docId,
        foo: 'bar'
      });
    }));
  });
});