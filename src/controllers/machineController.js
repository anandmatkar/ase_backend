const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string, verifyTokenFn } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { welcomeEmail2, notificationMailToAdmin, resetPasswordMail, sendProjectNotificationEmail } = require('../utils/sendMail');


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
        let { machine_id, machine_type, serial, hour_count, nom_speed, act_speed, description } = req.body
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q69'], { var1: machine_type, var2: serial, var3: hour_count, var4: nom_speed, var5: act_speed, var6: description, var7: _dt, var8: machine_id })
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

