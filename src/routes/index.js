const express = require('express');
const controller = require('../controllers');
const router = express.Router();

router.use('/companyAdmin', require('./adminRouter'))
router.use('/manager', require('./managerRouter'))


module.exports = router