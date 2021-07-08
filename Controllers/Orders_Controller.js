const Orders = require("../Models/Orders");
const Store = require("../Models/Store");
const Shipping = require("../Models/Shipping");
const { v4: uuidv4 } = require("uuid");
var moment = require('moment'); // require

const moip = require("moip-sdk-node").default({
  production: true,
  token: "RTBLB8FCJOV9SGC9UJHV5CF3I2ECHI9W",
  key: "JZHXPZMKDTHS6RLT0FUQIQKXLPAIN1RP1Y7V71M1",
  // token: "B7AXNER3WLIF5Z5R37BJDTRMCV9NTOGF",
  // key: "EJBWQA3FGATZC9RWDORWOZFHJSKPLVSF7ZQ21Y9O",
  // production: false,
});

function shipping_tax(CEP, PESO, callback) {
  Shipping.findOne(
    {
      zip_initial: { $lte: CEP },
      zip_final: { $gte: CEP },
      peso_from: { $lte: PESO },
      peso_to: { $gte: PESO },
    },
    function (err, resp) {
      callback(err, resp);
    }
  );
}

function CREDIT_CARD(req, res, next) {
  console.log(req.body);
  const area = req.body.Telefone.substring(0, 2);
  console.log(area);
  const Telefone = req.body.Telefone.substring(2, 11);
  console.log(Telefone);
  const hash = req.body.hash;
  moip.payment
    .create(req.order, {
      installmentCount: req.body.installmentCount,
      fundingInstrument: {
        method: "CREDIT_CARD",
        creditCard: {
          hash: hash,
          store: true,
          holder: {
            fullname: req.body.fullname,
            birthdate: req.body.birthDate,
            taxDocument: {
              type: "CPF",
              number: req.body.cpf,
            },
            phone: {
              countryCode: "55",
              areaCode: area,
              number: Telefone,
            },
          },
        },
      },
    })
    .then((response) => {
      // await update_order(
      //   req.order_id,
      //   response.body.status,
      //   response.body.amount.total
      // );
      //console.log(response.body);
      res.status(200).send({
        Order: req.order,
        Email: req.email,
        shippingAddress: {
          city: req.body.Cidade,
          complement: req.body.Comple,
          district: req.body.Bairro,
          street: req.body.Rua,
          streetNumber: req.body.N,
          zipCode: req.body.CEP,
          state: req.body.Estado,
          country: "BRA",
        },
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.error.ERROR) {
        res.status(500).send({ error: err.error.ERROR });
      } else {
        console.log(err.error.errors);
        res
          .status(500)
          .send({ error: "Dados do cartão de credito são inválidos" });
      }
    });
}

function BOLETO(req, res, next) {
  var limite = moment().add(3, 'days').format('YYYY-MM-DD'); 
  console.log(limite)
  moip.payment
    .create(req.order, {
      installmentCount: 1,
      fundingInstrument: {
        method: "BOLETO",
        boleto: {
          expirationDate: limite,
          instruction_lines: {
            first: " ",
            second: " ",
            third: " ",
          },
          logo_uri:
            "https://www.champion.ind.br/loja/skin/frontend/smartwave/koan/images/logo_champion_site.png",
        },
      },
    })
    .then((response) => {
      console.log(response.body);
      res.status(200).send({
        Order: req.order,
        Email: req.email,
        shippingAddress: {
          city: req.body.Cidade,
          complement: req.body.Comple,
          district: req.body.Bairro,
          street: req.body.Rua,
          streetNumber: req.body.N,
          zipCode: req.body.CEP,
          state: req.body.Estado,
          country: "BRA",
        },
        link: response.body._links.payBoleto.printHref,
      });
      
    })
    .catch((err) => {
      console.log(err);
      console.log('send 500 in boleto')
      res.status(500).send("Nao Encontrado!");
      
    });
}

function save_db(
  req,
  res,
  next,
  fn
) {
  var orders = new Orders({
    Orderid: req.order,
    Shop: req.body.shop,
    description: req.body.items,
    mycode: req.uuid,
    username:  req.Customer,
    type: req.body.type == "BOL" ? "Boleto" : "Cartão de Credito",
    date: new Date(),
    status: "CREATED",
    valor: "0000",
    boletolink: null,
  });
  orders.save(function (err, obj) {
    if (err) {
      console.log(err);
      console.log('error 500 in save db')
      res.status(500).send('Ocorreu um erro inesperado ao realizar seu pedido, Por favor tente novamente!');
    } else {
      req.order_id = obj._id;
      fn(req, res, next);
    }
  });
}

module.exports.shipping = function (req, res, next) {
  shipping_tax(req.body.Cep, req.body.peso, function (err, resp) {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      if (resp) {
        res.status(200).send({ preco: resp.preco, tempo: resp.tempo });
      } else {
        //console.log("nao encontrado");
        res.status(500).send({ error: err });
      }
    }
  });
};

