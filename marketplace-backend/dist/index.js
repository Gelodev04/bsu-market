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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mysql2_1 = __importDefault(require("mysql2"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const secretKey = "your_secret_key";
const port = 3001;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://localhost:3000",
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
}));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
const db = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "4545",
    database: "marketplace",
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
const upload = (0, multer_1.default)({
    storage,
    limits: {
        files: 5, // Limit to 5 files
    },
});
const profileUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path_1.default.join(__dirname, "uploads/profiles"));
        },
        filename: (req, file, cb) => {
            cb(null, `profile-${Date.now()}${path_1.default.extname(file.originalname)}`);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed"));
        }
    },
}).single("profileImage");
const uploadPath = path_1.default.join(__dirname, "uploads/profiles");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
    console.log("Upload directory created:", uploadPath);
}
const adminCredentials = {
    username: "admin",
    password: "admin"
};
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        // Check if user is admin
        if (decoded.role !== 'admin') {
            res.status(403).send("Unauthorized");
            return;
        }
        next();
    }
    catch (err) {
        res.status(403).send("Invalid token");
        return;
    }
});
//ROUTES
//SAVE PRODUCT
app.post("/api/save/:productId", (req, res) => {
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
        const saver_id = decoded.id;
        const saving_id = parseInt(req.params.productId);
        db.query("SELECT user_id, saves FROM products WHERE id = ?", [saving_id], (err, results) => {
            if (err) {
                console.error("Error checking product:", err);
                res.status(500).send("Error saving the product");
                return;
            }
            if (!results.length) {
                res.status(404).send("Product not found");
                return;
            }
            const productOwnerId = results[0].user_id;
            if (saver_id === productOwnerId) {
                res.status(400).send("You cannot save your own product");
                return;
            }
            db.query("SELECT * FROM saved_products WHERE user_id = ? AND product_id = ?", [saver_id, saving_id], (checkErr, checkResults) => {
                if (checkErr) {
                    console.error("Error checking save status:", checkErr);
                    res.status(500).send("Error checking save status");
                    return;
                }
                if (checkResults.length > 0) {
                    res.status(400).send("You already saved this product");
                    return;
                }
                db.beginTransaction((transErr) => {
                    if (transErr) {
                        console.error("Transaction error:", transErr);
                        res.status(500).send("Error following user");
                        return;
                    }
                    db.query("INSERT INTO saved_products (user_id, product_id) VALUES (?, ?)", [saver_id, saving_id], (insertErr) => {
                        if (insertErr) {
                            return db.rollback(() => {
                                console.error("Insert error:", insertErr);
                                res.status(500).send("Error saving product");
                            });
                        }
                        db.query("UPDATE products SET saves = saves + 1 WHERE id = ?", [saving_id], (updateErr) => {
                            if (updateErr) {
                                return db.rollback(() => {
                                    console.error("Update error:", updateErr);
                                    res.status(500).send("Error following user");
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        console.error("Commit error:", commitErr);
                                        res.status(500).send("Error following user");
                                    });
                                }
                                res.status(200).send("Product saved successfully");
                            });
                        });
                    });
                });
            });
        });
    });
});
app.delete("/api/save/:productId", (req, res) => {
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
        const saver_id = decoded.id;
        const product_id = parseInt(req.params.productId);
        db.query("SELECT id FROM products WHERE id = ?", [product_id], (err, results) => {
            if (err) {
                console.error("Error checking product:", err);
                res.status(500).send("Error unsaving product");
                return;
            }
            if (!results.length) {
                res.status(404).send("Product not found");
                return;
            }
            db.beginTransaction((transErr) => {
                if (transErr) {
                    console.error("Transaction error:", transErr);
                    res.status(500).send("Error unsaving product");
                    return;
                }
                db.query("DELETE FROM saved_products WHERE user_id = ? AND product_id = ?", [saver_id, product_id], (deleteErr, deleteResult) => {
                    if (deleteErr) {
                        return db.rollback(() => {
                            console.error("Delete error:", deleteErr);
                            res.status(500).send("Error unsaving product");
                        });
                    }
                    if (deleteResult.affectedRows === 0) {
                        return db.rollback(() => {
                            res.status(400).send("You didn't save the product");
                        });
                    }
                    db.query("UPDATE products SET saves = saves - 1 WHERE id = ?", [product_id], (updateErr) => {
                        if (updateErr) {
                            return db.rollback(() => {
                                console.error("Update error:", updateErr);
                                res.status(500).send("Error unsaving product");
                            });
                        }
                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    console.error("Commit error:", commitErr);
                                    res.status(500).send("Error unsaving product");
                                });
                            }
                            res.status(200).send("Product unsaved sucessfully");
                        });
                    });
                });
            });
        });
    });
});
app.get("/api/save/status/:productId", (req, res) => {
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
        const saver_id = decoded.id;
        const saving_id = parseInt(req.params.productId);
        db.query("SELECT * FROM saved_products WHERE user_id = ? AND product_id = ?", [saver_id, saving_id], (err, results) => {
            if (err) {
                console.error("Error checking save status:", err);
                res.status(500).send("Error checking save status");
                return;
            }
            res.status(200).json({ isSaved: results.length > 0 });
        });
    });
});
app.get("/api/saved", (req, res) => {
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
        const saver_id = decoded.id;
        db.query(`
      SELECT p.id, p.name, p.image, p.price, p.description 
      FROM saved_products s 
      JOIN products p ON s.product_id = p.id 
      WHERE s.user_id = ?
      `, [saver_id], (err, results) => {
            if (err) {
                console.error("Error fetching save list:", err);
                res.status(500).send("Error fetching save list");
                return;
            }
            res.status(200).json(results);
        });
    });
});
//ADMIN
app.get("/api/check-admin", verifyAdmin, (req, res) => {
    res.status(200).json({ isAdmin: true });
});
app.get("/admin/products/pending", verifyAdmin, (req, res) => {
    const query = "SELECT * FROM products WHERE status = 'Pending'";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching pending products:", err);
            res.status(500).send(err);
            return;
        }
        res.status(200).json(results);
    });
});
app.put("/admin/products/:id/status", verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Ensure status is either 'Approved' or 'Rejected'
    if (status !== "Approved" && status !== "Rejected") {
        res.status(400).send("Invalid status");
        return;
    }
    const query = "UPDATE products SET status = ? WHERE id = ?";
    db.query(query, [status, id], (err, results) => {
        if (err) {
            console.error("Error updating product status:", err);
            res.status(500).send(err);
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).send("Product not found");
            return;
        }
        if (status === "Rejected") {
            const deleteQuery = "DELETE FROM products WHERE id = ?";
            db.query(deleteQuery, [id], (deleteErr) => {
                if (deleteErr) {
                    console.error("Error deleting product:", deleteErr);
                    res.status(500).send(deleteErr);
                    return;
                }
                res.status(200).send("Product rejected and deleted successfully");
            });
        }
        else {
            res.status(200).send("Product status updated successfully");
        }
    });
});
//FOLOWERS
app.get("/api/following", (req, res) => {
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
        db.query(`
      SELECT u.id, u.username, u.profile_picture 
      FROM follows f 
      JOIN users u ON f.following_id = u.id 
      WHERE f.follower_id = ?
      `, [follower_id], (err, results) => {
            if (err) {
                console.error("Error fetching following list:", err);
                res.status(500).send("Error fetching following list");
                return;
            }
            res.status(200).json(results);
        });
    });
});
app.put("/api/user/update", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(" ")[1];
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send("Invalid or expired token");
            return;
        }
        profileUpload(req, res, (uploadErr) => __awaiter(void 0, void 0, void 0, function* () {
            if (uploadErr) {
                console.error("Error uploading file:", uploadErr);
                return res.status(400).send(uploadErr.message);
            }
            const { id } = decoded;
            const { username, location } = req.body;
            let query = "UPDATE users SET";
            const updateFields = [];
            const values = [];
            if (username) {
                updateFields.push(" username = ?");
                values.push(username);
            }
            if (location) {
                updateFields.push(" location = ?");
                values.push(location);
            }
            if (req.file) {
                updateFields.push(" profile_picture = ?");
                values.push(`/uploads/profiles/${req.file.filename}`);
            }
            query += updateFields.join(",") + " WHERE id = ?";
            values.push(id);
            if (updateFields.length === 0) {
                return res.status(400).send("No fields to update");
            }
            db.query(query, values, (queryErr, result) => {
                if (queryErr) {
                    console.error("Error updating user:", queryErr);
                    return res.status(500).send("Error updating profile");
                }
                if (result.affectedRows === 0) {
                    return res.status(404).send("User not found");
                }
                db.query("SELECT id, username, location, profile_picture FROM users WHERE id = ?", [id], (selectErr, results) => {
                    if (selectErr) {
                        console.error("Error fetching updated user:", selectErr);
                        return res.status(500).send("Error fetching updated profile");
                    }
                    res.status(200).json(results[0]);
                });
            });
        }));
    });
});
app.get("/api/follow/status/:userId", (req, res) => {
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
        const following_id = parseInt(req.params.userId);
        db.query("SELECT * FROM follows WHERE follower_id = ? AND following_id = ?", [follower_id, following_id], (err, results) => {
            if (err) {
                console.error("Error checking follow status:", err);
                res.status(500).send("Error checking follow status");
                return;
            }
            res.status(200).json({ isFollowing: results.length > 0 });
        });
    });
});
app.delete("/api/follow/:userId", (req, res) => {
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
        const following_id = parseInt(req.params.userId);
        db.query("SELECT id FROM users WHERE id = ?", [following_id], (err, results) => {
            if (err) {
                console.error("Error checking user:", err);
                res.status(500).send("Error unfollowing the user");
                return;
            }
            if (!results.length) {
                res.status(404).send("User not found");
                return;
            }
            const following_id = results[0].id;
            db.beginTransaction((transErr) => {
                if (transErr) {
                    console.error("Transaction error:", transErr);
                    res.status(500).send("Error unfollowing user");
                    return;
                }
                db.query("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", [follower_id, following_id], (deleteErr, deleteResult) => {
                    if (deleteErr) {
                        return db.rollback(() => {
                            console.error("Delete error:", deleteErr);
                            res.status(500).send("Error unfollowing user");
                        });
                    }
                    if (deleteResult.affectedRows === 0) {
                        return db.rollback(() => {
                            res.status(400).send("You are not following this user");
                        });
                    }
                    db.query("UPDATE users SET followers = followers - 1 WHERE id = ?", [following_id], (updateErr) => {
                        if (updateErr) {
                            return db.rollback(() => {
                                console.error("Update error:", updateErr);
                                res.status(500).send("Error unfollowing user");
                            });
                        }
                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    console.error("Commit error:", commitErr);
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
app.post("/api/follow/:userId", (req, res) => {
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
        const following_id = parseInt(req.params.userId);
        if (follower_id === following_id) {
            res.status(400).send("You cannot follow yourself");
            return;
        }
        db.query("SELECT id, followers FROM users WHERE id = ?", [following_id], (err, results) => {
            if (err) {
                console.error("Error checking user:", err);
                res.status(500).send("Error following the user");
                return;
            }
            if (!results.length) {
                res.status(404).send("User not found");
                return;
            }
            const following_id = results[0].id;
            if (follower_id === following_id) {
                res.status(400).send("You cannot follow yourself");
                return;
            }
            db.query("SELECT * FROM follows WHERE follower_id = ? AND following_id = ?", [follower_id, following_id], (checkErr, checkResults) => {
                if (checkErr) {
                    console.error("Error checking follow status:", checkErr);
                    res.status(500).send("Error checking follow status");
                    return;
                }
                if (checkResults.length > 0) {
                    res.status(400).send("You are already following this user");
                    return;
                }
                db.beginTransaction((transErr) => {
                    if (transErr) {
                        console.error("Transaction error:", transErr);
                        res.status(500).send("Error following user");
                        return;
                    }
                    db.query("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", [follower_id, following_id], (insertErr) => {
                        if (insertErr) {
                            return db.rollback(() => {
                                console.error("Insert error:", insertErr);
                                res.status(500).send("Error following user");
                            });
                        }
                        db.query("UPDATE users SET followers = followers + 1 WHERE id = ?", [following_id], (updateErr) => {
                            if (updateErr) {
                                return db.rollback(() => {
                                    console.error("Update error:", updateErr);
                                    res.status(500).send("Error following user");
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        console.error("Commit error:", commitErr);
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
//USERS
app.get("/api/seller/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const query = `
    SELECT 
        users.id, 
        users.username, 
        users.location, 
        users.followers,
        users.profile_picture,
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
        users.username = ?
    AND
        (products.status = 'Approved' OR products.status IS NULL)`;
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
                profile_picture: results[0].profile_picture
                    ? `http://localhost:3001${results[0].profile_picture}`
                    : null,
                followers: results[0].followers,
                products: results
                    .filter((product) => product.name !== null)
                    .map((result) => ({
                    name: result.name,
                    price: result.price,
                    image: result.image,
                    location: result.location,
                    description: result.description,
                }))
                    .filter((product) => product.name !== null),
            };
            res.status(200).json(sellerInfo);
        });
    }
    catch (err) {
        res.status(500).send("Error processing request");
    }
}));
app.get("/api/user", (req, res) => {
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
        const { id, username, role } = decoded;
        if (role === "admin") {
            res.status(200).json({
                username,
                role: "admin",
            });
            return;
        }
        const query = "SELECT id, username, googleaccount, location, followers, CONCAT('http://localhost:3001', users.profile_picture) AS profile_picture FROM users WHERE id = ?";
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
        const { id } = decoded;
        const query = "SELECT * FROM products WHERE user_id = ? AND status = 'Approved' ORDER BY created_at DESC";
        db.query(query, [id], (err, results) => {
            if (err) {
                console.error("Error fetching products:", err);
                return res.status(500).send(err);
            }
            res.status(200).json(results);
        });
    });
});
app.get("/api/productdetail/:name", (req, res) => {
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);
    const query = `
        SELECT 
          products.*, 
          users.id as user_id,
          users.username,
           CONCAT('http://localhost:3001', users.profile_picture) AS profile_picture
        FROM products 
        JOIN users ON products.user_id = users.id 
        WHERE TRIM(LOWER(products.name)) = LOWER(?)
        AND products.status = 'Approved'`;
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
        res.status(200).json(results[0]);
    });
});
app.get("/api/check-username/:username", (req, res) => {
    const { username } = req.params;
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error checking username:", err);
            return res.status(500).send("Database error");
        }
        if (results.length > 0) {
            return res.status(409).send("Username already taken");
        }
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
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        const token = jsonwebtoken_1.default.sign({ username: adminCredentials.username, role: "admin" }, secretKey, { expiresIn: "1h" });
        res.status(200).json({
            token,
            username: adminCredentials.username,
            isAdmin: true
        });
        return;
    }
    // Regular user authentication
    const query = "SELECT * FROM users WHERE BINARY username = ?";
    db.query(query, [username], (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err || results.length === 0) {
            return res.status(401).send("Invalid credentials");
        }
        const user = results[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send("Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: 'user'
        }, secretKey, { expiresIn: "1h" });
        res.status(200).json({
            token,
            username: user.username,
            isAdmin: false
        });
    }));
}));
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
app.post("/products", upload.array("images", 5), (req, res) => {
    const { name, price, description, location, condition } = req.body;
    const files = req.files;
    const imagePaths = files
        ? files.map((file) => `/uploads/${file.filename}`).join(",")
        : null;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(" ")[1];
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).send("Invalid or expired token");
            return;
        }
        const { id } = decoded;
        // Update the query to include status as 'Pending'
        const query = `
        INSERT INTO products (name, price, description, image, location, \`condition\`, user_id, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
      `;
        db.query(query, [name, price, description, imagePaths, location, condition, id], (err, results) => {
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
    const query = "SELECT * FROM products WHERE status = 'Approved' ORDER BY created_at DESC";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(results);
    });
});
