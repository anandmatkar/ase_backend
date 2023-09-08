const express = require('express');
const controller = require('../controllers');
const { verifyTokenManagerORTechnician, verifyTokenTechnician } = require('../utils/jwt');
const { uploadMachineFiles, uploadProfile, uploadTechnicianDocuments, uploadTimesheet } = require('../utils/uploadFiles');
const router = express.Router();

//================================================Technician Auth routes==============================================================//

router.post('/techLogin', controller.technician.techLogin)
router.post('/updateTechnicianProfile', verifyTokenTechnician, controller.technician.updateTechnicianProfile)
router.post('/uploadProfilePic', verifyTokenTechnician, uploadProfile.single('image'), controller.technician.uploadProfilePic)
router.post('/uploadTechnicianDocuments', verifyTokenTechnician, uploadTechnicianDocuments.array('files'), controller.technician.uploadTechnicianDocuments)

//================================================Technician Peroject routes===========================================================//

router.get('/assignedProjectList', verifyTokenTechnician, controller.technician.assignedProjectList)
router.get('/assignedProjectDetails', verifyTokenTechnician, controller.technician.assignedProjectDetails)

//================================================Technician timesheet routes===========================================================//

router.post('/createTimesheet', verifyTokenTechnician, controller.technician.createTimesheet)
router.get('/timesheetList', verifyTokenTechnician, controller.technician.timesheetList)
router.get('/timesheetAttachList', verifyTokenTechnician, controller.technician.timesheetAttachList)
router.post('/uploadTimesheetAttachements', verifyTokenTechnician, uploadTimesheet.array('files'), controller.technician.uploadTimesheetAttachements)
router.put('/requestForTimesheetApproval', verifyTokenTechnician, controller.technician.requestForTimesheetApproval)

module.exports = router