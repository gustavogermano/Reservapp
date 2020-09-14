const express = require('express')
const router = express.Router()     //Para criar rotas em arquivos separados
const mongoose = require('mongoose')
require('../models/Categoria')      // ('../) ele volta um diretorio
const Categoria = mongoose.model('categorias') 
require('../models/Restaurante')
const Restaurante = mongoose.model('restaurantes')
const {eAdmin} = require('../helpers/eAdmin')


router.get('/', (req,res) => {  //O HOME
    res.render('admin/index')
})


// CATEGORIAS
router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias, tente novamente!")
        res.redirect('/admin')
    })
    
})
//CATEGORIAS ADD
router.get('/categorias/add', eAdmin, (req, res) => {                          //ADICIONAR CATEGORIAS
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => { //erro talvez
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({text: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome de categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar categoria, tente novamente!")
            res.redirect('/admin')
        }) 
    }
})
//CATEGORIAS EDIT
router.get('/categorias/edit/:id', eAdmin, (req, res) => {                  //EDITAR CATEGORIAS GET
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe.")
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/edit', eAdmin, (req, res) => {                          //EDITAR CATEGORIAS POST
    
    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        
        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao editar categoria!")
            res.redirect('/admin/categorias') 
        })

    }).catch((err) => {
        req.flash("error_msg", "Falha ao editar a categoria!")
        res.redirect('/admin/categorias')
    })
}) 
//CATEGORIAS DELETAR
router.post('/categorias/deletar', eAdmin, (req, res) => {                      //DELETAR CATEGORIAS
    Categoria.remove({_id: req.body.id}).then(() =>{
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível deletar a categoria!")
        res.redirect('/admin/categorias')
    })
})
//RESTAURANTES
router.get("/restaurantes", eAdmin, (req, res) => {                         //LISTAGEM DOS RESTAURANTES
    
    Restaurante.find().lean().populate("categoria").sort({data:"desc"}).then((restaurantes) => {
        res.render('admin/restaurantes', {restaurantes: restaurantes})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os restaurantes!")
        res.redirect('/admin')
    })
    
})
//RESTAURANTES ADD
router.get('/restaurantes/add', eAdmin, (req, res) => {     //ADICIONAR RESTAURANTES
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addrestaurantes', {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário.")
        res.redirect('/admin')
    })
    
})
//RESTAURANTES ROTA NOVA
router.post('/restaurantes/nova', eAdmin, (req, res) => {

    var erros = []

    if(req.body.categoria == "0")
    {
        erros.push({texto: "Categoria selecionada inválida!"}) 
    }

    if(erros.length > 0){
        res.render('admin/addrestaurantes', {erros: erros})
    }else{
        const novoRestaurante = {
            nome: req.body.nome,
            slug: req.body.slug,
            descricao: req.body.descricao,
            contato: req.body.contato,
            endereco: req.body.endereco,
            vaga: req.body.vaga,
            categoria: req.body.categoria
        }

        new Restaurante(novoRestaurante).save().then(() => {                    //ERRO
            req.flash("success_msg", "Restaurante registrado com sucesso!")
            res.redirect('/admin/restaurantes')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o registro do restaurante, tente novamente!")
            res.redirect('/admin/restaurantes')
        })
    }

})
//RESTAURANTES EDITAR
router.get('/restaurantes/edit/:id', eAdmin, (req, res) => {                  //EDITAR RESTAURANTES GET
    Restaurante.findOne({_id: req.params.id}).lean().then((restaurante) => {
        
        Categoria.find().lean().then((categorias) => {
             res.render('admin/editrestaurantes', {categorias: categorias, restaurante: restaurante})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os restaurantes")
            res.redirect('/admin/restaurantes')
        })    
    }).catch((err) => {
        req.flash("error_msg", "Este restaurante não existe.")
        res.redirect("/admin/restaurantes")
    })
})

router.post('/restaurantes/edit', eAdmin, (req, res) => {                          //EDITAR RESTAURANTES POST
    
    Restaurante.findOne({_id: req.body.id}).then((restaurante) => {

        restaurante.nome = req.body.nome
        restaurante.slug = req.body.slug
        restaurante.descricao = req.body.descricao
        restaurante.contato = req.body.contato
        restaurante.endereco = req.body.endereco
        restaurante.vaga = req.body.vaga
        restaurante.categoria = req.body.categoria
        
        restaurante.save().then(() => {
            req.flash("success_msg", "Restaurante editado com sucesso!")
            res.redirect('/admin/restaurantes')
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Houve um erro interno ao editar restaurantes!")
            res.redirect('/admin/restaurantes') 
        })

    }).catch((err) => {
        req.flash("error_msg", "Falha ao editar o restaurante!")
        res.redirect('/admin/restaurantes')
    })
})
//RESTAURANTE DELETAR
router.post('/restaurantes/deletar', eAdmin, (req, res) => {                      //DELETAR CATEGORIAS
    Restaurante.remove({_id: req.body.id}).then(() =>{
        req.flash("success_msg", "Restaurante deletado com sucesso!")
        res.redirect('/admin/restaurantes')
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível deletar o restaurante!")
        res.redirect('/admin/restaurantes')
    })
})
module.exports = router
