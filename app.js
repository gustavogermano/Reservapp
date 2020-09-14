// Carregando MÓDULOS
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Restaurante')
    const Restaurante = mongoose.model("restaurantes")
    require('./models/Categoria')
    const Categoria = mongoose.model("categorias")
    const usuarios = require('./routes/usuario')
    const passport = require('passport')
    require('./config/auth')(passport)
    
// Configurações    
    //Sessão
    app.use(session({
        secret: "senadofederal",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    
    //Middleware variaveis globais
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg") 
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next()
    })
    //Body-parses
        app.use(bodyParser.urlencoded({extended: true}))    //app.use -> para criação de middlewares
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // Mongoose    
        mongoose.Promise = global.Promise
        mongoose.connect('mongodb://localhost/reservapp').then(() => {
            console.log("Servidor do mongo Reservapp rodando!")
        }).catch((err) => {
            console.log("Ocorreu um erro com o servidor: "+err)
        })
    //Public
    app.use(express.static(path.join(__dirname, 'public')))
    app.use((req, re, next) => {
        console.log("Ola eu sou um Midedleware!!")
        next()
    })


// Rotas
    app.get('/', (req, res) => {
        Restaurante.find().lean().populate("categoria").sort({data: "desc"}).then((restaurantes) => {
            res.render("index", {restaurantes: restaurantes})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
        
    })
//RESTAURANTE PAGINA
    app.get('/restaurante/:slug', (req, res) => {
        Restaurante.findOne({slug: req.params.slug}).lean().populate("categoria").then((restaurante) => {
            if(restaurante){
                res.render("restaurante/index", {restaurante: restaurante})
            }else{
                req.flash("error_msg", "Esse restaurante não existe.")
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect('/')
        })
    })

//CATEGORIA LISTAGEM
    app.get('/categorias', (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render('categoria/index', {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar as catregorias")
            res.redirect("/")
        })
    })

    app.get('/categorias/:slug', (req, res ) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                
                Restaurante.find({categoria: categoria._id}).lean().then((restaurantes) => {
                    res.render("categoria/restaurantes", {restaurantes: restaurantes, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os restaurantes.")
                    res.redirect('/')
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")
        })
    })
//ERRO 404    
    app.get("/404", (req, res) => {
        res.send('Erro 404!')
    })
    

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)

//Outros
const Port = 8081
app.listen(Port, () => {
    console.log("Servidor do Reservapp rodando!")
})