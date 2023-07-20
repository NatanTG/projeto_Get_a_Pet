import Pet from '../models/Pet.js';
import getToken from '../helpers/get-token.js';
import ObjectId, { isValidObjectId } from 'mongoose';
import getUserByToken from '../helpers/get-user-by-token.js';

export default class PetController {
    static async create(req, res) {
        const { name, age, weight, color } = req.body
        const images = req.files
        const available = true

        // validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        }
        if (!age) {
            res.status(422).json({ message: 'A idade é obrigatório!' })
            return
        }
        if (!weight) {
            res.status(422).json({ message: 'O peso é obrigatório!' })
            return
        }
        if (!color) {
            res.status(422).json({ message: 'A cor é obrigatório!' })
            return
        }
        if (images.length === 0) {
            res.status(422).json({ message: 'A imagem é obrigatória!' })
            return
        }

        // get user
        const token = getToken(req)
        const user = await getUserByToken(token)


        //create pet
        // create pet
        const pet = new Pet({
            name: name,
            age: age,
            weight: weight,
            color: color,
            available: available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        })

        images.map((image) => {
            pet.image.push(image.filename)
        })

        try {
            const newPet = await pet.save()

            res.status(201).json({
                message: 'Pet cadastrado com sucesso!',
                newPet: newPet,
            })
        } catch (error) {
            res.status(500).json({ message: error })
            return
        }
    }

    static async getAll(req, res) {
        const pets = await Pet.find().sort({ createdAt: -1 })

        res.status(200).json({
            pets: pets,
        })

    }

    static async getAllUserPets(req, res) {
        //get user from token

        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'user._id': user._id }).sort({ createdAt: 1 })

        res.status(200).json({ pets })
    }

    static async getAllUserAdoptions(req, res) {
        //get user from token
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'adopter._id': user._id }).sort({ createdAt: 1 })

        res.status(200).json({
            pets,
        })
    }

    static async getPetById(req, res) {
        const id = req.params.id

        // check if id is valid
        if (!isValidObjectId(id)) {
            res.status(422).json({ message: 'ID inválido!' })
            return
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        res.status(200).json({
            pet: pet,
        })
    }

    static async removePetById(req, res) {
        const id = req.params.id

        // check if id is valid
        if (!isValidObjectId(id)) {
            res.status(422).json({ message: 'ID inválido!' })
            return
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        // check if user is the owner of the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(401).json({ message: 'Você não tem permissão para remover este pet!' })
            return
        }

        try {
            await Pet.deleteOne({ _id: id })

            res.status(200).json({ message: 'Pet removido com sucesso!' })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    static async updatePet(req, res) {
        const id = req.params.id

        const { name, age, weight, color, available } = req.body
        const images = req.files


        const updatedData = {}

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        // check if user is the owner of the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(401).json({ message: 'Você não tem permissão para remover este pet!' })
            return
        }

        // validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        } else { updatedData.name = name }
        if (!age) {
            res.status(422).json({ message: 'A idade é obrigatório!' })
            return
        } else { updatedData.age = age }
        if (!weight) {
            res.status(422).json({ message: 'O peso é obrigatório!' })
            return
        } else { updatedData.weight = weight }
        if (!color) {
            res.status(422).json({ message: 'A cor é obrigatório!' })
            return
        } else { updatedData.color = color }
        if (images.length === 0) {
            res.status(422).json({ message: 'A imagem é obrigatória!' })
            return
        } else {
            updatedData.images = []
            images.map((image) => {
                updatedData.images.push(image.filename)
            })
        }

        await Pet.updateOne({ _id: id }, updatedData)

        res.status(200).json({ message: 'Pet atualizado com sucesso!' })
    }

    static async schedule(req, res) {
        const id = req.params.id

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        // check if user is the owner of the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.equals(user.id)) {
            res.status(401).json({ message: 'Você não pode agendar uma visita com seu próprio Pet!' })
            return
        }

        //check if user has already scheduled

        if (pet.adopter) {
            if (pet.adopter._id.equals(user._id)) {
                res.status(401).json({ message: 'Este pet já foi agendado por você!' })
                return
            }
        }
        //add user to pet
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image,
        }

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({ message: `Pet agendado com sucesso! Entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}` })

    }

    // conclude a pet adoption
    static async concludeAdoption(req, res) {
        const id = req.params.id

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(401).json({ message: 'Esse pet já foi adotado!' })
            return
        }
        pet.available = false

        if (!pet.available) {
            res.status(401).json({ message: 'Esse pet já foi adotado!' })
            return
        }
        await Pet.findByIdAndUpdate(pet._id, pet)

        res.status(200).json({
            pet: pet,
            message: `Parabéns! O ciclo de adoção foi finalizado com sucesso!`,
        })
    }
}
