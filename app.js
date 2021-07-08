const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')

const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
var path = require("path");

const app = express();


var port = process.env.PORT || 3000;

var dir = path.join(__dirname, "Public");
console.log("diretorio :", dir)


require('dotenv').config({
    path: process.env.NODE_ENV === "test" ? ".prod.env" : ".env"
});



// este middleware deve estar acima das routes-handlers!
app.use((req, res, next) => {
    console.log("acessou o middleware");

    res.header(
        "Access-Control-Allow-Methods",
        "GET,PUT,POST,DELETE,PATCH,OPTIONS"
    );
    res.header("Access-Control-Allow-Origin", "*");
   // res.header('Access-Control-Allow-Origin', 'same-origin')
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, x-access-token"
    );

   // app.options('*', cors()); // include before other routes
    next();
})


// error handling middleware
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: "Something failed!" });

    } else {
        next(err);
    }
}
app.use(clientErrorHandler);

// antes -> app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(express.static(dir));
app.use(helmet());
app.use(cookieParser());




// ‘END POINT INVÁLIDO!’
app.get('/', function (req, res, next) {
    res.send({
        success: true,
        message: 'Seja bem-vindo(a) a API Node.js + MongoDB!',
        version: '1.0.0',
       
    });;
});


// todo o url começado por ‘/api’ chama as rotas em ‘./routes/api’
const routes = require('./Routes/api');
app.use('/api', routes);

app.listen(process.env.port || port, () => {
    console.log('Servidor em executando na porta: ' + port);
});
