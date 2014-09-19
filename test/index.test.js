'use strict';
/*!
 * Dependencies
 * --------------------------------------------------------------------------*/

var Promise     = require('bluebird'),
    mongoose    = require('mongoose'),
    should      = require('should'),
    refPromises = require('..');

var User, Test, user1, user2, user3;

describe('mongoose-ref-promises', function() {
  // Connect to mongo
  before(function() { mongoose.connect('mongodb://localhost/test'); });

  // Register testing model
  before(function() {
    Test = mongoose.model('Test', {});
    var UserSchema = new mongoose.Schema({
      friends:     [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
      best_friend:  { type: mongoose.Schema.ObjectId, ref: 'User' },
      test:         { type: mongoose.Schema.ObjectId, ref: 'Test' },
    });
    UserSchema.plugin(refPromises);
    User = mongoose.model('User', UserSchema);
    Promise.promisifyAll(User);
    Promise.promisifyAll(User.prototype);
  });

  // Create testing documents
  before(function() {
    user1 = new User();
    user2 = new User();
    user3 = new User();

    user1.friends = [user2, user3];
    user1.best_friend = user3;

    return Promise.join(
      user1.saveAsync(),
      user2.saveAsync(),
      user3.saveAsync()
    );
  });

  describe('when using ref-promises with a non-promisified model', function() {
    it('doesn\'t throw', function() {
      var p = user1.testP;
      should.exist(p);
      should.exist(p.then);
    });
  });

  describe('when accessing a unitary reference\'s query promise', function() {
    var promise;

    it('should pass on a promise', function() {
      promise = user1.best_friendP;
      promise.then.should.be.instanceof(Function);
    });

    it('should pass on a promise which resolves to the query\'s expected result', function() {
      return promise.then(function(bf) {
        should.exist(bf);
        bf.should.be.instanceof(User);
        bf.id.should.equal(user3.id);
      });
    });
  });

  describe('when accesssing a array of references\' query promise', function() {
    var promise;

    it('doesn\'t reject if the array is empty', function() {
      var friends = user1.friends;
      user1.friends = [];
      return user1.friendsP
        .then(function(a) {
          a.length.should.equal(0);
          user1.friends = friends;
        });
    });

    it('should pass on a promise', function() {
      promise = user1.friendsP;
      promise.then.should.be.instanceof(Function);
    });

    it('should pass on a promise which resolves to the query\'s expected result', function() {
      return promise.then(function(frs) {
        should.exist(frs);
        frs.should.be.instanceof(Array);

        var ids = frs.map(function(f) {
          f.should.be.instanceof(User);
          return f.id;
        });
        ids.should.containEql(user2.id);
        ids.should.containEql(user3.id);
      });
    });
  });
});
