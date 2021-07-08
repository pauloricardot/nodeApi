const User = require("../Models/User");
const Store = require("../Models/Store");
var jwt = require("jsonwebtoken");
var crypto = require("crypto");

const moip = require("moip-sdk-node").default({
    production: true,
    token: "RTBLB8FCJOV9SGC9UJHV5CF3I2ECHI9W",
    key: "JZHXPZMKDTHS6RLT0FUQIQKXLPAIN1RP1Y7V71M1",

    //token: "B7AXNER3WLIF5Z5R37BJDTRMCV9NTOGF",
    // key: "EJBWQA3FGATZC9RWDORWOZFHJSKPLVSF7ZQ21Y9O",
    //production: false,
});

function send(req, res, next) {
    const uuid = req.ownid;
    const area = req.body.Telefone.substring(0, 2);
    const Telefone = req.body.Telefone.substring(2, 11);
    let type = "CPF";
    if (req.body.taxDocument_type) {
        type = req.body.taxDocument_type;
    }
    console.log("cpf: ", type);
    moip.customer
        .create({
            ownId: uuid,
            fullname: req.body.Name,
            email: req.body.Email,
            birthDate: req.body.Data,
            taxDocument: {
                type: type,
                number: req.body.CPF,
            },
            phone: {
                countryCode: "55",
                areaCode: area,
                number: Telefone,
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
        })
        .then((response) => {
            //console.log(response.body.id);
            User.findById(uuid, function(err, doc) {
                doc.wire_id = response.body.id;
                doc.save();
            });

            const Email = require("../Config/Email/EmailConfig");
            const Template = require("../Config/Email/EmailComfirmTemplate");
            Email.sendemail(req.body.Email, "Bem-vindo !", Template.email(req.token));
            res.status(200).send({});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        });
}

module.exports.authenticate = function(name, pass, fn) {
    console.log("authenticate user: ", name);
    User.findOne({ $or: [{ email: name }, { cpf: name }] })
        .populate("store")
        .exec(function(err, user) {
            if (!user) return fn(err);
            if (pass == user.password) {
                return fn(null, user);
            }
            fn(new Error("invalid password"));
    });
};

module.exports.add = function(req, res, next) {
    console.log("user add", req.body);
    req.token = crypto.randomBytes(255).toString("hex");
    const name = req.body.Name;
    const email = req.body.Email;
    const password = req.body.Senha;
    const Insc = req.body.Insc;
    const Pis = req.body.Pis;
    const CPF = req.body.CPF;
    const picture = "";
    const level = 0;
    const wire_id = "CUS-000000000000";
    var user = new User({
        name: name,
        email: email,
        password: password,
        picture: picture,
        wire_id: wire_id,
        insc: Insc,
        pis: Pis,
        cpf: CPF,
        level: level,
        ative: false,
        token: req.token,
    });

    user.save(function(err, obj) {
        if (err) {
            res.status(500).send({ error: err.message });
        } else {
            if (
                req.body.Store != null &&
                req.body.Store != "null" &&
                req.body.Store != ""
            ) {
                var store = new Store({
                    name: req.body.Store,
                    banco: req.body.banco,
                    agenc: req.body.agenc,
                    conta: req.body.conta,
                    tipo: req.body.tipo,
                });
                store.save(function(err2, obj2) {
                    if (err2) {
                        res.status(500).send({ error: err2.message });
                    } else {
                        obj.store = obj2._id;
                        obj.save();
                    }
                });
            }
            req.ownid = obj._id;
            send(req, res, next);
        }
    });
};

module.exports.search = function(req, res, next) {
    try {
        return User.find({ name: ID });
    } catch (err) {
        throw err;
    }
};

module.exports.isvalid = function(req, res, next) {
    User.count({ $or: [{ email: req.body.value }, { CPF: req.body.value }] },
        function(err, count) {
            if (count > 0) {
                res.status(404).send("Encontrado!");
            } else {
                res.status(200).send("Nao Encontrado!");
            }
        }
    );
};

module.exports.get = function(req, res, next) {
    moip.customer
        .getOne(req.Customer)
        .then((response) => {
            //console.log(response)
            res.status(200).send(response.body);
        })
        .catch((err) => {
            res.status(500).send("Nao Encontrado!");
        });
};

module.exports.verify = function(req, res, next) {
    if (req.body.token) {
        console.log(req.body.token);
        User.findOne({ token: req.body.token }).exec(function(err, user) {
            if (!user) return res.status(500).send({});
            if (user) {
                user.ative = true;
                user.token = "";
                user.save();
                res.status(200).send({});
            } else {
                res.status(500).send({});
            }
        });
    } else {
        res.status(500).send({});
    }
};

module.exports.reset = function(req, res, next) {
    if (!req.body.token)
        return res.status(401).send({ auth: false, message: "No token provided." });
    jwt.verify(req.body.token, process.env.SECRET_RESET, function(err, decoded) {
        if (err)
            return res.status(500).send({
                auth: false,
                message: "Failed to authenticate token.",
            });
        console.log(decoded);
        console.log("new pass " + req.body.pass);
        User.findOne({ _id: decoded.id }).exec(function(err, user) {
            if (!user) return res.status(500).send({});
            if (user) {
                user.pass = req.body.pass;
                user.save();
                res.status(200).send({});
            } else {
                res.status(500).send({});
            }
        });
    });
};

module.exports.reset_email = function(req, res, next) {
    User.findOne({ token: decoded.id }).exec(function(err, user) {
        if (!user) return res.status(500).send({});
        if (user) {
            user.pass = req.body.pass;
            user.save();
            const Email = require("../Config/Email/EmailConfig");
            const Template = require("../Config/Email/EmailReset");

            var token = jwt.sign({
                    id: user._id,
                    Name: user.name,
                    Code: user.wire_id,
                    Store: user.store != null ? user.store._id : null,
                    Store_name: user.store != null ? user.store.name : null,
                    Store_all: user.store != null ? user.store : null,
                },
                process.env.SECRET, {
                    expiresIn: 3600, // 1 hr para o token expirar
                }
            );
            Email.sendemail(req.body.Email, "Bem-vindo !", Template.email(user.name, token));
            res.status(200).send({});
        } else {
            res.status(500).send({});
        }
    });

};