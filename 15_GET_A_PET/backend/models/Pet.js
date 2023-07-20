import mongoose from "mongoose";
import { Schema } from "mongoose";

const Pet = mongoose.model(
    'Pet',
    new Schema({
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true
        },
        weight: {
            type: Number,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        image: {
            type: Array,
        },
        available: {
            type: Boolean,
        },
        user: Object,
        adopter: Object,
    },
        { timestamps: true },
    ),
)


export default Pet;