'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  create: async ctx => {
    const { user } = ctx.state;

    if(!user){
      return ctx.throw(403, 'UnAuthorized Access Denied!', { user: 'not provided' });
    }

    const obj = {
      ...ctx.request.body,
      owner: user.id,
    };

    const data = await strapi.services.address.add(obj);

    ctx.created(data);
  },
  find: async ctx => {
    const { user } = ctx.state;

    if (!user) {
      return ctx.throw(403, 'UnAuthorized Access Denied!', { user: 'not provided' });
    }

    const data = await strapi.services.address.find(user.id);
    ctx.send(data)
  }
};
