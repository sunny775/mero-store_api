function getInvoice(data){

  // playground requires you to assign document definition to a variable called dd

  const {id, customer, items, invoice_total, shipping_cost, payments} = data;
  items = items.map(e=>{
    const {title, price, qty, item_total} = e;
    return (
      [{ text: title, color: '#546e7a' }, { text: price, italics: true, color: '#546e7a' }, { text: qty, italics: true, color: '#546e7a' }, { text: item_total, italics: true, color: '#546e7a' }]
    )
  })
  const getPayments = () => payments[0].terms === 'full' ?
    payments.map(e => ['Full Payment', e.amount, new Date().toDateString(e.createdAt)]) :
    payments.map(e => ['Installment', e.amount, new Date().toDateString(e.createdAt)]);

  const sub_total = parseFloat(invoice_total) - parseFloat(shipping_cost);
  const totalPaid = payments.map(e => parseFloat(e.charged_amount)).reduce((a,e)=>a+e)
  const watermark = totalPaid >= invoice_total ? 'PAID' : 'IN PROGRESS';
  var dd = {
    watermark: { text: watermark, color: '#212121', opacity: 0.1, bold: true, italics: false },
    content: [
      {
        columns: [
          {},
          {
            image: 'data:image/jpeg;base64,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',
            width: 150
          },
          {},
        ]
      },
      {
        alignment: 'justify',
        columns: [

          {
            margin: [0, 20],
            width: '45%',
            type: 'none',
            ul: [
              { text: 'INVOICE:', style: 'totalHead' },
              { text: id, style: 'total' }
            ]
          },
          {},
          {
            margin: [0, 20],
            width: '40%',
            type: 'none',
            ul: [
              { text: new Date().toDateString(), style: 'total' }
            ]
          },
        ]
      },

      {
        alignment: 'justify',
        margin: [0, 20],
        columns: [
          {
            width: '40%',
            type: 'none',
            ul: [
              { text: 'BILLED TO', style: 'totalHead' },
              `customer.name ( ${customer.email} )`,
              cusomer.address.street,
              `${customer.address.city}, ${customer.address.state}`,
            ]
          },

          {},
          {
            width: '40%',
            type: 'none',
            ul: [
              '10percented.com',
              '12 Adetayo Street',
              'Lekki I, Lagos',
            ]
          },
        ]
      },

      {
        style: 'tableExample',
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [{ text: 'ITEM', style: 'tHead' }, { text: 'UNIT COST', style: 'tHead' }, { text: 'QTY', style: 'tHead' }, { text: 'AMOUNT', style: 'tHead' }],
            ...items
          ]
        },
        layout: 'lightHorizontalLines'
      },

      {
        alignment: 'justify',
        columns: [

          {
            margin: [0, 20],
            type: 'none',
            ul: [
              { text: 'INVOICE TOTAL', style: 'totalHead' },
              { text: invoice_total, style: 'total' }
            ]
          },
          {},
          {
            margin: [0, 20],
            width: '49%',
            table: {
              widths: ['*', '*'],
              body: [
                [{ text: 'SUB TOTAL', style: 'tHead' }, { text: sub_total, italics: true, color: '#546e7a' },],
                [{ text: 'SHIPPING COST', style: 'tHead' }, { text: shipping_cost, italics: true, color: '#546e7a' }],
                [{ text: 'TOTAL', style: 'tHead' }, { text: invoice_total, italics: true, color: '#546e7a' },]
              ]
            },
            layout: 'lightHorizontalLines'
          }
        ]
      },

      { text: 'PAYMENT TERMS', style: 'total' },
      {
        style: 'tableExample',
        table: {
          body: [
            [{ text: 'DESCRIPTION', style: 'tHead' }, { text: 'AMOUNT', style: 'tHead' }, { text: 'DATE', style: 'tHead' }],
            ...getPayments()
          ]
        },
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
          }
        }
      },


      {
        margin: [130, 0],
        columns: [
          {},
          { text: '10percented.com', color: 'gray', opacity: 0 },
          {},
          { qr: 'text in QR', width: 100 },
        ]
      },

    ],
    footer: {
      margin: [150, 0],
      columns: [
        {},
        { text: '10percented.com', color: 'gray' },
        {},
      ]
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      tHead: {
        fontSize: 14,
        bold: true,
        color: '#37474f'
      },
      total: {
        fontSize: 14,
        bold: true,
        color: '#0288d1'
      },
      totalHead: {
        fontSize: 12,
        bold: true,
        color: '#9e9e9e'
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      }
    },
    defaultStyle: {
      // alignment: 'justify'
    }

  }
  return dd;
}

exports.getInvoice = getInvoice;