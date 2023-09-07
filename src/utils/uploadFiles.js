const multer = require('multer')

const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/machineAttachements')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        console.log(ext)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadMachineFiles = multer({
    storage: storage1
})

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profilePicture')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadProfile= multer({
    storage: storage2
})

const storage3 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/technicianDocuments')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        console.log(ext)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadTechnicianDocuments = multer({
    storage: storage3
})


module.exports = { 
    uploadMachineFiles,
    uploadProfile,
    uploadTechnicianDocuments
 };