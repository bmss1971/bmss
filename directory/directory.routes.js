const express = require('express');
const controller = require('./directory.controller');

const router = express.Router();

router.get('/divisions', controller.getDivisions);
router.get('/districts/:divisionId', controller.getDistricts);
router.get('/upazilas/:districtId', controller.getUpazilas);
router.get('/unions/:upazilaId', controller.getUnions);
router.post('/units', controller.addGeoUnit);
router.get('/members', controller.searchMembers);

module.exports = router;
