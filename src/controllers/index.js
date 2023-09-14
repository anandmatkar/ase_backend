const admin = require('./adminController')
const manager = require('./managerController')
const customer = require('./customerController')
const project = require('./projectController')
const technician = require('./technicianController')
const report = require('./reportController')


const controller = {
    admin,
    manager,
    customer,
    project,
    technician,
    report
}

module.exports = controller