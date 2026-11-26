const financeService = require('./finance.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getSummary(req, res, next) {
  try {
    const result = await financeService.fetchFundSummary();
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

async function createTransaction(req, res, next) {
  try {
    const { type, category, amount } = req.body;
    if (!type || !['income', 'expense'].includes(type) || !category || !amount || Number(amount) <= 0) {
      return sendError(res, 'সঠিক লেনদেনের তথ্য দিন।', 400);
    }

    const transaction = await financeService.addTransaction(req.body);
    return sendSuccess(res, {
      message: type === 'income' ? 'আয়/চাঁদা সফলভাবে জমা হয়েছে।' : 'ব্যয়ের হিসাব সফলভাবে যুক্ত হয়েছে।',
      transaction
    }, 201);
  } catch (err) { next(err); }
}

module.exports = { getSummary, createTransaction };
