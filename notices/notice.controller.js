const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

async function getNotices(req, res, next) {
  try {
    const [notices] = await pool.query('SELECT * FROM notices ORDER BY id DESC LIMIT 50');
    return sendSuccess(res, { notices });
  } catch (err) { next(err); }
}

async function createNotice(req, res, next) {
  try {
    const { title, body, is_urgent = false } = req.body;
    if (!title || !body) {
      return sendError(res, 'নোটিশের শিরোনাম ও বিস্তারিত লিখুন।', 400);
    }
    const [result] = await pool.query(
      'INSERT INTO notices (title, body, is_urgent) VALUES (?, ?, ?)',
      [title, body, Boolean(is_urgent)]
    );
    return sendSuccess(res, {
      message: 'নোটিশ প্রকাশিত হয়েছে।',
      notice: { id: result.insertId, title, body, is_urgent: Boolean(is_urgent) }
    }, 201);
  } catch (err) { next(err); }
}

module.exports = { getNotices, createNotice };
