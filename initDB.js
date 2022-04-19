require("dotenv").config();

const { getConnection } = require("./db");

let connection;

async function main() {
  try {
    // Conseguir conexión a la base de datos
    connection = await getConnection();

    // Borrar las tablas si existen (diary, diary_votes)
    console.log("Borrando tablas");
    await connection.query("DROP TABLE IF EXISTS products");
    await connection.query("DROP TABLE IF EXISTS users");

    // Crear las tablas de nuevo
    console.log("Creando tablas");

    await connection.query(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(300),
        price INTEGER UNSIGNED,
        category CHAR(50)
      );
    `);

    await connection.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(300) NOT NULL
      );
    `);


    // Meter datos de prueba en las tablas

  } catch (error) {
    console.error(error);
  } finally {
    console.log("Todo hecho, liberando conexión");
    if (connection) connection.release();
    process.exit();
  }
}

main();
