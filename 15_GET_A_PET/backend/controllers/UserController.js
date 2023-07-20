import User from "../models/User.js";
import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//helpers
import createUserToken from '../helpers/create-user-token.js';
import getToken from '../helpers/get-token.js';
import getUserByToken from '../helpers/get-user-by-token.js';

export default class UserController {
    static async register(req, res) {
        const { name, email, phone, password, confirmpassword } = req.body
        const schema = Joi.object({
            name: Joi.string().required().label('Nome'),
            email: Joi.string().required().label('Email'),
            phone: Joi.string().required().label('Telefone'),
            password: Joi.string().required().label('Senha'),
            confirmpassword: Joi.string().valid(Joi.ref('password')).required().label('Confirmação de Senha').messages({
                'any.only': '{{#label}} não é a mesma que a senha',
            }),
        });

        try {
            await schema.validateAsync(req.body);
            // A validação passou, continue com o processamento
            // ...
        } catch (error) {
            // A validação falhou, retorne a mensagem de erro
            res.status(422).json({ message: error.details[0].message });
            return
        }

        //check if user exists
        const userExists = await User.findOne({ email: email })

        if (userExists) {
            res.status(422).json({ message: 'Por favor, utilize outro e-mail!' })
            return
        }

        //create password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // create user
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash,
        })

        try {
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    static async login(req, res) {
        const email = req.body.email
        const password = req.body.password

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório!' })
            return
        }

        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatória!' })
            return
        }

        // check if user exists
        const user = await User.findOne({ email: email })

        if (!user) {
            res.status(422).json({ message: 'Email ou senha inválida' })
            return
        }

        // check if password match
        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            res.status(422).json({ message: 'Email ou senha inválida' })
            return
        }

        await createUserToken(user, req, res)
    }

    static async checkUser(req, res) {
        let currentUser

        // console.log(req.headers.authorization)

        if (req.headers.authorization) {
            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret')

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined
        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {
        const id = req.params.id

        const user = await User.findById(id).select('-password')

        if (!user) {
            res.status(422).json({ message: 'Usuário não encontrado!' })
            return
        }

        res.status(200).json({ user })
    }

    static async editUser(req, res) {
        const token = getToken(req)
        const user = await getUserByToken(token)

        const { name, email, phone, password, confirmpassword } = req.body

        if (req.file) {
            user.image = req.file.filename
        }

        // validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        }

        user.name = name

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório!' })
            return
        }

        // check if user exists
        const userExists = await User.findOne({ email: email })

        if (user.email !== email && userExists) {
            res.status(422).json({ message: 'Por favor, utilize outro e-mail!' })
            return
        }

        user.email = email

        if (!phone) {
            res.status(422).json({ message: 'O telefone é obrigatório!' })
            return
        }

        user.phone = phone

        // check if password match
        if (password != confirmpassword) {
            res.status(422).json({ error: 'As senhas não conferem.' })
            return

            // change password
        } else if (password == confirmpassword && password != null) {
            // creating password
            const salt = await bcrypt.genSalt(12)
            const reqPassword = req.body.password

            const passwordHash = await bcrypt.hash(reqPassword, salt)

            user.password = passwordHash
        }

        try {
            // returns updated data
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $set: user },
                { new: true },
            )
            res.json({
                message: 'Usuário atualizado com sucesso!',
                data: updatedUser,
            })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }


}



