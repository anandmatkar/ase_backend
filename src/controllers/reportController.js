const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string, verifyTokenFn } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { welcomeEmail2, notificationMailToAdmin, resetPasswordMail, sendProjectNotificationEmail } = require('../utils/sendMail');


//Create Report by Technician
module.exports.createReport = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, date, description, attachements } = req.body
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q48'], { var1: projectId, var2: id, var3: findTechnician.rows[0].manager_id, var4: date, var5: description })
            let createReport = await connection.query(s2)
            if (createReport.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 201,
                    success: true,
                    message: "Report created successfully"
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
        } else {
            await connection.query("ROLLBACK")
            res.json({
                status: 404,
                success: false,
                message: "Technician not found"
            })
        }
    } catch (error) {
        await connection.query("ROLLBACK")
        res.json({
            status: 400,
            success: false,
            message: error.message
        });
    }
}

module.exports.uploadReportAttach = async (req, res) => {
    try {
        let files = req.files;
        let fileDetails = [];
        // Iterate through the uploaded files and gather their details
        for (const file of files) {
            let path = `${process.env.REPORT_ATTACHEMENTS}/${file.filename}`;
            let size = file.size;
            let mimetype = file.mimetype;
            fileDetails.push({ path, size, mimetype });
        }
        res.json({
            status: 201,
            success: true,
            message: "Files Uploaded successfully!",
            data: fileDetails
        });
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        });
    }
}

//submit approval request for the report by technician
module.exports.submitReportForApproval = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q49'], { var1: true, var2: projectId, var3: id })
            let updateReqForApproval = await connection.query(s2)
            if (updateReqForApproval.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 201,
                    success: true,
                    message: "Requested for Report approval sent successfully"
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
        } else {
            await connection.query("ROLLBACK")
            res.json({
                status: 404,
                success: false,
                message: "Technician not found"
            })
        }
    } catch (error) {
        await connection.query("ROLLBACK")
        res.json({
            status: 400,
            success: false,
            message: error.message
        });
    }
}

//report  details for manager
module.exports.reportDetails = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, techId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q50'], { var1: projectId, var2: techId })
            let reportDetails = await connection.query(s2)
            if (reportDetails.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Report Details.",
                    data: reportDetails.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Report Details.",
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
            status: 400,
            success: false,
            message: error.message
        });
    }
}

//validate report for manager
module.exports.validateReport = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, techId } = req.query

        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q51'], { var1: true, var2: false, var3: projectId, var4: techId })
            let approveReport = await connection.query(s2)
            if (approveReport.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Report Approved Successfully."
                })
            } else {
                await connection.query("ROLLBACK")
                res.json({
                    status: 400,
                    success: false,
                    message: "SOmething went wrong."
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
            status: 400,
            success: false,
            message: error.message
        });
    }
}