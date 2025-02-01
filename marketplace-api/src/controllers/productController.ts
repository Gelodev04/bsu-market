import { Request, Response } from "express";
import pool from "../db";

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, description, image, location } = req.body;
  try {
    await pool.query(
      "INSERT INTO products (name, price, description, image, location) VALUES (?, ?, ?, ?, ?)",
      [name, price, description, image, location]
    );
    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};
