"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// filepath: src/index.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mysql2_1 = __importDefault(require("mysql2"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const port = 3001;
const secretKey = 'your_secret_key';
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
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
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'dist/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
app.get('/api/user', (req, res) => {
    // Extract the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Authorization header missing');
        return;
    }
    const token = authHeader.split(' ')[1]; // Bearer <token>
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send('Invalid or expired token');
            return;
        }
        // Extract user ID from the token
        const { id } = decoded;
        // Query user data from the database
        const query = 'SELECT id, username, googleaccount, location FROM users WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error fetching user data:', err);
                res.status(500).send(err);
                return;
            }
            if (results.length === 0) {
                res.status(404).send('User not found');
                return;
            }
            res.status(200).json(results[0]);
        });
    });
});
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { username, googleaccount, password, location } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const query = 'INSERT INTO users (username, googleaccount, password, location) VALUES (?, ?, ?, ?)';
    db.query(query, [username, googleaccount, hashedPassword, location], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).send(err);
        }
        const result = results;
        res.status(201).send({ id: result.insertId });
    });
}));
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).send(err);
        }
        const users = results;
        if (users.length === 0) {
            return res.status(401).send('Invalid username or password');
        }
        const user = users[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid username or password');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
        res.status(200).send({ token, username: user.username });
    }));
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.post('/users', (req, res) => {
    const { username, googleaccount, password, location } = req.body;
    const query = 'INSERT INTO users (username, googleaccount, password, location) VALUES (?, ?, ?, ?)';
    db.query(query, [username, googleaccount, password, location], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: results.insertId });
    });
});
// Product routes
app.post('/products', upload.single('image'), (req, res) => {
    const { name, price, description, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const query = 'INSERT INTO products (name, price, description, image, location) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, price, description, image, location], (err, results) => {
        if (err) {
            console.error('Error inserting product:', err);
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
