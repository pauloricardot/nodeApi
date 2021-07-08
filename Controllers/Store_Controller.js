const Store = require("../Models/Store");
var jwt = require("jsonwebtoken");

module.exports.index = function(req, res, next) {
    try {
        Store.find()
            .lean()
            .select("id url name image description price -_id")
            .exec(function(err, stores) {
                //console.log(JSON.stringify(stores));
                return res.status(200).send(JSON.stringify(stores));
            });
    } catch (err) {
        res.status(500).send({ error: err });
    }
};

module.exports.update = function(req, res, next) {
    console.log(req.store);
    console.log(req.body.banco);
    console.log(req.body.agenc);
    console.log(req.body.conta);
    console.log(req.body.tipo);
    Store.findById(req.store, function(err, doc) {
        doc.banco = req.body.banco,
            doc.agenc = req.body.agenc,
            doc.conta = req.body.conta,
            doc.tipo = req.body.tipo,
            doc.save(function(err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send(doc);
                }
            });
    });
};

module.exports.get_store = function(req, res, next) {
    Store.findById(req.store, function(err, doc) {
        if (doc) {
            res.status(200).send(doc);
        } else {
            res.status(500).send({});
        }
    });
};

module.exports.exist = function(req, res, next) {
    console.log("module.exports.exist store controller: ", req.body.Store)
    Store.count({ name: req.body.Store }, function(err, count) {
        if (count > 0) {
            Store.findOne({ name: req.body.Store }, function(err2, obj) {
                if (err2) {}
                var token = jwt.sign({ Store: obj }, process.env.SECRET, {
                    expiresIn: 43200,
                });
                res.status(200).send({ Store_token: token });
            });
        } else {
            //console.log('Nao encontrado')
            res.status(500).send();
        }
        if (err) {
            //console.log(err)
            res.status(500).send({ error: err });
        }
    });
};