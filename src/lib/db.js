import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'localhost', // Update with your database host
  user: 'root',      // Your MySQL username
  password: '4545',      // Your MySQL password
  database: 'bsumarket',
});

export default pool.promise(); // Using promise-based API for easy async/await handling
