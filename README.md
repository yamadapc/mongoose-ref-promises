mongoose-ref-promises
=====================
[![Build Status](https://secure.travis-ci.org/yamadapc/mongoose-ref-promises.png?branch=master)](http://travis-ci.org/yamadapc/mongoose-ref-promises)
[![Code Climate](https://codeclimate.com/github/yamadapc/mongoose-ref-promises.png)](https://codeclimate.com/github/yamadapc/mongoose-ref-promises)
[![Coverage Status](https://coveralls.io/repos/yamadapc/mongoose-ref-promises/badge.png)](https://coveralls.io/r/yamadapc/mongoose-ref-promises)
[![Dependency Status](https://david-dm.org/yamadapc/mongoose-ref-promises.svg)](https://david-dm.org/yamadapc/mongoose-ref-promises)
[![devDependency Status](https://david-dm.org/yamadapc/mongoose-ref-promises/dev-status.svg)](https://david-dm.org/yamadapc/mongoose-ref-promises#info=devDependencies)
[![Analytics](https://ga-beacon.appspot.com/UA-54450544-1/mongoose-ref-promises/README)](https://github.com/igrigorik/ga-beacon)
- - -
A mongoose plugin which adds promise-based population virtual properties to your
Models

## Installation
Install the module with: `npm install mongoose-ref-promises`

Use it by adding it as a plugin to any mongoose.Schema

```javascript
// [...]
var refPromises = require('mongoose-ref-promises');
UserSchema.plugin(refPromises);
// [...]
```

## Examples

The plugin adds virtual properties to each 'ref' property in your schema.

Say we have this setup.

```javascript
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var refPromises = require('mongoose-ref-promises');

var UserSchema = new Schema({
  friends: [{ type: ObjectId, ref: 'User' }],
  bff:      { type: ObjectId, ref: 'User' }
});
UserSchema.plugin(refPromises);

var User = mongoose.model('User', UserSchema);
```

We can than access the virtual properties ```friendsP``` and ```bffP``` of any
'User' document.

*i.e.*

```javascript
// [...]
user.friendsP
  .then(function(friends) {
    // [...]
  });
```

or

```javascript
// [...]
user.bffP
  .then(function(best_friend_forever) {
    // [...]
  });
```

## License
Copyright (c) 2014 Pedro Yamada. Licensed under the MIT license.

## Donations
Would you like to buy me a beer? Send bitcoin to 3JjxJydvoJjTrhLL86LGMc8cNB16pTAF3y
