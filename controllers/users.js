require("dotenv").config();

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const db = require('../db')

const register = async (req, res) => {

    // 1) comprobar que nos pasan user y password
    //    como es un post, estarán en el body
    const {username, password} = req.body

    if (!username || !password) {
        res.sendStatus(400)
        return
    }

    const connection = await db.getConnection()

    // 2) comprobar si el usuario que nos pasan ya existe (409)
    const sqlGetUser = `select * from users where username="${username}"`

    const users = await connection.query(sqlGetUser)

    // si no existe en la base de datos la longitud del array será cero
    if (users[0].length !== 0) {
        res.sendStatus(409)
        connection.release()
        return
    }

    // 3) cifrar la password con bcrypt
    const hiddenPassword = await bcrypt.hash(password, 10)

    // 4) almacenamos
    const sqlInsertUser = `insert into users (username, password) values ("${username}", "${hiddenPassword}")`
    await connection.query(sqlInsertUser)

    connection.release()
    res.send('ok')
}

const login = async (req, res) => {
    // 1) comprobamos que nos pasan login y password
    const {username, password} = req.body

    if (!username || !password) {
        res.sendStatus(400)
        return
    }
    const connection = await db.getConnection()

    // 2) obtenemos el usuario de la bbdd
    const sqlGetUser = `select * from users where username="${username}"`

    const users = await connection.query(sqlGetUser)

    // compruebo si está en la bbdd ese usuario
    if (users[0].length === 0) {
        res.sendStatus(403)
        connection.release()
        return
    }

    // 3) comprobar que la password es correcta
    // ojo! no se comparan las passwords en claro, si no las cifradas (con bcrypt)
    // users[0] -> lista de usuarios
    // users[0][0] -> es el primer, y único, usuario con este username
    const passwordsAreEqual = await bcrypt.compare(password, users[0][0].password)

    if (!passwordsAreEqual) {
        res.sendStatus(403)
        connection.release()
        return
    }  

    // 4) generar el token
    const userInfo = {
        id: users[0][0].id
    }

    var token = jwt.sign(userInfo, process.env.SECRET,{
        expiresIn: "30d",
    });

    res.send({
        data: token
    })
}

module.exports = {
    login,
    register
}