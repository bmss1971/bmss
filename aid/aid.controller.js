const aidService = require('./aid.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getAidRequests(req, res, next) {
  try {
    const requests = await aidService.listAidRequests(req.query.status);
    return sendSuccess(res, { requests });
  } catch (err) { next(err); }
}

async function submitAidRequest(req, res, next) {
  try {
    const { applicant_name, district_name, category, title, description, requested_amount } = req.body;
    if (!applicant_name || !district_name || !category || !title || !description || !requested_amount) {
      return sendError(res, 'আবেদনের সব তথ্য পূরণ করুন।', 400);
    }

    const request = await aidService.createAidRequest(req.body);
    return sendSuccess(res, {
      message: 'সাহায্যের আবেদন সফলভাবে জমা হয়েছে।',
      request
    }, 201);
  } catch (err) { next(err); }
}

async function resolveAidRequest(req, res, next) {
  try {
    await aidService.markAsResolved(req.params.id, req.body);
    return sendSuccess(res, { message: 'আবেদনটি সমাধানকৃত তালিকায় যুক্ত করা হয়েছে।' });
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

module.exports = { getAidRequests, submitAidRequest, resolveAidRequest };
