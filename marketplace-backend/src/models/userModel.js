// filepath: /c:/Users/Admin/Desktop/VSCode/PersonalProjects/bsu-market/src/models/userModel.js
const db = require('./db');

const createUser = async (username, password, role, profileImage) => {
  try {
    const [result] = await db.execute('INSERT INTO users (username, password, role, profile_image) VALUES (?, ?, ?, ?)', [username, password, role, profileImage]);
    return result;
  } catch (error) {
    console.error('Error creating user:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

const getUserByUsername = async (username) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by username:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
};