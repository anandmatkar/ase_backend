const express = require('express');
const controller = require('../controllers');
const { verifyTokenManagerORTechnician, verifyTokenTechnician } = require('../utils/jwt');
const { uploadMachineFiles, uploadProfile, uploadTechnicianDocuments, uploadTimesheet, uploadReportAttach } = require('../utils/uploadFiles');
const router = express.Router();

//================================================Technician Auth routes==============================================================//

router.post('/techLogin', controller.technician.techLogin)
router.post('/updateTechnicianProfile', verifyTokenTechnician, controller.technician.updateTechnicianProfile)
router.post('/uploadProfilePic', uploadProfile.single('image'), controller.technician.uploadProfilePic)
router.post('/uploadTechnicianDocuments', uploadTechnicianDocuments.array('files'), controller.technician.uploadTechnicianDocuments)
router.get('/showProfile', verifyTokenTechnician, controller.technician.showProfile)
router.post('/forgotPassword', controller.technician.forgotPassword)
router.put('/resetPassword', controller.technician.resetPassword)

//================================================Technician Peroject routes===========================================================//

router.get('/assignedProjectList', verifyTokenTechnician, controller.technician.assignedProjectList)
router.get('/assignedProjectDetails', verifyTokenTechnician, controller.technician.assignedProjectDetails)

//================================================Technician timesheet routes===========================================================//

router.post('/createTimesheet', verifyTokenTechnician, controller.technician.createTimesheet)
router.get('/timesheetList', verifyTokenTechnician, controller.technician.timesheetList)
router.get('/timesheetAttachList', verifyTokenTechnician, controller.technician.timesheetAttachList)
router.post('/uploadTimesheetAttachements', uploadTimesheet.array('files'), controller.technician.uploadTimesheetAttachements)
router.put('/requestForTimesheetApproval', verifyTokenTechnician, controller.technician.requestForTimesheetApproval)
router.put('/deleteTimesheet', verifyTokenTechnician, controller.technician.deleteTimesheet)

//================================================Report routes===========================================================//
router.post('/createReport', verifyTokenTechnician, controller.report.createReport)
router.put('/submitReportForApproval', verifyTokenTechnician, controller.report.submitReportForApproval)
router.post('/uploadReportAttach', uploadReportAttach.array('files'), controller.report.uploadReportAttach)

module.exports = router