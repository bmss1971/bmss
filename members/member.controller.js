const memberService = require('./member.service');
const { sendSuccess, sendError } = require('../utils/response');

async function register(req, res, next) {
  try {
    const data = req.body;
    const hasDistrict = Boolean(data.district_id) || Boolean(data.custom_district_name && String(data.custom_district_name).trim());
    const hasUpazila = Boolean(data.upazila_id) || Boolean(data.custom_upazila_name && String(data.custom_upazila_name).trim());
    const hasUnion = Boolean(data.union_id) || Boolean(data.custom_union_name && String(data.custom_union_name).trim());

    if (!data.full_name_bn || !data.freedom_fighter_name || !data.gazette_no || !data.blood_group ||
        !data.phone || !data.password || !data.division_id || !hasDistrict || !hasUpazila || !hasUnion) {
      return sendError(res, 'প্রয়োজনীয় সব তথ্য ও ঠিকানা পূরণ করুন।', 400);
    }

    const result = await memberService.registerMember(data);
    return sendSuccess(res, {
      message: 'সদস্য নিবন্ধন সফল হয়েছে এবং ডিজিটাল আইডি কার্ড তৈরি হয়েছে।',
      ...result
    }, 201);
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return sendError(res, 'মোবাইল নম্বর এবং পাসওয়ার্ড দিন।', 400);
    }
    const result = await memberService.loginMember(phone, password);
    return sendSuccess(res, result);
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

async function getIdCard(req, res, next) {
  try {
    const idCard = await memberService.fetchIdCard(req.params.id);
    return sendSuccess(res, { idCard });
  } catch (err) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

module.exports = { register, login, getIdCard };
