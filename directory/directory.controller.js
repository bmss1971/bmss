const directoryService = require('./directory.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getDivisions(req, res, next) {
  try {
    const divisions = await directoryService.listDivisions();
    return sendSuccess(res, { divisions });
  } catch (err) { next(err); }
}

async function getDistricts(req, res, next) {
  try {
    const districts = await directoryService.listDistricts(req.params.divisionId);
    return sendSuccess(res, { districts });
  } catch (err) { next(err); }
}

async function getUpazilas(req, res, next) {
  try {
    const upazilas = await directoryService.listUpazilas(req.params.districtId);
    return sendSuccess(res, { upazilas });
  } catch (err) { next(err); }
}

async function getUnions(req, res, next) {
  try {
    const unions = await directoryService.listUnions(req.params.upazilaId);
    return sendSuccess(res, { unions });
  } catch (err) { next(err); }
}

async function addGeoUnit(req, res, next) {
  try {
    const { name_bn, level, parent_id } = req.body;
    if (!name_bn || !level) {
      return sendError(res, 'নাম এবং স্তর (level) আবশ্যক।', 400);
    }
    const unit = await directoryService.createGeoUnit(req.body);
    return sendSuccess(res, { message: 'নতুন এলাকা যুক্ত হয়েছে।', unit }, 201);
  } catch (err) { next(err); }
}

async function searchMembers(req, res, next) {
  try {
    const members = await directoryService.filterMembers(req.query);
    return sendSuccess(res, { members });
  } catch (err) { next(err); }
}

module.exports = { getDivisions, getDistricts, getUpazilas, getUnions, addGeoUnit, searchMembers };
