const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { db_sql, dbScript } = require('../utils/db_scripts');
const { sha3_512 } = require('js-sha3')
const bcrypt = require('bcrypt');
const { notificationMailToManager } = require('../utils/sendMail');

module.exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        let s1 = dbScript(db_sql['Q1'], { var1: email })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0) {
            const result = await bcrypt.compare(password, admin.rows[0].encrypted_password);
            if (result) {
                let jwtToken = await issueJWT(admin.rows[0], "Admin");
                res.send({
                    status: 200,
                    success: true,
                    message: "Login successfull",
                    data: {
                        token: jwtToken,
                        expiresIn: 3600
                    }
                });
            } else {
                res.json({
                    status: 401,
                    success: false,
                    message: "Incorrect Password"
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Admin not found"
            })
        }
    }
    catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.managerListForApproval = async (req, res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q3'], { var1: id })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0 && position == 'Admin') {
            let s1 = dbScript(db_sql['Q8'], {})
            let managerLists = await connection.query(s1)
            if (managerLists.rowCount > 0) {
                let managerListsForApproval = [];
                let registeredManagerLists = [];
                for (let i in managerLists.rows) {
                    if (managerLists.rows[i].status == 1) {
                        managerListsForApproval.push(managerLists.rows[i]);
                    } else if (managerLists.rows[i].status == 2) {
                        registeredManagerLists.push(managerLists.rows[i]);
                    }
                }
                res.send({
                    status: 200,
                    success: true,
                    message: "Manager Lists for approval",
                    data: {
                        ManagerListForApproval: managerListsForApproval,
                        RegisteredManagerList: registeredManagerLists
                    }
                });

            } else {
                res.send({
                    status: 200,
                    success: true,
                    message: "Empty Manager Lists",
                    data: []
                });
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.waitingManagerCount = async(req,res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q3'], { var1: id })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0 && position == 'Admin') {
            let s2 = dbScript(db_sql['Q74'], { var1 : 1})
            let managerCounts = await connection.query(s2)
            if (managerCounts.rowCount > 0) {
                res.send({
                    status: 200,
                    success: true,
                    message: "Manager Counts for approval",
                    data: managerCounts.rows
                });

            } else {
                res.send({
                    status: 200,
                    success: true,
                    message: "Empty Manager Lists",
                    data: 0
                });
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.approveManager = async (req, res) => {
    try {
        let { id, position } = req.user
        let { managerId, status } = req.query
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q3'], { var1: id })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0 && position == 'Admin') {
            statusToUpdate = status == 1 ? 2 : -1
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q4'], { var1: statusToUpdate, var2: managerId, var3: _dt })
            let updateStatus = await connection.query(s2)
            if (updateStatus.rowCount > 0) {
                await connection.query("COMMIT")
                let mail = (status == 1) ? await notificationMailToManager(updateStatus.rows[0]) : null;
                let message = (status == 1) ? "Manager approved successfully" : "Manager Rejected successfully"
                res.send({
                    status: 200,
                    success: true,
                    message: message
                });
            } else {
                await connection.query("ROLLBACk")
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
                message: "Admin not found"
            })
        }

    } catch (error) {
        await connection.query("ROLLBACK")
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

