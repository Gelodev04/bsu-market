import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql, { QueryResult, ResultSetHeader } from "mysql2";
import multer from "multer";
import path from "path";

import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();
const bcrypt = require('bcryptjs');


const app = express();
const secretKey = process.env.SECRET_KEY as string;
const port = process.env.PORT || 3000;

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
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
    files: 5, 
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

interface UserRow extends RowDataPacket {
  id: number;
  followers: number;
}


const adminCredentials = {
  username: "admin",
  password: "admin" 
};

const verifyAdmin = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Authorization header missing");
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, secretKey) as { username: string; role?: string };
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
       res.status(403).send("Unauthorized");
       return;
    }
    
    next();
  } catch (err) {
     res.status(403).send("Invalid token");
     return;
  }
};



//ROUTES

//SAVE PRODUCT

app.post("/api/save/:productId", (req: Request, res: Response): void => {
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

    const saver_id = (decoded as { id: number }).id;
    const saving_id = parseInt(req.params.productId);

  

    db.query<UserRow[]>(
      "SELECT user_id, saves FROM products WHERE id = ?",
      [saving_id],
      (err, results) => {
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

        db.query(
          "SELECT * FROM saved_products WHERE user_id = ? AND product_id = ?",
          [saver_id, saving_id],
          (checkErr, checkResults: RowDataPacket[]) => {
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

              db.query(
                "INSERT INTO saved_products (user_id, product_id) VALUES (?, ?)",
                [saver_id, saving_id],
                (insertErr) => {
                  if (insertErr) {
                    return db.rollback(() => {
                      console.error("Insert error:", insertErr);
                      res.status(500).send("Error saving product");
                    });
                  }

                  db.query(
                    "UPDATE products SET saves = saves + 1 WHERE id = ?",
                    [saving_id],
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
                        res.status(200).send("Product saved successfully");
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


app.delete("/api/save/:productId", (req: Request, res: Response): void => {
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

    const saver_id = (decoded as { id: number }).id;
    const product_id = parseInt(req.params.productId);

    db.query<UserRow[]>(
      "SELECT id FROM products WHERE id = ?",
      [product_id],
      (err, results) => {
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

          db.query(
            "DELETE FROM saved_products WHERE user_id = ? AND product_id = ?",
            [saver_id, product_id],
            (deleteErr, deleteResult: any) => {
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

              db.query(
                "UPDATE products SET saves = saves - 1 WHERE id = ?",
                [product_id],
                (updateErr) => {
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
                }
              );
            }
          );
        });
      }
    );
  });
});

app.get("/api/save/status/:productId", (req: Request, res: Response): void => {
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

    const saver_id = (decoded as { id: number }).id;
    const saving_id = parseInt(req.params.productId);

    db.query(
      "SELECT * FROM saved_products WHERE user_id = ? AND product_id = ?",
      [saver_id, saving_id],
      (err, results: RowDataPacket[]) => {
        if (err) {
          console.error("Error checking save status:", err);
          res.status(500).send("Error checking save status");
          return;
        }

        res.status(200).json({ isSaved: results.length > 0 });
      }
    );
  });
});

app.get("/api/saved", (req: Request, res: Response): void => {
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

    const saver_id = (decoded as { id: number }).id;

    db.query(
      `
      SELECT p.id, p.name, p.image, p.price, p.description 
      FROM saved_products s 
      JOIN products p ON s.product_id = p.id 
      WHERE s.user_id = ?
      `,
      [saver_id],
      (err, results: RowDataPacket[]) => {
        if (err) {
          console.error("Error fetching save list:", err);
          res.status(500).send("Error fetching save list");
          return;
        }

        res.status(200).json(results);
      }
    );
  });
});

//ADMIN


app.get("/api/check-admin", verifyAdmin, (req: Request, res: Response) => {
  res.status(200).json({ isAdmin: true });
});

app.get("/admin/products/pending", verifyAdmin, (req: Request, res: Response): void => {
 

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

  app.put("/admin/products/:id/status", verifyAdmin, (req: Request, res: Response): void => {
    const { id } = req.params;
    const { status } = req.body;
  
  
      // Ensure status is either 'Approved' or 'Rejected'
      if (status !== "Approved" && status !== "Rejected") {
        res.status(400).send("Invalid status");
        return;
      }
  
      const query = "UPDATE products SET status = ? WHERE id = ?";
      db.query(query, [status, id], (err, results: ResultSetHeader) => {
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
        } else {
          res.status(200).send("Product status updated successfully");
        }
      });
      });

  
  




//FOLOWERS

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



app.post("/api/follow/:userId", (req: Request, res: Response): void => {
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

//USERS

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
        users.username = ?
    AND
        (products.status = 'Approved' OR products.status IS NULL)`;
        
        
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
          ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${results[0].profile_picture}` 
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

    const { id, username, role } = decoded as {
      id?: number;
      username: string;
      role?: string;
    };

    if (role === "admin") {
      res.status(200).json({
        username,
        role: "admin",
       
      });
      return;
    }

    const query =
      `SELECT id, username, googleaccount, location, followers, CONCAT('${process.env.NEXT_PUBLIC_IMAGE_URL}', users.profile_picture) AS profile_picture FROM users WHERE id = ?`;
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
      "SELECT * FROM products WHERE user_id = ? AND status = 'Approved' ORDER BY created_at DESC";
    db.query(query, [id], (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).send(err);
      }

      res.status(200).json(results);
    });
  });
});

