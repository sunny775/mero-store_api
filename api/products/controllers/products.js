'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');


module.exports = {

  async create(ctx) {
    const { user } = ctx.state;
    let entity;

    if(!user)
      return ctx.throw(403, 'You must be logged in to a vendor account!');

    if (ctx.is('multipart')) {
      let { data, files } = parseMultipartData(ctx);
      
      data = { ...data, vendor: data.vendor || user.id }
      entity = await strapi.services.products.create(data, { files });
    } else {
      return ctx.throw(403, 'Product images are requirred!');
    }
    return sanitizeEntity(entity, { model: strapi.models.products });
  },

  async addImage(ctx) {
    const { id } = ctx.params;

    const { files } = parseMultipartData(ctx);
    const entity = await strapi.services.products.addImage({ id }, { files });

    return sanitizeEntity(entity, { model: strapi.models.products });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.services.products.findOne({ id });
    console.log(entity)
    await Promise.all(
      entity.images.map((file) => strapi.plugins['upload'].services.upload.remove(file))
    )
    return strapi.query('products').delete(ctx.params);
  },

};
