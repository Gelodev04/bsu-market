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
const secretKey = "your_secret_key";
const port = 3001;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000", // Allow HTTP for local development
        "https://localhost:3000", // Allow HTTPS for testing with secure connection
    ],
    methods: ["GET", "POST", "DELETE"],
}));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
const db = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "4545",
    database: "marketplace"
});
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.stack);
        return;
    }
    console.log("Connected to database.");
});
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
app.delete("/api/follow/:username", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(" ")[1];
    jsonwebtoken_1.default.verify(token, secretKey, (verifyErr, decoded) => {
        if (verifyErr) {
            res.status(403).send("Invalid or expired token");
            return;
        }
        const follower_id = decoded.id;
        const username_to_unfollow = req.params.username;
        // Get the ID of the user being unfollowed
        db.query("SELECT id FROM users WHERE username = ?", [username_to_unfollow], (err, results) => {
            if (err) {
                console.error('Error checking user:', err);
                res.status(500).send("Error unfollowing the user");
                return;
            }
            if (!results.length) {
                res.status(404).send("User not found");
                return;
            }
            const following_id = results[0].id;
            // Begin transaction
            db.beginTransaction((transErr) => {
                if (transErr) {
                    console.error('Transaction error:', transErr);
                    res.status(500).send("Error unfollowing user");
                    return;
                }
                // Delete the follow relationship
                db.query("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", [follower_id, following_id], (deleteErr, deleteResult) => {
                    if (deleteErr) {
                        return db.rollback(() => {
                            console.error('Delete error:', deleteErr);
                            res.status(500).send("Error unfollowing user");
                        });
                    }
                    if (deleteResult.affectedRows === 0) {
                        return db.rollback(() => {
                            res.status(400).send("You are not following this user");
                        });
                    }
                    // Decrement the followers count
                    db.query("UPDATE users SET followers = followers - 1 WHERE id = ?", [following_id], (updateErr) => {
                        if (updateErr) {
                            return db.rollback(() => {
                                console.error('Update error:', updateErr);
                                res.status(500).send("Error unfollowing user");
                            });
                        }
                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    console.error('Commit error:', commitErr);
                                    res.status(500).send("Error unfollowing user");
                                });
                            }
                            res.status(200).send("User unfollowed successfully");
                        });
                    });
                });
            });
        });
    });
});
app.post("/api/follow/:username", (req, res) => {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(" ")[1];
    // Verify the token and get the follower's ID
    jsonwebtoken_1.default.verify(token, secretKey, (verifyErr, decoded) => {
        if (verifyErr) {
            res.status(403).send("Invalid or expired token");
            return;
        }
        const follower_id = decoded.id;
        const username_to_follow = req.params.username;
        // First, get the ID of the user being followed
        db.query("SELECT id, followers FROM users WHERE username = ?", [username_to_follow], (err, results) => {
            if (err) {
                console.error('Error checking user:', err);
                res.status(500).send("Error following the user");
                return;
            }
            if (!results.length) {
                res.status(404).send("User not found");
                return;
            }
            const following_id = results[0].id;
            // Don't allow following yourself
            if (follower_id === following_id) {
                res.status(400).send("You cannot follow yourself");
                return;
            }
            // Check if already following
            db.query("SELECT * FROM follows WHERE follower_id = ? AND following_id = ?", [follower_id, following_id], (checkErr, checkResults) => {
                if (checkErr) {
                    console.error('Error checking follow status:', checkErr);
                    res.status(500).send("Error checking follow status");
                    return;
                }
                if (checkResults.length > 0) {
                    res.status(400).send("You are already following this user");
                    return;
                }
                // If not following, create the follow relationship and increment followers count
                db.beginTransaction((transErr) => {
                    if (transErr) {
                        console.error('Transaction error:', transErr);
                        res.status(500).send("Error following user");
                        return;
                    }
                    // Insert into follows table
                    db.query("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", [follower_id, following_id], (insertErr) => {
                        if (insertErr) {
                            return db.rollback(() => {
                                console.error('Insert error:', insertErr);
                                res.status(500).send("Error following user");
                            });
                        }
                        // Update followers count
                        db.query("UPDATE users SET followers = followers + 1 WHERE id = ?", [following_id], (updateErr) => {
                            if (updateErr) {
                                return db.rollback(() => {
                                    console.error('Update error:', updateErr);
                                    res.status(500).send("Error following user");
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        console.error('Commit error:', commitErr);
                                        res.status(500).send("Error following user");
                                    });
                                }
                                res.status(200).send("User followed successfully");
                            });
                        });
                    });
                });
            });
        });
    });
});
// For fetching seller profile
app.get("/api/seller/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        // Query seller data from the database by username
        const query = `
    SELECT 
        users.id, 
        users.username, 
        users.location, 
        users.followers,
        products.name, 
        products.price,
        products.description,
        products.location,
        products.image
    FROM 
        users
    LEFT JOIN 
        products 
    ON 
        users.id = products.user_id
    WHERE 
        users.username = ?`;
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error("Error fetching seller data:", err);
                res.status(500).send("Error fetching seller data");
                return;
            }
            if (results.length === 0) {
                res.status(404).send("Seller not found");
                return;
            }
            const sellerInfo = {
                id: results[0].id,
                username: results[0].username,
                location: results[0].location,
                followers: results[0].followers,
                products: results.map(result => ({
                    name: result.name,
                    price: result.price,
                    image: result.image,
                    location: result.location,
                    description: result.description
                })).filter(product => product.name !== null)
            };
            // Send the seller data as the response
            res.status(200).json(sellerInfo);
        });
    }
    catch (err) {
        res.status(500).send("Error processing request");
    }
}));
app.get("/api/user", (req, res) => {
    // Extract the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(" ")[1]; // Bearer <token>
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send("Invalid or expired token");
            return;
        }
        // Extract user ID from the token
        const { id } = decoded;
        // Query user data from the database
        const query = "SELECT id, username, googleaccount, location, followers FROM users WHERE id = ?";
        db.query(query, [id], (err, results) => {
            if (err) {
                console.error("Error fetching user data:", err);
                res.status(500).send(err);
                return;
            }
            if (results.length === 0) {
                res.status(404).send("User not found");
                return;
            }
            res.status(200).json(results[0]);
        });
    });
});
app.get("/api/products", (req, res) => {
    // Extract the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(" ")[1]; // Bearer <token>
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send("Invalid or expired token");
            return;
        }
        // Extract user ID from the token
        const { id } = decoded;
        // Query products based on user ID (if needed)
        const query = "SELECT * FROM products WHERE user_id = ?";
        db.query(query, [id], (err, results) => {
            if (err) {
                console.error("Error fetching products:", err);
                return res.status(500).send(err);
            }
            console.log("Query Results:", results);
            if (results.length === 0) {
                res.status(404).send("No products found for the user");
                return;
            }
            res.status(200).json(results); // Return the products belonging to the authenticated user
        });
    });
});
app.get("/api/productdetail/:name", (req, res) => {
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
    db.query(query, [decodedName], (err, results) => {
        console.log("Searching for product with name:", name);
        if (err) {
            console.error("Error fetching product details:", err);
            res.status(500).send("Database error");
            return;
        }
        if (results.length === 0) {
            res.status(404).send("Product not found or access unauthorized");
            return;
        }
        // Return the first result (assuming names are unique per user)
        res.status(200).json(results[0]);
    });
});
// In your backend (e.g., Express.js)
app.get("/api/check-username/:username", (req, res) => {
    const { username } = req.params;
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error checking username:", err);
            return res.status(500).send("Database error");
        }
        if (results.length > 0) {
            // Username exists
            return res.status(409).send("Username already taken");
        }
        // Username is available
        return res.status(200).send("Username available");
    });
});
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { username, googleaccount, password, location } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const query = "INSERT INTO users (username, googleaccount, password, location) VALUES (?, ?, ?, ?)";
    db.query(query, [username, googleaccount, hashedPassword, location], (err, results) => {
        if (err) {
            console.error("Error registering user:", err);
            return res.status(500).send(err);
        }
        const result = results;
        res.status(201).send({ id: result.insertId });
    });
}));
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Error logging in:", err);
            return res.status(500).send(err);
        }
        const users = results;
        if (users.length === 0) {
            return res.status(401).send("Invalid username or password");
        }
        const user = users[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send("Invalid username or password");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: "1h" });
        res.status(200).send({ token, username: user.username });
    }));
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.post("/users", (req, res) => {
    const { username, googleaccount, password, location } = req.body;
    const query = "INSERT INTO users (username, googleaccount, password, location) VALUES (?, ?, ?, ?)";
    db.query(query, [username, googleaccount, password, location], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: results.insertId });
    });
});
// Product routes
app.post("/products", upload.single("image"), (req, res) => {
    const { name, price, description, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    // Extract the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(" ")[1]; // Bearer <token>
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send("Invalid or expired token");
            return;
        }
        // Extract user ID from the token
        const { id } = decoded;
        // Insert the product with the user ID
        const query = "INSERT INTO products (name, price, description, image, location, user_id) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(query, [name, price, description, image, location, id], (err, results) => {
            if (err) {
                console.error("Error inserting product:", err);
                res.status(500).send(err);
                return;
            }
            res.status(201).send({ id: results.insertId });
        });
    });
});
app.get("/products", (req, res) => {
    const query = "SELECT * FROM products ORDER BY created_at DESC";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
});
