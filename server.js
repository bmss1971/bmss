const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const memberRoutes = require('./members/member.routes');
const directoryRoutes = require('./directory/directory.routes');
const financeRoutes = require('./finance/finance.routes');
const aidRoutes = require('./aid/aid.routes');
const noticeRoutes = require('./notices/notice.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, app: 'BMSS Raptor Full Dynamic Geo API', status: 'running' });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, database: 'connected' });
  } catch (err) {
    res.status(500).json({ success: false, database: 'disconnected', error: err.message });
  }
});

app.use('/api/members', memberRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/aid-requests', aidRoutes);
app.use('/api/notices', noticeRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`BMSS Raptor server running on port ${PORT}`);
});
