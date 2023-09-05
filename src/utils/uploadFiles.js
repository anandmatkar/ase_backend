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


module.exports = { 
    uploadMachineFiles
 };