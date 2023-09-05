const express = require('express');
const controller = require('../controllers');
const { verifyTokenAdmin, verifyTokenManager } = require('../utils/jwt');
const { uploadMachineFiles } = require('../utils/uploadFiles');
const router = express.Router();

router.post('/createManager',controller.manager.createManager)
router.put('/verifyManager',controller.manager.verifyManager)
router.post('/managerLogin',controller.manager.managerLogin)
router.put('/changePassword',verifyTokenManager,controller.manager.changePassword)
router.post('/forgotPassword',controller.manager.forgotPassword)
router.put('/resetPassword',controller.manager.resetPassword)
router.post('/createCustomer',verifyTokenManager,controller.manager.createCustomer)
router.get('/customerList',verifyTokenManager,controller.manager.customerList)
router.post('/createProject',verifyTokenManager,controller.manager.createProject)

router.post('/uploadMachineFiles',uploadMachineFiles.array('files'),controller.manager.uploadMachineFiles);

module.exports = router