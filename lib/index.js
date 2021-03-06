'use strict';
/*!
 * Dependencies
 * --------------------------------------------------------------------------*/

var Promise  = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');

var findByIdAsync = Promise.promisify(mongoose.Model.findById);
var findAsync = Promise.promisify(mongoose.Model.find);

/*!
 * Plugin
 * --------------------------------------------------------------------------*/

exports = module.exports = function(schema) {
  _.each(schema.tree, _.partial(addVirtualRef, schema));
};

/**
 * Checks if the schema's property at path is a ref - or an Array of refs - and,
 * if yes, adds a virtual property suffixed with 'P', which returns a promise to
 * the reference's query result(s).
 *
 * @param {Schema} schema The node's schema, to add the virtuals into
 * @param {Object} node The tree node to add a virtual ref for
 * @param {String} path The tree node's path to infer the virtual's name
 */

function addVirtualRef(schema, node, path) {
  if(_.isArray(node) && isRef(_.first(node))) {
    schema.virtual(path + 'P').get(function() {
      if(!this[path] || !this[path].length)
        return Promise.resolve([]);

      var model = this.constructor.db.model(_.first(node).ref);
      return findAsync.call(model, {
        $or: _.map(this[path], function(id) { return { _id: id }; })
      });
    });
  }
  else if(isRef(node)) {
    schema.virtual(path + 'P').get(function() {
      var model = this.constructor.db.model(node.ref);
      return findByIdAsync.call(model, this[path]);
    });
  }
}

/**
 * Checks if a schema property is a 'ref' to another document.
 *
 * @param {Object} sprop
 * @return {Boolean}
 */

function isRef(sprop) {
  return !!sprop && !!sprop.ref;
}
