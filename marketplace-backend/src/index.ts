// filepath: src/index.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3001;
const secretKey = 'your_secret_key';

app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'dist/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.post('/register', async (req: Request, res: Response) => {
    const { username, googleaccount, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, googleaccount, password) VALUES (?, ?, ?)';
    db.query(query, [username, googleaccount, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).send(err);
        }
        const result = results as mysql.ResultSetHeader;
        res.status(201).send({ id: result.insertId });
    });
});

app.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).send(err);
        }
        const users = results as mysql.RowDataPacket[];
        if (users.length === 0) {
            return res.status(401).send('Invalid username or password');
        }
        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid username or password');
        }
        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
        res.status(200).send({ token });
    });
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
app.post('/products', upload.single('image'), (req: Request, res: Response) => {
    const { name, price, description, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const query = 'INSERT INTO products (name, price, description, image, location) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, price, description, image, location], (err, results: mysql.ResultSetHeader) => {
        if (err) {
            console.error('Error inserting product:', err);
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