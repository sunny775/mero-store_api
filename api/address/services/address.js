'use strict';

const { find } = require("../controllers/address");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  async add(data) {
    const validData = await strapi.entityValidator.validateEntityCreation(strapi.models.address, data);

    const result = strapi.query('address').model.findOneAndUpdate({ owner: validData.owner },
      validData, { upsert: true }, function (err, docs) {
        if (err) {
          console.log(err)
        }
        else {
          console.log(docs);
          // const res = await this.findById(docs._id).exec();
          return docs;
        }
      }); 

    return this.findOne({ id: result.id });
  },
  async find(owner){
    const data = strapi.query('address').find({ owner });
    return data;
  }
};
