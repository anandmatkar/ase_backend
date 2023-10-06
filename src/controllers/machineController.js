const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string, verifyTokenFn } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { welcomeEmail2, notificationMailToAdmin, resetPasswordMail, sendProjectNotificationEmail } = require('../utils/sendMail');


module.exports.machineDetails = async(req,res) => {
    try {
        let { id, position, email } = req.user
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q68'], { var1: id })
        let timesheet = await connection.query(s2)
        if(timesheet.rowCount > 0 ){
            res.json({
                status: 200,
                success: true,
                message: "Machine Details",
                data: timesheet.rows
            }) 
        }else{
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