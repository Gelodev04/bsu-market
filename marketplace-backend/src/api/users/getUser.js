// filepath: /c:/Users/Admin/Desktop/VSCode/PersonalProjects/bsu-market/src/api/users/getUser.js
const jwt = require('jsonwebtoken');
const userModel = require('../../../models/userModel');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await userModel.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}