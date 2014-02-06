
/**
 * Dependencies
 * --------------------------------------------------------------------------*/

var Promise     = require('bluebird'),
    mongoose    = require('mongoose'),
    mbUtils     = require('mongoose-bluebird-utils'),
    should      = require('should'),
    refPromises = require('..');

var User, user1, user2, user3;

describe('mongoose-ref-promises', function() {
  // Connect to mongo
  before(function() { mongoose.connect('mongodb://localhost/test'); });

  // Register testing model
  before(function() {
    var UserSchema = new mongoose.Schema({
      friends:     [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
      best_friend:  { type: mongoose.Schema.ObjectId, ref: 'User' }
    });
    UserSchema.plugin(refPromises);
    User = mongoose.model('User', UserSchema);
  });

  // Create testing documents
  before(function(done) {
    user1 = new User();
    user2 = new User();
    user3 = new User();

    user1.friends = [user2, user3];
    user1.best_friend = user3;

    Promise.join(
      mbUtils.saveP(user1),
      mbUtils.saveP(user2),
      mbUtils.saveP(user3)
    ).nodeify(done);
  });

  describe('when accessing a unitary reference\'s query promise', function() {
    var promise;

    it('should pass on a promise', function() {
      promise = user1.best_friendP;
      promise.then.should.be.instanceof(Function);
    });

    it('should pass on a promise which resolves to the query\'s expected result', function(done) {
      promise.then(function(bf) {
        should.exist(bf);
        bf.should.be.instanceof(User);
        bf.id.should.equal(user3.id);
      }).nodeify(done);
    });
  });

  describe('when accesssing a array of references\' query promise', function() {
    var promise;

    it('doesn\'t reject if the array is empty', function(done) {
      var friends = user1.friends;
      user1.friends = [];
      user1.friendsP
        .then(function(a) {
          a.length.should.equal(0);
          user1.friends = friends;
          done();
        }, done);
    });

    it('should pass on a promise', function() {
      promise = user1.friendsP;
      promise.then.should.be.instanceof(Function);
    });

    it('should pass on a promise which resolves to the query\'s expected result', function(done) {
      promise.then(function(frs) {
        should.exist(frs);
        frs.should.be.instanceof(Array);

        var ids = frs.map(function(f) {
          f.should.be.instanceof(User);
          return f.id;
        });
        ids.should.include(user2.id);
        ids.should.include(user3.id);
      }).nodeify(done);
    });
  });
});
