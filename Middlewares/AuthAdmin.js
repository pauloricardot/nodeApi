const jwt = require("jsonwebtoken");

module.exports = (req, res, next) =>{
   
    const authHeaders  = req.headers.authorization;

    if(!authHeaders) return res.status(401).send({err: 'no token ',auth: false});

    const parts = authHeaders.split(' ');
    if(!parts.length ===2) return res.status(401).send({error:'token errro no split',auth: false});

    const [ scheme, token] = parts;
   
    if(!/^Bearer$/i.test(scheme)) return res.status(401).send({error:'token mau formado',auth: false});

    jwt.verify(token, process.env.SECRET_ADMIN, function(err, decoded) {
        if (err)
            return res.status(401).send({
                auth: false,
                message: "token inválido.",
            });
        req.user = decoded.user;
        next();
    });
}