const mongoose = require('mongoose');
const { MONGO_URI } = require('./DbUrl');

const configOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: false,
    useFindAndModify: false,
    useCreateIndex: true,
    useFindAndModify: false,

};

try {

    mongoose.connect(MONGO_URI, configOptions)
    .then((db) => {
        console.log("MongoDB connected...");
        db.close;
    }).catch(err => console.log(err));
} catch (error) {
    console.log("Erro ao conectar ao banco de dados.", error.reason);
}


mongoose.Promise = global.Promise;


module.exports = mongoose;