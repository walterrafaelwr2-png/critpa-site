require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// ============ CONFIG ============
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'critpa2026';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============ AUTH ============
function validatePassword(req) {
  const password = req.body?.password || req.query?.password;
  return password === ADMIN_PASSWORD;
}

// ============ POSTS API ============

// GET all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new post
app.post('/api/posts', async (req, res) => {
  if (!validatePassword(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { title, date, description, images } = req.body;
    const id = `post_${Date.now()}`;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ id, title, date, description, images: images || [] }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE post
app.delete('/api/posts/:id', async (req, res) => {
  if (!validatePassword(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ SIMULATIONS API ============

// GET all simulations
app.get('/api/simulations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching simulations:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new simulation
app.post('/api/simulations', async (req, res) => {
  if (!validatePassword(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { name, date, location, committees, notes } = req.body;
    const id = `sim_${Date.now()}`;

    const { data, error } = await supabase
      .from('simulations')
      .insert([{ id, name, date, location, committees: committees || [], notes: notes || '' }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error creating simulation:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE simulation
app.delete('/api/simulations/:id', async (req, res) => {
  if (!validatePassword(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { error } = await supabase
      .from('simulations')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting simulation:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ SERVE INDEX ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`\n🚀 CRITPA Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}\n`);
});
