const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "fashion_assistant",
});

pool.getConnection()
  .then(() => console.log("Database works !!!"))
  .catch(err => console.error("Database error:", err));

module.exports = pool;
