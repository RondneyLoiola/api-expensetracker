import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false // Não obrigatório para login com Google
    },
    googleUid: {
        type: String,
        unique: true,
        sparse: true // Permite que seja único apenas quando existe
    },
    photoURL: {
        type: String,
        required: false
    }
}, {
    timestamps: true
})

export const User = mongoose.model('User', userSchema);