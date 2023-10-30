const multer = require('multer')

const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/machineAttachements')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
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
const uploadProfile = multer({
    storage: storage2,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB limit
})

const storage3 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/technicianDocuments')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadTechnicianDocuments = multer({
    storage: storage3
})

const storage4 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/timesheetAttachements')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadTimesheet = multer({
    storage: storage4
})

const storage5 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/reportAttacehments')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadReportAttach = multer({
    storage: storage5
})

const storage6 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/projectAttachments')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadProjectAttachments = multer({
    storage: storage6
})

const storage7 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/customerFiles')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})

const uploadCustomerFile = multer({
    storage: storage7
});

const storage8 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/technicianFiles')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})

const uploadTechnicianFile = multer({
    storage: storage8
});

const storage9 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/agreement')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})

const uploadAgreement = multer({
    storage: storage9
});


module.exports = {
    uploadMachineFiles,
    uploadProfile,
    uploadTechnicianDocuments,
    uploadTimesheet,
    uploadReportAttach,
    uploadProjectAttachments,
    uploadCustomerFile,
    uploadTechnicianFile,
    uploadAgreement
};