const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw error || new Error('User not found');
    }
    
    // Attach user. We map data.user.id to 'sub' for compatibility with existing routes.
    req.user = { sub: data.user.id, ...data.user };
    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

module.exports = { requireAuth };