// Add this route to your Express app


app.delete("/api/products/delete", (req: Request, res: Response) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
     res.status(401).send("Authorization header missing");
     return;
  }

  // Verify token
  const token = authHeader.split(" ")[1];
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid or expired token");
    }

    const { id } = decoded as { id: number };
    const { productIds } = req.body;

    // Validate request body
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).send("Invalid request body. Expected array of product IDs");
    }

    // First verify that all products belong to the user
    const verifyQuery = `
      SELECT COUNT(*) as count 
      FROM products 
      WHERE id IN (?) AND user_id = ?
    `;

    db.query(verifyQuery, [productIds, id], (verifyErr, verifyResults: mysql.RowDataPacket[]) => {
      if (verifyErr) {
        console.error("Error verifying products:", verifyErr);
        return res.status(500).send("Database error during verification");
      }

      // Check if all products belong to the user
      if (verifyResults[0].count !== productIds.length) {
        return res.status(403).send("Unauthorized. Some products don't belong to the user");
      }

      const deleteSavedProductsQuery = `
        DELETE FROM saved_products 
        WHERE product_id IN (?)
      `;

      db.query(deleteSavedProductsQuery, [productIds], (savedErr) => {
        if (savedErr) {
          console.error("Error deleting related saved products:", savedErr);
          return res.status(500).send("Error deleting related saved products");
        }

      // Proceed with deletion
      const deleteQuery = `
        DELETE FROM products 
        WHERE id IN (?) AND user_id = ?
      `;

      db.query<ResultSetHeader>(deleteQuery, [productIds, id], (deleteErr, deleteResults) => {
        if (deleteErr) {
          console.error("Error deleting products:", deleteErr);
          return res.status(500).send("Database error during deletion");
        }

        return res.status(200).json({
          message: "Products deleted successfully",
          deletedCount: deleteResults.affectedRows
        });
      });
    });
  });
});
});

app.get("/api/productdetail/:id", (req: Request, res: Response): void => {
  const { id } = req.params;



  const query = `
        SELECT 
          products.*, 
          users.id as user_id,
          users.username,
           CONCAT('${process.env.NEXT_PUBLIC_IMAGE_URL}', users.profile_picture) AS profile_picture
        FROM products 
        JOIN users ON products.user_id = users.id 
        WHERE products.id = ?
        AND products.status = 'Approved'`;

        

  db.query(query, [id], (err, results: mysql.RowDataPacket[]) => {
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

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;


  if (username === adminCredentials.username && password === adminCredentials.password) {
   
    
     
      
     
        const token = jwt.sign(
          { username: adminCredentials.username, role: "admin" },
          secretKey,
          { expiresIn: "1h" }
        );
        
         res.status(200).json({ 
          token,
          username: adminCredentials.username,
          isAdmin: true
        });
        return;
     
   
  }

  // Regular user authentication
  const query = "SELECT * FROM users WHERE BINARY username = ?";
  db.query(query, [username], async (err, results: RowDataPacket[]) => {
    if (err || results.length === 0) {
      return res.status(401).send("Invalid credentials");
    }

    const user = results[0] as RowDataPacket;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: 'user'
      },
      secretKey,
      { expiresIn: "1h" }
    );

    res.status(200).json({ 
      token,
      username: user.username,
      isAdmin: false
    });
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

      // Update the query to include status as 'Pending'
      const query = `
        INSERT INTO products (name, price, description, image, location, \`condition\`, user_id, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
      `;
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
  const query = "SELECT * FROM products WHERE status = 'Approved' ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(results);
  });
});
