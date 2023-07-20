import jwt from 'jsonwebtoken';
import getToken from './get-token.js';

//middleware to check if token is valid
const checkToken = async (req, res, next) => {

    if (!req.headers.authorization) { return res.status(401).json({ error: "Acesso negado!" }) };

    const token = getToken(req)

    if (!token) { return res.status(401).json({ error: "Acesso negado!" }) };

    try {
        const verified = jwt.verify(token, 'nossosecret');
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(400).json({ error: "Token inválido!" })
    }

}

export default checkToken;