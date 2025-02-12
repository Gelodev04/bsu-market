import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import fs from "fs";

const app = express();
const secretKey = "your_secret_key";
const port = 3001;

app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "https://localhost:3000", 
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const db = mysql.createConnection({
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 5, // Limit to 5 files
  },
});

const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "uploads/profiles"));
    },
    filename: (req, file, cb) => {
      cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
}).single("profileImage");

interface UpdateProfileRequest extends Request {
  file?: Express.Multer.File;
  body: {
    username: string;
    location: string;
  };
}

const uploadPath = path.join(__dirname, "uploads/profiles");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("Upload directory created:", uploadPath);
}


app.get("/api/following", (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Authorization header missing");
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (verifyErr, decoded) => {
    if (verifyErr) {
      res.status(403).send("Invalid or expired token");
      return;
    }

    const follower_id = (decoded as { id: number }).id;

    db.query(
      `
      SELECT u.id, u.username, u.profile_picture 
      FROM follows f 
      JOIN users u ON f.following_id = u.id 
      WHERE f.follower_id = ?
      `,
      [follower_id],
      (err, results: RowDataPacket[]) => {
        if (err) {
          console.error("Error fetching following list:", err);
          res.status(500).send("Error fetching following list");
          return;
        }

        res.status(200).json(results);
      }
    );
  });
});


app.put("/api/user/update",
  (req: UpdateProfileRequest, res: Response): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send("Authorization header missing");
      return;
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(403).send("Invalid or expired token");
        return;
      }

      profileUpload(req, res, async (uploadErr) => {
        if (uploadErr) {
          console.error("Error uploading file:", uploadErr);
          return res.status(400).send(uploadErr.message);
        }

        const { id } = decoded as { id: number };
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

        db.query(query, values, (queryErr, result: mysql.ResultSetHeader) => {
          if (queryErr) {
            console.error("Error updating user:", queryErr);
            return res.status(500).send("Error updating profile");
          }

          if (result.affectedRows === 0) {
            return res.status(404).send("User not found");
          }

          db.query(
            "SELECT id, username, location, profile_picture FROM users WHERE id = ?",
            [id],
            (selectErr, results: mysql.RowDataPacket[]) => {
              if (selectErr) {
                console.error("Error fetching updated user:", selectErr);
                return res.status(500).send("Error fetching updated profile");
              }

              res.status(200).json(results[0]);
            }
          );
        });
      });
    });
  }
);

app.get("/api/follow/status/:userId", (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Authorization header missing");
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (verifyErr, decoded) => {
    if (verifyErr) {
      res.status(403).send("Invalid or expired token");
      return;
    }

    const follower_id = (decoded as { id: number }).id;
    const following_id = parseInt(req.params.userId);

    db.query(
      "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
      [follower_id, following_id],
      (err, results: RowDataPacket[]) => {
        if (err) {
          console.error("Error checking follow status:", err);
          res.status(500).send("Error checking follow status");
          return;
        }

        res.status(200).json({ isFollowing: results.length > 0 });
      }
    );
  });
});

app.delete("/api/follow/:userId", (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Authorization header missing");
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (verifyErr, decoded) => {
    if (verifyErr) {
      res.status(403).send("Invalid or expired token");
      return;
    }

    const follower_id = (decoded as { id: number }).id;
    const following_id = parseInt(req.params.userId);

    db.query<UserRow[]>(
      "SELECT id FROM users WHERE id = ?",
      [following_id],
      (err, results) => {
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

          db.query(
            "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
            [follower_id, following_id],
            (deleteErr, deleteResult: any) => {
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

              db.query(
                "UPDATE users SET followers = followers - 1 WHERE id = ?",
                [following_id],
                (updateErr) => {
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
                }
              );
            }
          );
        });
      }
    );
  });
});

interface UserRow extends RowDataPacket {
  id: number;
  followers: number;
}

