const express = require('express');
const controller = require('../controllers');
const { verifyTokenAdmin, verifyTokenManager, verifyTokenManagerORTechnician } = require('../utils/jwt');
const { uploadMachineFiles, uploadProfile, uploadProjectAttachments,uploadTechnicianDocuments } = require('../utils/uploadFiles');
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
router.put('/deleteCustomer', verifyTokenManager, controller.customer.deleteCustomer)

//---------------------------------------------------------- Project Routes ------------------------------------------------------//

router.post('/createProject', verifyTokenManager, controller.project.createProject)
router.get('/projectList', verifyTokenManager, controller.project.projectList)
router.get('/projectDetails', verifyTokenManager, controller.project.projectDetails)
router.put('/deleteProject', verifyTokenManager, controller.project.deleteProject)
router.post('/uploadProjectAttach', uploadProjectAttachments.array('files'), controller.project.uploadProjectAttach)

//---------------------------------------------------------- Technician Routes ------------------------------------------------------//

router.post('/createTechnician', verifyTokenManager, controller.technician.createTechnician)
router.get('/technicianLists', verifyTokenManager, controller.technician.technicianLists)
router.get('/technicianDetailsForManager', verifyTokenManagerORTechnician, controller.manager.technicianDetailsForManager)
router.post('/uploadTechnicianDocuments', uploadTechnicianDocuments.array('files'), controller.technician.uploadTechnicianDocuments)

//---------------------------------------------------------- TImesheet Routes ------------------------------------------------------//

router.get('/timesheetListsForApproval', verifyTokenManager, controller.manager.timesheetListsForApproval)
router.put('/acceptTimesheetRequest', verifyTokenManager, controller.manager.acceptTimesheetRequest)
router.get('/timesheetDetails', verifyTokenManager, controller.manager.timesheetDetails)


//-------------------------------------------------------- Report Routes ----------------------------------------------------//

router.get('/reportDetails', verifyTokenManager, controller.report.reportDetails)
router.put('/validateReport', verifyTokenManager, controller.report.validateReport)

//-------------------------------------------------------- Machine Routes ----------------------------------------------------//

router.get('/machineDetails', verifyTokenManager, controller.machine.machineDetails)
router.put('/editMachineDetails', verifyTokenManager, controller.machine.editMachineDetails)



router.post('/uploadMachineFiles', uploadMachineFiles.array('files'), controller.manager.uploadMachineFiles);

module.exports = router