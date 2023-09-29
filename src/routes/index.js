const express = require('express');
const router = express.Router();

router.use('/companyAdmin', require('./adminRouter'))
router.use('/manager', require('./managerRouter'))
router.use('/technician', require('./technicianRouter'))


module.exports = router