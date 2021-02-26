'use strict';
const { nanoid } = require('nanoid');
const { verify } = require("../services/orders");
const { getInvoice } = require('../../../utils/invoice')
const _ = require('lodash');
const jwt = require('jsonwebtoken');

module.exports = {

  async create(ctx) {
    const { user } = ctx.state;

    if (!user) {
      return ctx.throw(403, 'UnAuthorized Access Denied!', { user: 'not provided' });
    }
    const tx_ref = nanoid();

    const token = jwt.sign({
      data: { ...ctx.request.body, tx_ref },
    }, tx_ref, /*{ expiresIn: 60 * 20 }*/);

    /*await strapi.services.checkout.create({
      token,
      tx_ref
    })*/


    const { amount, customer } = ctx.request.body;
    const res = await strapi.services.orders.init({
      id: user.id,
      token,
      amount,
      tx_ref,
      customer
    });

    ctx.send(res.data)

  },

  async verify(ctx) {
    const { user } = ctx.state;
    const {tx_ref: ref, status} = ctx.query;

    if (!user) {
      return ctx.throw(403, 'UnAuthorized Access Denied!');
    }
    if (!ref) {
      return ctx.throw(400, 'Transaction reference required!');
    }
    

    /*const token = await strapi.query('checkout').find({ tx_ref: ref });

    if (!token) {
      return ctx.throw(402, 'Invalid transaction reference 11');
    }*/

    /* var order_details;
    jwt.verify(token[0].token, ref, function (err, decoded) {
      if (err) {
        return ctx.throw(402, 'Invalid transaction reference 22');
      }
      console.log('DECODED:', decoded);
      order_details = decoded.data;
    });

    const {
      tx_ref,
      shipping_cost,
      cartTotal: invoice_total,
      cartItems: items,
      type,
      vendor
    } = order_details; */

    //verify
    const data = await strapi.services.orders.verify(ref)
      .then(res=>res.data)
      .catch(error => {
        console.log(error.response)
        return ctx.throw(402, 'Error verifying transaction!');
      })

    console.log('verification result:', data);
    ctx.send(data);

    //const success = (data.status === "success") && (ref === data.tx_ref);
    //const fullPay = (parseFloat(data.charged_amount) >= parseFloat(invoice_total))

  //   try{
  //   //create transactio doc
  //   const transaction = await strapi.services.orders.savePayment({
  //     tx_ref: data.tx_ref,
  //     status: success ? 'success' : data.status,
  //     charged_amount: data.charged_amount,
  //     type,
  //     terms: fullPay ? 'full' : 'installment',
  //     customer,
  //     vendor
  //   })

  //   /* if(!success){
  //     return ctx.throw(400, 'Transaction Failed!');
  //   } */

  //   //create order doc
  //   const order = await strapi.services.orders.saveOrder({
  //     payments: [transaction.id],
  //     customer,
  //     vendor, //seller.id
  //     shipping_cost,
  //     invoice_total,
  //     items

  //   });

  //   const dd = getInvoice(order);
  //   const file = await strapi.services.orders.createPdfBinary(dd, true, function (buffer) {
  //     return buffer;
  //   })

  //   const emailTemplate = {
  //     subject: 'Order <%= order.id %> placed!',
  //     text: `Thank you for shopping with us!
  //             Your order: <b><%= order.id %></b> has been recieved.`,
  //     html: `<h1>Thank you <%= order.customer.name %> for shopping with us!</h1>
  //             <p>Click this link to download your invoice:
  //             <a href="https://mero-store.herokuapp.com/orders/invoice?id=<%= order.id %>">Download invoice</a>.<p>`,
  //     attachments: [
  //       {
  //         filename: `order_${Date.now()}.pdf`,
  //         content: file,
  //       },
  //     ]
  //   };

  //   await strapi.plugins.email.services.email.sendTemplatedEmail(
  //     {
  //       to: order.customer.email,
  //       // from: is not specified, so it's the defaultFrom that will be used instead
  //     },
  //     emailTemplate,
  //     {
  //       order,
  //     }
  //   );
  //   ctx.send(order);
  // } catch(error) {
  //   //console.log(error)
  //   console.log('message:', error)
  //   ctx.throw(403, 'Error verifying transaction!');
  // }
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