app.post("/api/follow/:userId", (req: Request, res: Response): void => {
  const { userId } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Authorization header missing");
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (verifyErr, decoded) => {
    if (verifyErr) {
      res.status(403).send("Invalid or expired token");
      return;
    }

    const follower_id = (decoded as { id: number }).id;
    const following_id = parseInt(req.params.userId);

    if (follower_id === following_id) {
      res.status(400).send("You cannot follow yourself");
      return;
    }

    db.query<UserRow[]>(
      "SELECT id, followers FROM users WHERE id = ?",
      [following_id],
      (err, results) => {
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

        db.query(
          "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
          [follower_id, following_id],
          (checkErr, checkResults: RowDataPacket[]) => {
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

              db.query(
                "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
                [follower_id, following_id],
                (insertErr) => {
                  if (insertErr) {
                    return db.rollback(() => {
                      console.error("Insert error:", insertErr);
                      res.status(500).send("Error following user");
                    });
                  }

                  db.query(
                    "UPDATE users SET followers = followers + 1 WHERE id = ?",
                    [following_id],
                    (updateErr) => {
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
                    }
                  );
                }
              );
            });
          }
        );
      }
    );
  });
});

app.get("/api/seller/:username", async (req: Request, res: Response) => {
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
        users.username = ?`;
    db.query(query, [username], (err, results: mysql.RowDataPacket[]) => {
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
  } catch (err) {
    res.status(500).send("Error processing request");
  }
});

app.get("/api/user", (req: Request, res: Response): void => {
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Authorization header missing");
    return;
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(403).send("Invalid or expired token");
      return;
    }

    const { id } = decoded as { id: number };

    const query =
      "SELECT id, username, googleaccount, location, followers, CONCAT('http://localhost:3001', users.profile_picture) AS profile_picture FROM users WHERE id = ?";
    db.query(query, [id], (err, results: mysql.RowDataPacket[]) => {
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

app.get("/api/products", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Authorization header missing");
    return;
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(403).send("Invalid or expired token");
      return;
    }

    const { id } = decoded as { id: number };

    const query =
      "SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC";
    db.query(query, [id], (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).send(err);
      }

      res.status(200).json(results);
    });
  });
});

app.get("/api/productdetail/:name", (req: Request, res: Response): void => {
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
        WHERE TRIM(LOWER(products.name)) = LOWER(?)`;

  db.query(query, [decodedName], (err, results: mysql.RowDataPacket[]) => {
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
  db.query(query, [username], (err, results: mysql.RowDataPacket[]) => {
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

app.post("/register", async (req: Request, res: Response) => {
  console.log(req.body);
  const { username, googleaccount, password, location } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query =
    "INSERT INTO users (username, googleaccount, password, location) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [username, googleaccount, hashedPassword, location],
    (err, results) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).send(err);
      }
      const result = results as mysql.ResultSetHeader;
      res.status(201).send({ id: result.insertId });
    }
  );
});

app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE BINARY username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Error logging in:", err);
      return res.status(500).send(err);
    }
    const users = results as mysql.RowDataPacket[];
    if (users.length === 0) {
      return res.status(401).send("Invalid username or password");
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid username or password");
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      secretKey,
      { expiresIn: "1h" }
    );
    res.status(200).send({ token, username: user.username });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post("/users", (req: Request, res: Response) => {
  const { username, googleaccount, password, location } = req.body;
  const query =
    "INSERT INTO users (username, googleaccount, password, location) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [username, googleaccount, password, location],
    (err, results: mysql.ResultSetHeader) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).send({ id: results.insertId });
    }
  );
});

app.post(
  "/products",
  upload.array("images", 5),
  (req: Request, res: Response): void => {
    const { name, price, description, location, condition } = req.body;
    const files = req.files as Express.Multer.File[];

    const imagePaths = files
      ? files.map((file) => `/uploads/${file.filename}`).join(",")
      : null;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send("Authorization header missing");
      return;
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(403).send("Invalid or expired token");
        return;
      }

      const { id } = decoded as { id: number };

      const query =
        "INSERT INTO products (name, price, description, image, location, `condition`, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(
        query,
        [name, price, description, imagePaths, location, condition, id],
        (err, results: mysql.ResultSetHeader) => {
          if (err) {
            console.error("Error inserting product:", err);
            res.status(500).send(err);
            return;
          }
          res.status(201).send({ id: results.insertId });
        }
      );
    });
  }
);

app.get("/products", (req: Request, res: Response) => {
  const query = "SELECT * FROM products ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(results);
  });
});
