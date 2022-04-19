require("dotenv").config();

const db = require('../db')

/**
 * {
 *   id: <number>
 *    name: <string>
 *    price: <number>
 *    category: car |fashion|sports
 * }
 * 
 */
let products = []

const updateField = (req, res) => {
    const { name, price, category } = req.body

    const product = products.find(product => product.id === parseInt(req.params.id))

    if (!product) {
        res.sendStatus(404)
        return
    }

    if (name) {
        product.name = name
    }

    if (price) {
        product.price = parseInt(price)
    }

    if (category) {
        product.category = category
    }

    res.sendStatus(200)
}

const addProduct = async (req, res) => {

    const { name, price, category, description } = req.body

    if ( !name || !price || !category || !description) {
        res.sendStatus(400)
        return
    }

    // TODO: comprobar que la categoria es alguna de las permitidas
    const connection = await db.getConnection()
    
    connection.query(`
        insert into products (name, description, price, category) 
        values ("${name}","${description}", ${price}, "${category}")
    `)

    res.sendStatus(200)
}

const updateProduct = (req, res) => {
    const { name, price, category } = req.body

    if (!name || !price || !category) {
        res.sendStatus(400)
        return
    }

    const product = products.find(product => product.id === parseInt(req.params.id))

    if (!product) {
        res.sendStatus(404)
        return
    }

    product.name = name
    product.price = parseInt(price)
    product.category = category

    // sql(update.... where id = `${id}`)
    res.sendStatus(200)
}

const getProductDetail = (req, res) => {
    const buscaPorId = product => product.id === parseInt(req.params.id)

    const product = products.find(buscaPorId)

    if (!product) {
        res.sendStatus(404)
        return
    }

    res.send(product)
}

const listProducts = async (req, res) => {
    // http://localhost:4444/product?max_price=2000&min_price=1000
    // http://localhost:4444/product?max_price=2000
    // http://localhost:4444/product?min_price=1000
    // http://localhost:4444/product
    const { max_price, min_price } = req.query

    const connection = await db.getConnection()
    
    let sql = 'select id, name, price, category from products'
    let filters = []
    
    if (min_price) {
        filters.push(`price >= ${min_price}`)
    }

    if (max_price) {
        filters.push(`price <= ${max_price}`)
    }

    // si la longitud de filters es distinto de cero
    // significa que nos pasaron al menos un filtro, min_price o max_price,
    // y por tanto tenemos que añadir el where a la sentencia sql
    if (filters.length !== 0) {
        sql = `${sql} where ${filters.join(' and ')}`
    }

    const listOfProducts = await connection.query(sql)

    let filteredProducts = listOfProducts[0]

    res.send(filteredProducts)
}

const deleteProduct = async (req, res) => {

    const connection = await db.getConnection()

    // vamos a comprobar si ese producto existe. En caso de que, 
    // devolveremos un 404
    const sqlGetProduct = `select * from products where id=${req.params.id}`

    const products = await connection.query(sqlGetProduct)

    if (products[0].length === 0) {
        res.sendStatus(404)
        return
    }

    let sql = `delete from products where id=${req.params.id}`

    connection.query(sql)
    
    // delete from Product where id=2
    res.sendStatus(200)
}

module.exports = {
    addProduct, 
    deleteProduct, 
    getProductDetail,
    listProducts,
    updateField,
    updateProduct
}







