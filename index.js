require("dotenv").config();

const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const { 
    addProduct, 
    updateField, 
    updateProduct, 
    getProductDetail, 
    listProducts, 
    deleteProduct
} = require('./controllers/products')

const {
    register,
    login
} = require('./controllers/users')

// import { addProduct } from './controllers/products'

// middleware: código que ejecuta express antes del callback de cada petición
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('public'));

app.use((req, res, next) => {
    console.log(`[${new Date()}] ${req.method}  ${req.url}`)
    next()
})

const isAuthenticated = (req, res, next) => {
    console.log(req)
    const token = req.headers.authorization
    const jwt = require("jsonwebtoken");

    try {
        const userInfo = jwt.verify(token, process.env.SECRET)
        req.appInfo = {
            id: userInfo.id
        }
        console.log(userInfo)
        next()
    } catch {
        console.log('Error verificando token')
        res.sendStatus(401)
    }
}

const isOwner = (req, res, next) => {
    next()
}

app.post('/product', isAuthenticated, addProduct)

app.patch('/product/:id',isAuthenticated, isOwner, updateField)

app.put('/product/:id', isAuthenticated, isOwner, updateProduct)

// devuelvo toda la información que tengo de ese ID
app.get('/product/:id', getProductDetail)

// devuelvo una lista con información resumida de cada producto
app.get('/product', listProducts)

app.delete('/product/:id', isAuthenticated, isOwner, deleteProduct)


app.post('/register', register)

app.post('/login', login)


app.listen(4444)
