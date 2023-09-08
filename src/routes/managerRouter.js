const express = require('express');
const controller = require('../controllers');
const { verifyTokenAdmin, verifyTokenManager, verifyTokenManagerORTechnician } = require('../utils/jwt');
const { uploadMachineFiles, uploadProfile } = require('../utils/uploadFiles');
const router = express.Router();

//---------------------------------------------------------- Manager Auth Routes------------------------------------------------------//

router.post('/createManager', controller.manager.createManager)
router.put('/verifyManager', controller.manager.verifyManager)
router.post('/managerLogin', controller.manager.managerLogin)
router.put('/changePassword', verifyTokenManager, controller.manager.changePassword)
router.post('/forgotPassword', controller.manager.forgotPassword)
router.put('/resetPassword', controller.manager.resetPassword)
router.put('/updateProfile', verifyTokenManager, controller.manager.updateProfile)
router.get('/showProfile', verifyTokenManager, controller.manager.showProfile)
router.post('/uploadProfilePic', uploadProfile.single('image'), controller.manager.uploadProfilePic)

//---------------------------------------------------------- Customer Routes ------------------------------------------------------//

router.post('/createCustomer', verifyTokenManager, controller.customer.createCustomer)
router.get('/customerList', verifyTokenManager, controller.customer.customerList)
router.get('/customerDetails', verifyTokenManager, controller.customer.customerDetails)
router.put('/updateCustomer', verifyTokenManager, controller.customer.updateCustomer)

//---------------------------------------------------------- Project Routes ------------------------------------------------------//

router.post('/createProject', verifyTokenManager, controller.project.createProject)
router.get('/projectList', verifyTokenManager, controller.project.projectList)
router.get('/projectDetails', verifyTokenManager, controller.project.projectDetails)

//---------------------------------------------------------- Technician Routes ------------------------------------------------------//

router.post('/createTechnician', verifyTokenManager, controller.technician.createTechnician)
router.get('/technicianLists', verifyTokenManager, controller.technician.technicianLists)
router.get('/technicianDetails', verifyTokenManagerORTechnician, controller.technician.technicianDetails)

router.post('/uploadMachineFiles', uploadMachineFiles.array('files'), controller.manager.uploadMachineFiles);

module.exports = router