const express = require('express');
const controller = require('../controllers');
const { verifyTokenAdmin, verifyTokenManager, verifyTokenManagerORTechnician } = require('../utils/jwt');
const { uploadMachineFiles, uploadProfile, uploadProjectAttachments, uploadTechnicianDocuments, uploadCustomerFile, uploadTechnicianFile } = require('../utils/uploadFiles');
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
router.post('/insertCustomer', verifyTokenManager, uploadCustomerFile.single('file'), controller.customer.insertCustomer)
router.get('/customerList', verifyTokenManager, controller.customer.customerList)
router.get('/customerDetails', verifyTokenManager, controller.customer.customerDetails)
router.put('/updateCustomer', verifyTokenManager, controller.customer.updateCustomer)
router.put('/deleteCustomer', verifyTokenManager, controller.customer.deleteCustomer)

//---------------------------------------------------------- Project Routes ------------------------------------------------------//

router.post('/createProject', verifyTokenManager, controller.project.createProject)
router.get('/projectList', verifyTokenManager, controller.project.projectList)
router.get('/projectCount', verifyTokenManager, controller.project.projectCount)
router.get('/projectDetails', verifyTokenManager, controller.project.projectDetails)
router.put('/deleteProject', verifyTokenManager, controller.project.deleteProject)
router.put('/completeProject', verifyTokenManager, controller.project.completeProject)
router.put('/editProject', verifyTokenManager, controller.project.editProject)
router.post('/uploadProjectAttach', uploadProjectAttachments.array('files'), controller.project.uploadProjectAttach)

//---------------------------------------------------------- Technician Routes ------------------------------------------------------//

router.post('/createTechnician', verifyTokenManager, controller.technician.createTechnician)
router.get('/technicianLists', verifyTokenManager, controller.technician.technicianLists)
router.get('/technicianDetailsForManager', verifyTokenManagerORTechnician, controller.manager.technicianDetailsForManager)
router.post('/uploadTechnicianDocuments', uploadTechnicianDocuments.array('files'), controller.technician.uploadTechnicianDocuments)
router.post('/insertTechnician', verifyTokenManager, uploadTechnicianFile.single('file'), controller.technician.insertTechnician)
router.put('/deleteTechnician', verifyTokenManager, controller.technician.deleteTechnician)
router.put('/editTechnician', verifyTokenManager, controller.manager.editTechnician)

//---------------------------------------------------------- TImesheet Routes ------------------------------------------------------//

router.get('/timesheetListsForApproval', verifyTokenManager, controller.manager.timesheetListsForApproval)
router.put('/acceptTimesheetRequest', verifyTokenManager, controller.manager.acceptTimesheetRequest)
router.put('/disapproveTimeSheet', verifyTokenManager, controller.manager.disapproveTimeSheet)
router.get('/timesheetDetails', verifyTokenManager, controller.manager.timesheetDetails)


//-------------------------------------------------------- Report Routes ----------------------------------------------------//

router.get('/reportDetails', verifyTokenManager, controller.report.reportDetails)
router.put('/validateReport', verifyTokenManager, controller.report.validateReport)
router.put('/rejectReport', verifyTokenManager, controller.report.rejectReport)

//-------------------------------------------------------- Machine Routes ----------------------------------------------------//

router.get('/machineDetails', verifyTokenManager, controller.machine.machineDetails)
router.get('/machineData', verifyTokenManager, controller.machine.machineData)
router.put('/editMachineDetails', verifyTokenManager, controller.machine.editMachineDetails)
router.put('/deleteMachine', verifyTokenManager, controller.machine.deleteMachine)
router.post('/uploadMachineFiles', uploadMachineFiles.array('files'), controller.manager.uploadMachineFiles);

router.get('/showSignedPaper', verifyTokenManager, controller.manager.showSignedPaper)

module.exports = router