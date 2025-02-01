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
exports.login = exports.register = exports.getAllUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const getAllUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query("SELECT * FROM users");
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});
exports.getAllUsers = getAllUsers;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, role, profileImage } = req.body;
    try {
        const [existing] = yield db_1.default.query("SELECT * FROM users WHERE username = ?", [username]);
        if (Array.isArray(existing) && existing.length > 0) {
            res.status(400).json({ error: "Username already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield db_1.default.query("INSERT INTO users (username, password, role, profileImage) VALUES (?, ?, ?, ?)", [username, hashedPassword, role, profileImage]);
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const [rows] = yield db_1.default.query("SELECT * FROM users WHERE username = ?", [username]);
        const user = rows[0];
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const isValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});
exports.login = login;
