const pool = require('../config/db');
const { generateAidCode, generateTrxCode } = require('../utils/codeGenerator');

async function listAidRequests(status) {
  let sql = 'SELECT * FROM aid_requests';
  const params = [];

  if (status && ['pending', 'resolved', 'rejected'].includes(status)) {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY id DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function createAidRequest(data) {
  const reqCode = generateAidCode();
  const requestedAmount = Number(data.requested_amount);

  const [result] = await pool.query(
    `INSERT INTO aid_requests (req_code, member_id, applicant_name, district_name, category, title, description, requested_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      reqCode,
      data.member_id || null,
      data.applicant_name,
      data.district_name,
      data.category,
      data.title,
      data.description,
      requestedAmount
    ]
  );

  return {
    id: result.insertId,
    req_code: reqCode,
    applicant_name: data.applicant_name,
    district_name: data.district_name,
    category: data.category,
    title: data.title,
    requested_amount: requestedAmount,
    status: 'pending'
  };
}

async function markAsResolved(aidId, body) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM aid_requests WHERE id = ?', [aidId]);
    if (rows.length === 0) {
      const err = new Error('আবেদনটি পাওয়া যায়নি।');
      err.status = 404;
      throw err;
    }

    const aid = rows[0];
    const finalAmount = body.approved_amount !== undefined ? Number(body.approved_amount) : Number(aid.requested_amount);
    const noteText = body.resolution_note || 'সংগঠনের তহবিল থেকে সহায়তা প্রদান করে সমাধান করা হয়েছে।';
    const recordExpense = body.record_expense !== undefined ? body.record_expense : true;

    await conn.query(
      `UPDATE aid_requests
       SET status = 'resolved', approved_amount = ?, resolution_note = ?, resolved_at = NOW()
       WHERE id = ?`,
      [finalAmount, noteText, aidId]
    );

    if (recordExpense && finalAmount > 0) {
      const trxCode = generateTrxCode('TRX-AID');
      await conn.query(
        `INSERT INTO transactions (trx_code, member_id, type, category, amount, payment_method, trx_ref, note, status)
         VALUES (?, ?, 'expense', ?, ?, 'Fund Transfer', ?, ?, 'approved')`,
        [trxCode, aid.member_id || null, `${aid.category} সহায়তা`, finalAmount, aid.req_code, `${aid.title} - ${noteText}`]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { listAidRequests, createAidRequest, markAsResolved };
