import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(req) {
    const { username, password } = await req.json();
  
    try {
      // Check if the user exists
      const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  
      if (user.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid username or password' }),
          { status: 400 }
        );
      }
  
      // Compare passwords (assuming you are using bcrypt)
      const isPasswordValid = await bcrypt.compare(password, user[0].password);
  
      if (!isPasswordValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid username or password' }),
          { status: 400 }
        );
      }
  
      // Respond with success message if login is successful
      return new Response(
        JSON.stringify({ message: 'Login successful', userId: user[0].id }),
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500 }
      );
    }
  }