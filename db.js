const mysql = require("mysql");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "harvest",
  port: 3306,
  insecureAuth: true,
});

console.log("connected to database");
module.exports = { pool };
