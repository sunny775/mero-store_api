'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create (ctx) {
    const { user } = ctx.state;

    if (!user) {
      return ctx.throw(403, 'UnAuthorized Access Denied!', { user: 'not provided' });
    }
  const {vendor} = ctx.request.body;

  const productObj = {
    ...ctx.request.body,
    vendor: vendor || user.id,
  };

  const data = await strapi.services.product.add(productObj);

  // Send 201 `created`
  ctx.created(data);
},

};
