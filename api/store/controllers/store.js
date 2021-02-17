'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

 module.exports = {

   async create(ctx) {
     const {user} = ctx.state;
     let entity;

     if(!user)
       return ctx.throw(403, 'You must be logged in to create a store!');

     if (ctx.is('multipart')) {
       const { data, files } = parseMultipartData(ctx);
       entity = await strapi.services.store.create(data, { files });

       const roles = await strapi.plugins['users-permissions'].services.userspermissions.getRoles();
       const updateData = {
         role: roles.find(e=>e.name === 'vendors').id,
         store: entity.id,
         storeName: entity.title,
       }
       await strapi.plugins['users-permissions'].services.user.edit({ id: user.id }, updateData);
     } else {
       return ctx.throw(400, 'A profile image is required for the store!');
     }
     return sanitizeEntity(entity, { model: strapi.models.store });
   },
};

