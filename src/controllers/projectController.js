const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string, verifyTokenFn } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { welcomeEmail2, notificationMailToAdmin, resetPasswordMail, sendProjectNotificationEmail } = require('../utils/sendMail');

module.exports.createProject = async (req, res) => {
    try {
        let { id, position, email } = req.user
        let { customerId, projectType, description, startDate, endDate, projectAttach, machineDetails, techIds } = req.body
        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q12'], {})
            let findProject = await connection.query(s2)

            let orderId = findProject.rowCount > 0 ? Number(findProject.rows[0].order_id) + 1 : 1

            let s3 = dbScript(db_sql['Q11'], { var1: orderId, var2: customerId, var3: mysql_real_escape_string(projectType), var4: mysql_real_escape_string(description), var5: startDate, var6: endDate, var7: id })
            console.log(s3,"s3")
            let createProject = await connection.query(s3)

            if (projectAttach.length > 0) {
                for (let files of projectAttach) {
                    let s4 = dbScript(db_sql['Q17'], { var1: createProject.rows[0].id, var2: files.path, var3: files.mimetype, var4: files.size, var5: id })
                    let storeProjectAttach = await connection.query(s4)
                }
            }
            //Insert data into Machine table

            for (let data of machineDetails) {

                let s5 = dbScript(db_sql['Q15'], { var1: customerId, var2: createProject.rows[0].id, var3: createProject.rows[0].order_id, var4: mysql_real_escape_string(data.MachineType), var5: data.MachineSerial, var6: data.hourCount, var7: data.nomSpeed, var8: data.actSpeed, var9: mysql_real_escape_string(description), var10: id })
                let createMachine = await connection.query(s5)
                for (let techId of data.techIds) {
                    //Assign the machine to technicians
                    let s6 = dbScript(db_sql['Q16'], { var1: createProject.rows[0].id, var2: techId, var3: createMachine.rows[0].id, var4: id })
                    let assignTechToMachine = await connection.query(s6)
                }

                if (data.machineAttach.length > 0) {
                    //storing the machine attachments
                    for (let attach of data.machineAttach) {
                        let s7 = dbScript(db_sql['Q18'], { var1: createProject.rows[0].id, var2: createMachine.rows[0].id, var3: attach.path, var4: attach.mimetype, var5: attach.size, var6: id })
                        let storeMachineAttactements = await connection.query(s7)
                    }
                }
            }
            if (createProject.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Project created successfully",
                    data: createProject.rows
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Manager not found"
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            success: false,
            status: 400,
            message: error.stack,
        })
    }
}

module.exports.projectList = async (req, res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q22'], { var1: id })
            let projectList = await connection.query(s2)
            if (projectList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Project List",
                    data: projectList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty project list",
                    data: []
                })
            }
        } else {
            res.json({
                status: 400,
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

module.exports.projectDetails = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q23'], { var1: projectId })
            console.log(s2)
            let projectDetails = await connection.query(s2)
            if (projectDetails.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Project List",
                    data: projectDetails.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty project details",
                    data: []
                })
            }
        } else {
            res.json({
                status: 400,
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

