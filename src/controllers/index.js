const admin = require('./adminController')
const manager = require('./managerController')
const customer = require('./customerController')
const project = require('./projectController')
const technician = require('./technicianController')
const report = require('./reportController')
const machine = require('./machineController')

const controller = {
    admin,
    manager,
    customer,
    project,
    technician,
    report,
    machine
}

module.exports = controller