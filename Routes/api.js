const express = require('express');

const fs = require("fs");
const jwt = require("jsonwebtoken");
var path = require("path");

var dir = path.join(__dirname, "Public");
console.log("diretorio :", dir)

require('dotenv').config({
    path: process.env.NODE_ENV === "test" ? ".env.testing" : ".env"
})


const router = express.Router();

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
    console.log('Time:', Date.now());
    next();
});

function Auth(req, res, next) {
    var token = req.headers["x-access-token"];
    if (!token)
        return res.status(401).send({ auth: false, message: "No token provided." });

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err)
            return res.status(500).send({
                auth: false,
                message: "Failed to authenticate token.",
            });
        req.id = decoded.id;
        req.userId = decoded.Name;
        req.Customer = decoded.Code;
        req.store = decoded.Store;
        req.store_name = decoded.Store_name;
        next();
    });
}

function Admin_Auth(req, res, next) {
    var token = req.headers["x-access-token"];
    if (!token)
        return res.status(401).send({ auth: false, message: "No token provided." });

    jwt.verify(token, process.env.SECRET_ADMIN, function (err, decoded) {
        if (err)
            return res.status(500).send({
                auth: false,
                message: "Failed to authenticate token.",
            });
        req.user = decoded.user;
        next();
    });
}

router.get("/auth", Auth, function (req, res, next) {
    res.status(200).send({ url: 'auth' });
});
// importa controlador 'apiController.js' da pasta: 
// Controllers
const userController = require("../Controllers/User_Controller");
const productController = require("../Controllers/Product_controller");
const ordersController = require("../Controllers/Orders_Controller");
const saqueController = require("../Controllers/Saque_Controller");
const storeController = require("../Controllers/Store_Controller");
//

//
router.post("/login", (req, res, next) => {
    console.log("/api/login");
    userController.authenticate(req.body.user, req.body.pwd, function (err, user) {
        if (user) {
            console.log("login user",user);
            id = user._id.toString();
            var token = jwt.sign({
                id: user._id,
                Name: user.name,
                Code: user.wire_id,
                Store: user.store != null ? user.store._id : null,
                Store_name: user.store != null ? user.store.name : null,
                Store_all: user.store != null ? user.store : null,
            },
                process.env.SECRET, {
                expiresIn: 43200, // 12 hrs para o token expirar
            }
            );
            res.status(200).send({
                auth: true,
                name: user.name,
                store_name: user.store != null ? user.store.name : null,
                token: token,
            });
        } else {
            res.status(500).send("Login inválido!");
        }
    });

});

router.post("/register", userController.add);
router.post("/register/isvalid", userController.isvalid);
router.get("/users", Auth, userController.get);

router.post("/reset/pass", userController.reset);
router.get("/reset", userController.reset_email);



router.post("/shipping", ordersController.shipping);
router.get("/order", Auth, ordersController.index);
router.post("/order", Auth, ordersController.create);
router.get("/order/client", Auth, ordersController.client);
router.get("/order/balance", Auth, saqueController.balance);
router.post("/update/store", Auth, storeController.update);
router.get("/get/store", Auth, storeController.get_store);
router.post("/get/order", Auth, ordersController.view);

router.post("/request", Auth, saqueController.request);
router.get("/balance/index", Auth, saqueController.index);


router.get("/Product", productController.index);
router.get("/Product/view/:id", productController.view);
router.post("/Product/search", productController.search);
router.post("/", ordersController.add);
router.get("/webhook", ordersController.webhook);
router.post("/isvalid", storeController.exist);
router.post("/verify", userController.verify);

router.get("/get/videos", function (req, res, next) {
    var videos = [];
    console.log(dir + "/videos/")
    
    fs.readdir("./public/videos/", (err, files) => {
        if (err) {
            throw err;
        }
        videos = files;
           // files.forEach(file => {
                console.log(files);
                res.status(200).send({ videos });
            //});
       
       
    });
});
router.get("/images", function (req, res, next) {
    var imagens = [];
    console.log(dir + "/images/")

    fs.readdir("./public/img/", (err, files) => {
        if (err) {
            throw err;
        }
        imagens = files;
        // files.forEach(file => {
        console.log(files);
        res.status(200).send({ imagens });
        //});


    });
    // working directory
    
});
router.get("/images/:name", function (req, res, next) {
    var imagens = [];
    console.log(dir + "/images/")

    fs.readdir("./public/img/", (err, files) => {
        if (err) {
            throw err;
        }
        imagens = files;
        // files.forEach(file => {
        console.log('/img/'+ files);
        res.status(200).send({ imagens });
        //});


    });

   
});




router.get("/admin/saque", Admin_Auth, saqueController.all);
router.post("/admin/saque/paid", Admin_Auth, saqueController.PAID);
router.post("/admin/saque/not_paid", Admin_Auth, saqueController.NOT_PAID);

module.exports = router;