const mysql = require('mysql')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  insecureAuth: true,
  connectionLimit: 100,
  queueLimit: 100,
  waitForConnections: true,
})

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err)
    return
  }
  console.log('Connected to the database')
  connection.release()
})

module.exports = { pool }
