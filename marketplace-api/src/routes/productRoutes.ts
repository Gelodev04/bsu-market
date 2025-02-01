import express from "express";
import { getAllProducts, createProduct } from "../controllers/productController";

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", createProduct);

export default router;
