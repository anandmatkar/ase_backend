const admin = require('./adminController')
const manager = require('./managerController')
const customer = require('./customerController')
const project = require('./projectController')


const controller = {
    admin,
    manager,
    customer,
    project
}

module.exports = controller