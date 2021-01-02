'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create (ctx) {
  const { id } = ctx.state.user;
  const {vendor} = ctx.request.body;

  const productObj = {
    ...ctx.request.body,
    vendor: vendor || id,
  };

  const data = await strapi.services.product.add(productObj);

  // Send 201 `created`
  ctx.created(data);
},
};
