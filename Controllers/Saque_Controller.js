const Orders = require("../Models/Orders");
const Saque = require("../Models/Saque");

module.exports.request = function (req, res, next) {
  balance(req.store_name, req.id, function (saldo) {
    if (saldo >= parseInt(req.body.value) && parseInt(req.body.value) >= 7500) {
      var orders = new Saque({
        user: req.id,
        date: new Date(),
        value: req.body.value,
        status: "WAITING",
      });

      orders.save(function (err) {
        if (err) {
          return res.status(500).send({ error: err });
        } else {
          return res.status(200).send({});
        }
      });
    } else {
      return res.status(500).send({ error: "invalido" });
    }
  });
};

module.exports.index = function (req, res, next) {
  Saque.find({ user: req.id })
    .lean()
    .exec(function (err, saque) {
      if (err) {
        return res.status(500).send({});
      }
      return res.status(200).send({ saque });
    });
};

function balance(store_name, id, callback) {
  try {
    var Saldo = 0;
    var sacado = 0;
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    Orders.find({
      Shop: store_name,
      status: "PAID",
      paid_at: { $lt: cutoff },
    })
      .lean()
      .exec(function (err, products) {
        products.forEach((element) => {
          Saldo += parseInt(element.valor - element.valor * 0.05);
          console.log(element);
        });

        Saque.find({ user: id,  status: { $ne: 'NOT_PAID' }})
          .lean()
          .exec(function (err, saque) {
            saque.forEach((element2) => {
              sacado += parseInt(element2.value);
            });
            callback(parseInt(Saldo * 0.10 - sacado));
          });
      });
  } catch (err) {
    res.status(500).send({ error: err });
  }
}

module.exports.balance = function (req, res, next) {
  try {
    balance(req.store_name, req.id, function (saldo) {
      return res.status(200).send({ Saldo: saldo });
    });
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

module.exports.all = function (req, res, next) {
  Saque.find({})
  .populate("user", 'name')
    .lean()
    .exec(function (err, saque) {
      if (err) {
        return res.status(500).send({});
      }
      return res.status(200).send({ saque });
    });
};

module.exports.PAID = function (req, res, next) {
  Saque.findOne({ _id: req.body.id }, function (err, resp) {
    if (err) {
      res.status(500).send({ error: err });
    }

    if (resp) {
      resp.status = "PAID"
      resp.save().then(() => {
        res.status(200).send();
      });
    } else {
      console.log("nao encontrado");
      res.status(500).send({ error: err });
    }
  });
};

module.exports.NOT_PAID = function (req, res, next) {
  Saque.findOne({ _id: req.body.id }, function (err, resp) {
    if (err) {
      res.status(500).send({ error: err });
    }

    if (resp) {
      resp.status = "NOT_PAID"
      resp.save().then(() => {
        res.status(200).send();
      });
    } else {
      console.log("nao encontrado");
      res.status(500).send({ error: err });
    }
  });
};
