const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Restaurante = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    contato: {
        type: String,
        require: true
    },
    endereco: {
        type: String,
        require: true
    },
    vaga: {
        type: Number,
        require: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("restaurantes", Restaurante)