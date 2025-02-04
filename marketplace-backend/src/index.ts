// filepath: src/index.ts
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql, { QueryResult } from 'mysql2';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3001;
const secretKey = 'your_secret_key';

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000', // Your Next.js frontend URL
    methods: ['GET', 'POST'],
  }));

  
  
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
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.get('/api/user', (req: Request, res: Response): void => {
    // Extract the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Authorization header missing');
        return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send('Invalid or expired token');
            return;
        }

        // Extract user ID from the token
        const { id } = decoded as { id: number };

        // Query user data from the database
        const query = 'SELECT id, username, googleaccount, location FROM users WHERE id = ?';
        db.query(query, [id], (err, results: mysql.RowDataPacket[]) => {
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


app.get('/api/products', (req: Request, res: Response) => {
    // Extract the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Authorization header missing');
        return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send('Invalid or expired token');
            return;
        }

        // Extract user ID from the token
        const { id } = decoded as { id: number };

        // Query products based on user ID (if needed)
        const query = 'SELECT * FROM products WHERE user_id = ?';
        db.query(query, [id], (err, results: mysql.RowDataPacket[]) => {
            if (err) {
                console.error('Error fetching products:', err);
                return res.status(500).send(err);
            }
            console.log('Query Results:', results); 
            if (results.length === 0) {
                res.status(404).send('No products found for the user');
                return;
            }
            res.status(200).json(results);  // Return the products belonging to the authenticated user
        });
    });
});



app.get('/api/productdetail/:name', (req: Request, res: Response): void => {
    // Extract the product name from the route parameter
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);
    // Extract the token from the request header
    
    
  
      // SQL query to join the products with user info,
      // ensuring that only the owner of the product can view its details.
      const query = `
        SELECT 
          products.*, 
          users.username 
        FROM products 
        JOIN users ON products.user_id = users.id 
        WHERE TRIM(LOWER(products.name)) = LOWER(?)`;
  
      db.query(query, [decodedName], (err, results: mysql.RowDataPacket[]) => {
        console.log('Searching for product with name:', name);
        if (err) {
          console.error('Error fetching product details:', err);
           res.status(500).send('Database error');
           return;
        }
        if (results.length === 0) {
          res.status(404).send('Product not found or access unauthorized');
          return;
        }
        // Return the first result (assuming names are unique per user)
        res.status(200).json(results[0]);
      });
    });


// In your backend (e.g., Express.js)
app.get('/api/check-username/:username', (req, res) => {
    const { username } = req.params;
  
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        console.error('Error checking username:', err);
        return res.status(500).send('Database error');
      }
      
      if (results.length > 0) {
        // Username exists
        return res.status(409).send('Username already taken');
      }
      
      // Username is available
      return res.status(200).send('Username available');
    });
  });
  

app.post('/register', async (req: Request, res: Response) => {
    console.log(req.body);
    const { username, googleaccount, password, location } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, googleaccount, password, location) VALUES (?, ?, ?, ?)';
    db.query(query, [username, googleaccount, hashedPassword, location], (err, results) => {
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
        res.status(200).send({ token, username: user.username });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.post('/users', (req: Request, res: Response) => {
    const { username, googleaccount, password, location } = req.body;
    const query = 'INSERT INTO users (username, googleaccount, password, location) VALUES (?, ?, ?, ?)';
    db.query(query, [username, googleaccount, password, location], (err, results: mysql.ResultSetHeader) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: results.insertId });
    });
});




// Product routes
app.post('/products', upload.single('image'), (req: Request, res: Response): void => {
    const { name, price, description, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Extract the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Authorization header missing');
        return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send('Invalid or expired token');
            return;
        }

        // Extract user ID from the token
        const { id } = decoded as { id: number };

        // Insert the product with the user ID
        const query = 'INSERT INTO products (name, price, description, image, location, user_id) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [name, price, description, image, location, id], (err, results: mysql.ResultSetHeader) => {
            if (err) {
                console.error('Error inserting product:', err);
                res.status(500).send(err);
                return;
            }
            res.status(201).send({ id: results.insertId });
        });
    });
});


app.get('/products', (req: Request, res: Response) => {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
});




