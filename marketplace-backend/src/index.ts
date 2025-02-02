// filepath: src/index.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import multer from 'multer';

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '4545',
    database: 'marketplace'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.post('/users', (req: Request, res: Response) => {
    const { username, googleaccount, password } = req.body;
    const query = 'INSERT INTO users (username, googleaccount, password) VALUES (?, ?, ?)';
    db.query(query, [username, googleaccount, password], (err, results: mysql.ResultSetHeader) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: results.insertId });
    });
});

// Product routes
app.post('/products', (req: Request, res: Response) => {
    const { name, price, description, image, location } = req.body;
    const query = 'INSERT INTO products (name, price, description, image, location) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, price, description, image, location], (err, results: mysql.ResultSetHeader) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: results.insertId });
    });
});

app.get('/products', (req: Request, res: Response) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
});

app.get('/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [id], (err, results: mysql.RowDataPacket[]) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results[0]);
    });
});