// index.js — Full Express + PostgreSQL backend

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

// ------------------------------------
// PostgreSQL Connection
// ------------------------------------
const pool = new Pool({
  user: 'postgres',      
  host: 'localhost',
  database: 'expense_tracker',
  password: 'Thouartgod', 
  port: 5432
});

// ES Module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------
// Middleware
// ------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions (future use)
app.use(
  session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

// ------------------------------------
// Static Files
// ------------------------------------
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/Pages', express.static(path.join(__dirname, 'Pages')));

// ------------------------------------
// EJS Setup
// ------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Pages'));

// ------------------------------------
// Routes
// ------------------------------------

// Homepage
app.get('/', (req, res) => {
  res.render('mainPage', { title: 'MainPage' });
});

// ------------------------------------
// API ENDPOINTS
// ------------------------------------

// Load all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading expenses:', err);
    res.status(500).json({ error: 'Failed to load expenses' });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { name, category, is_fixed, cost, description } = req.body;

    const result = await pool.query(
      `INSERT INTO expenses (name, category, is_fixed, cost, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, category, is_fixed, cost || null, description]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Edit expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { name, category, is_fixed, cost, description } = req.body;

    const result = await pool.query(
      `UPDATE expenses
       SET name=$1, category=$2, is_fixed=$3, cost=$4, description=$5
       WHERE id=$6
       RETURNING *`,
      [name, category, is_fixed, cost || null, description, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error editing expense:', err);
    res.status(500).json({ error: 'Failed to edit expense' });
  }
});

// ------------------------------------
// 404 Handler
// ------------------------------------
app.use((req, res) => {
  res.status(404).send('404 — Page Not Found');
});

// ------------------------------------
// Start Server
// ------------------------------------
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
