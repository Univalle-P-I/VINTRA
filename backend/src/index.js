const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vintra-backend'
  });
});

app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error.message);

    res.status(500).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

app.listen(PORT, () => {
  console.log(`VINTRA Backend ejecutándose en http://localhost:${PORT}`);
});