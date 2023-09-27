const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string, verifyTokenFn } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { welcomeEmail2, notificationMailToAdmin, resetPasswordMail, sendProjectNotificationEmail } = require('../utils/sendMail');

//Create New Technician By manager Only
module.exports.createTechnician = async (req, res) => {
    try {
        let { id, position } = req.user
        let { name, surname, emailAddress, password, phone, nationality, qualification, level, profilePic } = req.body
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q25'], { var1: emailAddress })
            let findTechnician = await connection.query(s2)
            if (findTechnician.rowCount == 0) {
                profilePic = profilePic == "" ? process.env.DEFAULT_PROFILE_PIC_TECHNICIAN : profilePic;

                const saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                const encryptedPassword = bcrypt.hashSync(password, salt);

                let s2 = dbScript(db_sql['Q24'], { var1: mysql_real_escape_string(name), var2: mysql_real_escape_string(surname), var3: mysql_real_escape_string("Technician"), var4: mysql_real_escape_string(emailAddress), var5: encryptedPassword, var6: phone, var7: mysql_real_escape_string(nationality), var8: mysql_real_escape_string(qualification), var9: mysql_real_escape_string(level), var10: profilePic, var11: id })
                let insertTechnician = await connection.query(s2)

                if (insertTechnician.rowCount > 0) {
                    await connection.query('COMMIT')
                    return res.json({
                        status: 201,
                        success: true,
                        message: `Technician Created Successfully`,
                    })
                } else {
                    await connection.query("ROLLBACk")
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            } else {
                await connection.query('ROLLBACK')
                return res.json({
                    status: 409,
                    success: false,
                    message: "Email already exists",
                    data: ""
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
        })
    }
}

module.exports.uploadTechnicianDocuments = async (req, res) => {
    try {
        let files = req.files;
        let fileDetails = [];

        // Iterate through the uploaded files and gather their details
        for (const file of files) {
            let path = `${process.env.TECHNICIAN_DOCUMENTS}/${file.filename}`;
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
            data: []
        });
    }
}

module.exports.techLogin = async (req, res) => {
    try {
        let { email, password } = req.body
        if (!email || !password) {
            return res.json({
                status: 401,
                success: false,
                message: "Please enter your email address and password"
            })
        }
        let s1 = dbScript(db_sql['Q25'], { var1: email })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0) {
            const result = await bcrypt.compare(password, findTechnician.rows[0].encrypted_password);
            if (result) {
                let jwtToken = await issueJWT(findTechnician.rows[0], "Technician");
                res.send({
                    status: 200,
                    success: true,
                    message: "Login successfull",
                    data: {
                        token: jwtToken,
                        id: findTechnician.rows[0].id,
                        name: findTechnician.rows[0].name,
                        surname: findTechnician.rows[0].surname,
                        position: findTechnician.rows[0].position,
                        email_address: findTechnician.rows[0].email_address,
                        phone_number: findTechnician.rows[0].phone_number,
                        nationality: findTechnician.rows[0].nationality,
                        qualification: findTechnician.rows[0].qualification,
                        level: findTechnician.rows[0].level,
                        avatar: findTechnician.rows[0].avatar,
                        manager_id: findTechnician.rows[0].manager_id,
                        created_at: findTechnician.rows[0].created_at,
                        updated_at: findTechnician.rows[0].updated_at,
                        deleted_at: findTechnician.rows[0].deleted_at
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
                message: "Technician not found"
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

module.exports.technicianLists = async (req, res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q26'], { var1: id })
            let technicianLists = await connection.query(s2)
            if (technicianLists.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: `Technicians List`,
                    data: technicianLists.rows
                })
            } else {
                return res.json({
                    status: 200,
                    success: false,
                    message: `Empty Technicians List`,
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
        })
    }
}

//for both manager and technician
module.exports.technicianDetails = async (req, res) => {
    try {
        let { id } = req.user
        let { techId } = req.query
        let s1 = dbScript(db_sql['Q28'], { var1: id })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0) {
            let s2 = dbScript(db_sql['Q27'], { var1: techId })
            let technicianDetails = await connection.query(s2)
            if (technicianDetails.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: `Technicians Details`,
                    data: technicianDetails.rows
                })
            } else {
                return res.json({
                    status: 200,
                    success: false,
                    message: `Empty Technicians Details`,
                    data: []
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Manager/Technician not found"
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

module.exports.uploadProfilePic = async (req, res) => {
    try {
        let file = req.file
        let path = `${process.env.PROFILE_PIC}/${file.filename}`;
        res.json({
            status: 201,
            success: true,
            message: "Profile Uploaded successfully!",
            data: path
        })

    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
            data: ""
        })
    }
}

//only for Technician
module.exports.updateTechnicianProfile = async (req, res) => {
    try {
        let { id, position } = req.user
        let { name, surname, emailAddress, phoneNumber, nationality, qualification, level, avatar } = req.body
        await connection.query("BEGIN")
        let s2 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s2)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q29'], { var1: name, var2: surname, var3: emailAddress, var4: phoneNumber, var5: nationality, var6: qualification, var7: level, var8: avatar, var9: _dt, var10: id })
            let updateTechnician = await connection.query(s3)

            if (updateTechnician.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Technician Updated successfully"
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
                status: 404,
                success: false,
                message: "Technician not found"
            })
        }
    } catch (error) {
        await connection.query("ROLLBACk")
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.assignedProjectList = async (req, res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q30'], { var1: id })
            let findAssignedProjectList = await connection.query(s2)
            if (findAssignedProjectList.rows.length > 0) {
                const assignedProject = [];
                const completedProject = [];

                findAssignedProjectList.rows.forEach((project) => {
                    if (project.is_completed === false) {
                        assignedProject.push(project);
                    } else {
                        completedProject.push(project);
                    }
                });
                res.json({
                    status: 200,
                    success: true,
                    message: "Projects List ",
                    data: {
                        assignedProject,
                        completedProject
                    }
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "No Projects Found on your dashboard"
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Technician not found"
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

module.exports.assignedProjectDetails = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q31'], { var1: projectId, var2: id })
            let projectDetails = await connection.query(s2)
            if (projectDetails.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "empty project details",
                    data: projectDetails.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "empty project details",
                    data: []
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Technician not found"
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

module.exports.createTimesheet = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, date, startTime, endTime, comments } = req.body
        await connection.query("BEGIN")
        let s0 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s0)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s0 = dbScript(db_sql['Q45'], { var1: projectId })
            let findProjectDetails = await connection.query(s0)
            let s2 = dbScript(db_sql['Q32'], { var1: projectId, var2: id, var3: date, var4: startTime, var5: endTime, var6: comments, var7: findProjectDetails.rows[0].manager_id })
            let createTimeSheet = await connection.query(s2)
            if (createTimeSheet.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "TimeSheet created successfully",
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
        })
    }
}

module.exports.timesheetList = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0) {
            let s2 = dbScript(db_sql['Q33'], { var1: projectId, var2: id })
            let timesheetList = await connection.query(s2)
            if (timesheetList.rowCount > 0 && position == "Technician") {
                res.json({
                    status: 200,
                    success: true,
                    message: "TimeSheet List",
                    data: timesheetList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty TimeSheet List",
                    data: []
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Technician not found"
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

module.exports.uploadTimesheetAttachements = async (req, res) => {
    try {
        let files = req.files;
        let { id, position } = req.user
        let { projectId } = req.query
        let fileDetails = [];
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            // Iterate through the uploaded files and gather their details
            for (const file of files) {
                let path = `${process.env.TIMESHEET_ATTACHEMENTS}/${file.filename}`;
                let size = file.size;
                let mimetype = file.mimetype;
                fileDetails.push({ path, size, mimetype });
                let s2 = dbScript(db_sql['Q34'], { var1: projectId, var2: id, var3: path, var4: mimetype, var5: size })
                let uploadAttach = await connection.query(s2)
            }
            await connection.query("COMMIT")
            res.json({
                status: 201,
                success: true,
                message: "Files Uploaded successfully!"
            });

        } else {
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
            message: error.message,
        });
    }
}

module.exports.timesheetAttachList = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q35'], { var1: projectId, var2: id })
            let findTimesheetAttach = await connection.query(s2)
            if (findTimesheetAttach.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Timesheet Attachement List",
                    data: findTimesheetAttach.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Attachement List",
                    data: []
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Technician not found"
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

module.exports.requestForTimesheetApproval = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q36'], { var1: true, var2: _dt, var3: projectId, var4: id })
            let requestforApproval = await connection.query(s2)

            let s3 = dbScript(db_sql['Q54'], { var1: true, var2: projectId })
            let updateProject = await connection.query(s3)
            if (requestforApproval.rowCount > 0 && updateProject.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Timesheet requested for approval successfully",
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

module.exports.deleteTimesheet = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q52'], { var1: _dt, var2: projectId, var3: id })
            let deleteTimesheet = await connection.query(s2)
            let s3 = dbScript(db_sql['Q53'], { var1: _dt, var2: projectId, var3: id })
            let deleteTimesheetAttach = await connection.query(s3)

            if (deleteTimesheet.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Timesheet deleted successfully"
                })
            } else {
                await connection.query("ROLLBACK")
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

