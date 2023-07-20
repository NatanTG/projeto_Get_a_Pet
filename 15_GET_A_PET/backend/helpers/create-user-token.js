import jwt from 'jsonwebtoken';

const createUserToken = async (user, req, res) => {

    //create token
    const token = jwt.sign(
        {
            name: user.name,
            id: user._id
        }, "nossosecret",)

    //return token
    res.status(200).json({
        message: 'Usuário logado com sucesso!',
        token: token,
        userId: user._id,
    })

}

export default createUserToken;