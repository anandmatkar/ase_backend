const express = require('express');
const controller = require('../controllers');
const { verifyTokenManagerORTechnician, verifyTokenTechnician } = require('../utils/jwt');
const { uploadMachineFiles, uploadProfile, uploadTechnicianDocuments, uploadTimesheet, uploadReportAttach, uploadAgreement } = require('../utils/uploadFiles');
const router = express.Router();

//================================================Technician Auth routes==============================================================//

router.post('/techLogin', controller.technician.techLogin)
router.get('/techLogout', controller.technician.techLogout)
router.post('/updateTechnicianProfile', verifyTokenTechnician, controller.technician.updateTechnicianProfile)
router.post('/uploadProfilePic', uploadProfile.single('image'), controller.technician.uploadProfilePic)
// router.post('/uploadTechnicianDocuments', uploadTechnicianDocuments.array('files'), controller.technician.uploadTechnicianDocuments)
router.get('/showProfile', verifyTokenTechnician, controller.technician.showProfile)
router.post('/forgotPassword', controller.technician.forgotPassword)
router.put('/resetPassword', controller.technician.resetPassword)
router.put('/changePassword', verifyTokenTechnician, controller.technician.changePassword)

//================================================Technician Project routes===========================================================//

router.get('/assignedProjectList', verifyTokenTechnician, controller.technician.assignedProjectList)
router.get('/assignedProjectDetails', verifyTokenTechnician, controller.technician.assignedProjectDetails)
router.get('/assignedProjectCounts', verifyTokenTechnician, controller.technician.assignedProjectCounts)

//==============================================Technician timesheet routes===========================================================//

router.post('/createTimesheet', verifyTokenTechnician, controller.technician.createTimesheet)
router.get('/timesheetList', verifyTokenTechnician, controller.technician.timesheetList)
router.get('/timesheetAttachList', verifyTokenTechnician, controller.technician.timesheetAttachList)
router.post('/uploadTimesheetAttachements', uploadTimesheet.array('files'), controller.technician.uploadTimesheetAttachements)
router.put('/requestForTimesheetApproval', verifyTokenTechnician, controller.technician.requestForTimesheetApproval)
router.get('/deleteTimesheet', verifyTokenTechnician, controller.technician.deleteTimesheet)

//================================================Report routes===========================================================//
router.post('/createReport', verifyTokenTechnician, controller.report.createReport)
router.put('/submitReportForApproval', verifyTokenTechnician, controller.report.submitReportForApproval)
router.post('/uploadReportAttach', uploadReportAttach.array('files'), controller.report.uploadReportAttach)
router.get('/deleteReport', verifyTokenTechnician, controller.report.deleteReport)
router.get('/reportDetailsForTech', verifyTokenTechnician, controller.report.reportDetailsForTech)
router.put('/editReport', verifyTokenTechnician, controller.report.editReport)
router.put('/editReportDoc', verifyTokenTechnician, uploadReportAttach.single('file'), controller.report.editReportDoc)
router.get('/showReportAttach', verifyTokenTechnician, controller.report.showReportAttach)
router.put('/deleteReportAttach', verifyTokenTechnician, controller.report.deleteReportAttact)
// =============================================== Upload signed paper of clients =============================================

router.post('/uploadAgreement', verifyTokenTechnician, uploadAgreement.array('file'), controller.technician.uploadAgreement)
router.get('/showSignedPaper', verifyTokenTechnician, controller.technician.showSignedPaper)
router.put('/deleteSignedPaper', verifyTokenTechnician, controller.technician.deleteSignedPaper)

module.exports = router