"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// filepath: src/index.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mysql2_1 = __importDefault(require("mysql2"));
const app = (0, express_1.default)();
const port = 3001;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const db = mysql2_1.default.createConnection({
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
app.post('/users', (req, res) => {
    const { username, googleaccount, password } = req.body;
    const query = 'INSERT INTO users (username, googleaccount, password) VALUES (?, ?, ?)';
    db.query(query, [username, googleaccount, password], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: results.insertId });
    });
});
// Product routes
app.post('/products', (req, res) => {
    const { name, price, description, image, location } = req.body;
    const query = 'INSERT INTO products (name, price, description, image, location) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, price, description, image, location], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: results.insertId });
    });
});
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
});
app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results[0]);
    });
});
