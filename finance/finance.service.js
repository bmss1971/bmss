const pool = require('../config/db');
const { generateTrxCode } = require('../utils/codeGenerator');

async function fetchFundSummary() {
  const [[incomeRow]] = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) AS total_income FROM transactions WHERE type = 'income' AND status = 'approved'"
  );
  const [[expenseRow]] = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) AS total_expense FROM transactions WHERE type = 'expense' AND status = 'approved'"
  );

  const totalIncome = Number(incomeRow.total_income || 0);
  const totalExpense = Number(expenseRow.total_expense || 0);

  const [transactions] = await pool.query(
    'SELECT * FROM transactions ORDER BY id DESC LIMIT 100'
  );

  return {
    summary: {
      total_income: totalIncome,
      total_expense: totalExpense,
      current_balance: totalIncome - totalExpense
    },
    transactions
  };
}

async function addTransaction(data) {
  const trxCode = generateTrxCode('TRX');
  const amount = Number(data.amount);

  const [result] = await pool.query(
    `INSERT INTO transactions (trx_code, member_id, type, category, amount, payment_method, trx_ref, note, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
    [
      trxCode,
      data.member_id || null,
      data.type,
      data.category,
      amount,
      data.payment_method || 'bKash',
      data.trx_ref || null,
      data.note || null
    ]
  );

  return {
    id: result.insertId,
    trx_code: trxCode,
    type: data.type,
    category: data.category,
    amount,
    payment_method: data.payment_method || 'bKash',
    status: 'approved'
  };
}

module.exports = { fetchFundSummary, addTransaction };
