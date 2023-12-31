const connection = require('../database/connection');
const { mysql_real_escape_string } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');


module.exports.machineDetails = async (req, res) => {
    try {
        let { id, position, email } = req.user
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q68'], { var1: id })
            let machineDetails = await connection.query(s2)
            if (machineDetails.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Machine Details",
                    data: machineDetails.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Machine Details",
                    data: []
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Manager not found"
            })
        }
    } catch (error) {
        res.json({
            success: false,
            status: 400,
            message: error.message,
        })
    }
}

module.exports.editMachineDetails = async (req, res) => {
    try {
        let { id, position, email } = req.user
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let { machine_id, machine_type, serial, description } = req.body
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q69'], { var1: mysql_real_escape_string(machine_type), var2: mysql_real_escape_string(serial), var3: mysql_real_escape_string(description), var4: _dt, var5: machine_id })
            let updateMachine = await connection.query(s2)
            if (updateMachine.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Machine Details Updated successfully"
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Something Went Wrong."
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Manager not found"
            })
        }
    } catch (error) {
        res.json({
            success: false,
            status: 400,
            message: error.message,
        })
    }
}

module.exports.deleteMachine = async (req, res) => {
    try {
        let { id, position, email } = req.user
        let { machineId, projectId } = req.query
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q70'], { var1: _dt, var2: machineId, var3: projectId })
            let deleteMachine = await connection.query(s2)

            let s4 = dbScript(db_sql['Q72'], { var1: _dt, var2: machineId, var3: projectId })
            let deleteMachineAttach = await connection.query(s4)

            let s3 = dbScript(db_sql['Q71'], { var1: _dt, var2: machineId, var3: projectId })
            let deleteTechMachine = await connection.query(s3)

            if (deleteTechMachine.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Machine Deleted Successfully."
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Manager not found"
            })
        }
    } catch (error) {
        await connection.query("ROLLBACK")
        res.json({
            success: false,
            status: 400,
            message: error.message,
        })
    }
}

module.exports.machineData = async (req, res) => {
    try {
        let { id, position, email } = req.user
        let { techId, projectId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q73'], { var1: techId, var2: projectId })
            let findMachineData = await connection.query(s2)
            if (findMachineData.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Machine Data",
                    data: findMachineData.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Machine Data",
                    data: []
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Manager not found"
            })
        }
    } catch (error) {
        res.json({
            success: false,
            status: 400,
            message: error.message,
        })
    }
}

