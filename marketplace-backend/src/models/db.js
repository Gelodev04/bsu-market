// src/models/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '4545',
  database: 'marketplace_db',
});

module.exports = pool.promise();