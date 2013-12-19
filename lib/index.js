'use strict';
/**
 * Dependencies
 * --------------------------------------------------------------------------*/

var _        = require('underscore'),
    mbUtils  = require('mongoose-bluebird-utils'),
    mongoose = require('mongoose');

/**
 * Plugin
 * --------------------------------------------------------------------------*/

module.exports = function(schema) {
  _.each(schema.tree, _.partial(addVirtualRef, schema));
};

/**
 * addVirtualRef(schema, node, path)
 * Checks if the schema's property at path is a ref - or an Array of refs - and,
 * if yes, adds a virtual property suffixed with 'P', which returns a promise to
 * the reference's query result(s).
 */

function addVirtualRef(schema, node, path) {
  if(_.isArray(node) && isRef(_.first(node))) {
    schema.virtual(path + 'P').get(function() {
      var model = mongoose.model(_.first(node).ref);
      return mbUtils.findP(model, { _id: { $in: this[path] } });
    });
  }

  else if(isRef(node)) {
    schema.virtual(path + 'P').get(function() {
      var model = mongoose.model(node.ref);
      return mbUtils.findByIdP(model, this[path]);
    });
  }
}

/**
 * isRef(sprop)
 * Checks if a schema property is a 'ref' to another document.
 */

function isRef(sprop) {
  return !!sprop && !!sprop.ref;
}
