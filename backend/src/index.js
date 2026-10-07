const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vintra-backend'
  });
});

app.listen(PORT, () => {
  console.log(`VINTRA Backend ejecutándose en http://localhost:${PORT}`);
});