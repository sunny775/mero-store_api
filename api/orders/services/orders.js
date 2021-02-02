'use strict';
const fetch = require('node-fetch');
const PdfPrinter = require('pdfmake/src/printer');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  async init(data) {
    // const validData = await strapi.entityValidator.validateEntityCreation(strapi.models., data);

    try {
      // const tx_ref = nanoid();
      const { id, amount, tx_ref, customer } = data;
      const pi = {
        tx_ref,
        amount,
        currency: "NGN",
        redirect_url: `${process.env.CLIENT_BASE_URL}/payment-information`,
        payment_options: "card",
        meta: {
          consumer_id: id,
        },
        customer: {
          email: customer.email,
          phoneNumber: customer.phone,
          name: customer.name
        },
        customizations: {
          title: "10percented Payments",
          description: "Payment for products purchase",
          logo: `${process.env.CLIENT_BASE_URL}/logo.png`
        }
      }

      return fetch('https://api.flutterwave.com/v3/payments', {
        method: 'post',
        body: JSON.stringify(pi),
        headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
      })
        .then(res => res.json())

    } catch (error) {
      throw new Error(error);
    }
  },

  async verify(data) {
    try {
      const { tx_ref } = data;
      return fetch(`https://api.flutterwave.com/v3/transactions/${tx_ref}/verify`, {
        method: 'get',
        headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
      })
        .then(res => res.json())
    } catch (error) {
      throw new Error(error);
    }
  },

  async savePayment(data) {
    const validData = await strapi.entityValidator.validateEntityCreation(strapi.models.transaction, data);

    const result = strapi.query('transaction').model.create(validData);
    return result;
  },

  async saveOrder(data) {
    const validData = await strapi.entityValidator.validateEntityCreation(strapi.models.order, data);

    const result = strapi.query('order').model.create(validData);
    return result;
  },

  async createPdfBinary(pdfDoc, autoDownload, callback) {

    var printer = new PdfPrinter();

    var doc = printer.createPdfKitDocument(pdfDoc);

    var chunks = [];
    var result;

    doc.on('data', function (chunk) {
      chunks.push(chunk);
    });
    doc.on('end', function () {
      result = Buffer.concat(chunks);
      if (autoDownload) {
        callback(result);
      } else {
        callback('data:application/pdf;base64,' + result.toString('base64'));
      }
    });
    doc.end();

  }

};
