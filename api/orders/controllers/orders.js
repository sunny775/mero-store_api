'use strict';
const { nanoid } = require('nanoid');
const { verify } = require("../services/orders");
const { getInvoice } = require('../../../utils/invoice')
const _ = require('lodash');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  async create(ctx) {
    const { user } = ctx.state;

    if (!user) {
      return ctx.throw(403, 'UnAuthorized Access Denied!', { user: 'not provided' });
    }
    const tx_ref = nanoid();
    ctx.session.order = { ...ctx.request.body, tx_ref };

    const { invoice_total, customer } = ctx.request.body;
    const res = await strapi.services.orders.init({
      id: user.id,
      amount: invoice_total,
      tx_ref,
      customer
    });

    ctx.redirect(res.data.link)
  },

  async verify(ctx) {
    const { user } = ctx.state;

    if (!user) {
      return ctx.throw(403, 'UnAuthorized Access Denied!');
    }
    try {
      const { tx_ref, shipping_cost, invoice_total, items, type, store } = ctx.session.order;

      //verify
      const data = await strapi.services.orders.verify({
        tx_ref
      });
      const success = (data.status === "success") && (tx_ref === data.tx_ref);
      const fullPay = (parseFloat(data.charged_amount) >= parseFloat(invoice_total))

      //create transactio doc
      const transaction = await strapi.services.orders.savePayment({
        tx_ref: data.tx_ref,
        status: success,
        charged_amount: data.charged_amount,
        type,
        terms: fullPay ? 'full' : 'installment'
      })

      //const address = await strapi.services.address.find(ctx.state.user.id);
      //create order doc
      const order = await strapi.services.orders.saveOrder({
        payments: [transaction.id],
        customer,
        seller: store, //store.id
        shipping_cost,
        invoice_total,
        items

      });

      const dd = getInvoice(order);
      const file = await strapi.services.orders.createPdfBinary(dd, true, function (buffer) {
        return buffer;
      })

      const emailTemplate = {
        subject: 'Order <%= order.id %> placed!',
        text: `Thank you for shopping with us!
              Your order: <b><%= order.id %></b> has been recieved.`,
        html: `<h1>Thank you <%= order.customer.name %> for shopping with us!</h1>
              <p>Click this link to download your invoice:
              <a href="https://mero-store.herokuapp.com/orders/invoice?id=<%= order.id %>">Download invoice</a>.<p>`,
        attachments: [
          { 
            filename: `order_${Date.now()}.pdf`,
            content: file,
          },
        ]
      };

      await strapi.plugins.email.services.email.sendTemplatedEmail(
        {
          to: order.customer.email,
          // from: is not specified, so it's the defaultFrom that will be used instead
        },
        emailTemplate,
        {
          order,
        }
      );
      ctx.send(order);
    } catch (error) {
      ctx.throw(403, 'Error verifying transaction!');
    }
  },

  async fetchInvoice(ctx) {
    const { id, auto } = ctx.request.query;
    const order = await strapi.services.orders.find({ id })
    const dd = getInvoice(order);

    await strapi.services.orders.createPdfBinary(dd, auto || null, function (file) {
      ctx.type = 'application/pdf'
      ctx.send(file);
    })
  }
};
