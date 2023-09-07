const express = require('express');
const controller = require('../controllers');
const { verifyTokenManagerORTechnician, verifyTokenTechnician } = require('../utils/jwt');
const { uploadMachineFiles, uploadProfile, uploadTechnicianDocuments } = require('../utils/uploadFiles');
const router = express.Router();

router.post('/techLogin', controller.technician.techLogin)
router.post('/updateTechnicianProfile', verifyTokenTechnician, controller.technician.updateTechnicianProfile)
router.post('/uploadProfilePic', verifyTokenTechnician, uploadProfile.single('image'), controller.technician.uploadProfilePic)
router.post('/uploadTechnicianDocuments', verifyTokenTechnician, uploadTechnicianDocuments.array('files'), controller.technician.uploadTechnicianDocuments)
router.get('/assignedProjectList', verifyTokenTechnician, controller.technician.assignedProjectList)
router.get('/assignedProjectDetails', verifyTokenTechnician, controller.technician.assignedProjectDetails)

module.exports = router