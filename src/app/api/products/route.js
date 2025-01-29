
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();



const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function GET(req) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM products', (err, results) => {
      if (err) {
        console.error("Error fetching products:", err);
        reject(new Response("Error fetching products", { status: 500 }));
      } else {
        resolve(new Response(JSON.stringify(results), { status: 200 }));
      }
    });
  });
}
