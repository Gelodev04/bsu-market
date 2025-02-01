import { Request, Response } from "express";
import pool from "../db";

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, password, role, profileImage } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (username, password, role, profileImage) VALUES (?, ?, ?, ?)",
      [username, password, role, profileImage]
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};
