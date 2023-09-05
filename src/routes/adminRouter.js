const express = require('express');
const controller = require('../controllers');
const { verifyTokenAdmin } = require('../utils/jwt');
const router = express.Router();


router.post('/adminLogin',controller.admin.adminLogin)
router.get('/managerListForApproval',verifyTokenAdmin,controller.admin.managerListForApproval)
router.put('/approveManager',verifyTokenAdmin,controller.admin.approveManager)

module.exports = router


