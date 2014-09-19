'use strict';
/*!
 * Dependencies
 * --------------------------------------------------------------------------*/

var Promise  = require('bluebird');
var _ = require('lodash');

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
      promisificationGuard(model, 'findAsync');
      return model.findAsync({
        $or: _.map(this[path], function(id) { return { _id: id }; })
      });
    });
  }
  else if(isRef(node)) {
    schema.virtual(path + 'P').get(function() {
      var model = this.constructor.db.model(node.ref);
      promisificationGuard(model, 'findByIdAsync');
      return model.findByIdAsync(this[path]);
    });
  }
}

/**
 * Guards against a "unpromisified" mongoose model and "promisifies" it if it's
 * not. It'll also output a warning message linking to an in-depth explanation
 * of this issue.
 *
 * @param {Model} model A mongoose model
 * @param {String} method The method to check for existence
 */

function promisificationGuard(model, method) {
  if(!model[method]) {
    console.error(
      'mongoose-ref-promises requires models to be promisified.\n' +
      'Please take a look at this link for more information:\n' +
      '\n' +
      'Models will be promisified for you on the first call, but that\'s ' +
      'deprecated.'
    );
    Promise.promisifyAll(model);
    Promise.promisifyAll(model.prototype);
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
