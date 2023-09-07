const admin = require('./adminController')
const manager = require('./managerController')
const customer = require('./customerController')
const project = require('./projectController')
const technician = require('./technicianController')


const controller = {
    admin,
    manager,
    customer,
    project,
    technician
}

module.exports = controller