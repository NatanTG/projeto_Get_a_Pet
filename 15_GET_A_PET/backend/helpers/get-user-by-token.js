import jwt from 'jsonwebtoken'
import User from '../models/User.js'

//get user by jwt token
const getUserByToken = async (token, req, res) => {
    if (!token) {
        return res.status(401).json({ error: "Acesso negado!" })

    };

    const decoded = jwt.verify(token, 'nossosecret')

    const userId = decoded.id

    const user = await User.findById({ _id: userId })

    return user

}

export default getUserByToken