module.exports.create = function (req, res, next) {
  const items = req.body.items;
  const json_items = JSON.parse(items);
  console.log(req.body);
  req.uuid = uuidv4();
  moip.order
    .create({
      ownId: req.uuid,
      amount: {
        currency: "BRL",
        subtotals: {
          addition: req.body.juros,
          shipping: req.body.shipping,
        },
      },
      items: json_items,
      customer: {
        id: req.Customer,
        phone: {
          countryCode: "55",
          areaCode: req.body.areaCode,
          number: req.body.number,
        },
        shippingAddress: {
          city: req.body.Cidade,
          complement: req.body.Comple,
          district: req.body.Bairro,
          street: req.body.Rua,
          streetNumber: req.body.N,
          zipCode: req.body.CEP,
          state: req.body.Estado,
          country: "BRA",
        },
      },
    })
    .then((response) => {
      console.log(response);
      req.order = response.body.id;
      req.email = response.body.customer.email;
      save_db(
        req,
        res,
        next,
        req.body.type == "BOL"
          ? BOLETO
          : CREDIT_CARD
      );
    })
    .catch((err) => {
      console.log(err);
      console.log('send 500 in catch create')
      res.status(500).send(err);
    });
};

module.exports.view = function (req, res, next) {
  moip.order
    .getOne(req.body.id)
    .then((response) => {
      res.status(200).send({ body: response.body });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};

module.exports.add = function (req, res, next) {
  console.log("--------------------------------------------------------");
  console.log(req.body);
  console.log("--------------------------------------------------------");
  const body = req.body;
  const order = body.resource.order.id;
  const event = body.event.replace("ORDER.", "");
  Orders.findOne({ Orderid: order }, function (err, resp) {
    if (err) {
      res.status(500).send({ error: err });
    }
    if (resp) {
      console.log(body.resource.order.amount);
      resp.valor = body.resource.order.amount.total;

      if (resp.status == "CREATED") {
        resp.status = event;
      }

      if (resp.status == "WAITING" && event != "CREATED") {
        if (event == "PAID") {
          resp.paid_at = new Date();
        }
        resp.status = event;
      }

      if (event == "PAID") {
        resp.paid_at = new Date();
        resp.status = event;
      }

      if (event == "NOT_PAID") {
        resp.status = event;
      }
      if (event == "REVERTED") {
        resp.status = event;
      }
      resp.save().then(() => {
        res.status(200).send();
      });
    } else {
      console.log("nao encontrado");
      res.status(500).send({ error: err });
    }
  });
};

module.exports.index = function (req, res, next) {
  try {
    Store.findOne({ _id: req.store }, function (err2, obj) {
      if (err2) {
        res.status(500).send({ error: err2 });
      }
      Orders.find({ Shop: obj.name })
        .lean()
        .sort({ date: "desc" })
        .exec(function (err, products) {
          return res.status(200).send(JSON.stringify(products));
        });
    });
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

module.exports.client = function (req, res, next) {
  try {
    Orders.find({ username: req.Customer })
      .lean()
      .sort({ date: "desc" })
      .exec(function (err, products) {
        return res.status(200).send(JSON.stringify(products));
      });
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

module.exports.webhook = function (req, res, next) {
  moip.notification
    .create({
      events: ["ORDER.*"],
      target: "https://parceirochampion.ind.br/api",
      media: "WEBHOOK",
    })
    .then((response) => {
      //console.log(response.body);
    })
    .catch((err) => {
      //console.log(err);
    });
};
