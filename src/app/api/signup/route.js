import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(req) {
  const { username, password } = await req.json();

  // Check if the user already exists
  const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  if (existingUser.length > 0) {
    return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 });
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the user into the database
  const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

  return new Response(JSON.stringify({ message: 'User created successfully', userId: result.insertId }), { status: 201 });
}
