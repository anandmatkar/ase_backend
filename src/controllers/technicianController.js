const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { resetPasswordMail } = require('../utils/sendMail');
const XLSX = require('xlsx');
const { createTechnicianSchema } = require('../utils/managerValidation');
const { techLoginSchema, techChangePasswordSchema, techForgetPassword, techResetPassword, techEditTechnicianSchema, createTimesheetSchema } = require('../utils/techValidation');

//Create New Technician By manager Only
module.exports.createTechnician = async (req, res) => {
    try {
        let { id, position } = req.user
        let { name, surname, emailAddress, password, phone, nationality, qualification, level, profilePic, documents } = req.body
        const { error } = createTechnicianSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q25'], { var1: emailAddress.toLowerCase() })
            let findTechnician = await connection.query(s2)
            if (findTechnician.rowCount == 0) {
                profilePic = profilePic == "" ? process.env.DEFAULT_PROFILE_PIC_TECHNICIAN : profilePic;

                const saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                const encryptedPassword = bcrypt.hashSync(password, salt);

                let s2 = dbScript(db_sql['Q24'], { var1: mysql_real_escape_string(name), var2: mysql_real_escape_string(surname), var3: mysql_real_escape_string("Technician"), var4: mysql_real_escape_string(emailAddress.toLowerCase()), var5: encryptedPassword, var6: phone, var7: mysql_real_escape_string(nationality), var8: mysql_real_escape_string(qualification), var9: mysql_real_escape_string(level), var10: profilePic, var11: id })
                let insertTechnician = await connection.query(s2)

                if (insertTechnician.rowCount > 0) {
                    if (documents.length > 0) {
                        for (let file of documents) {
                            let s3 = dbScript(db_sql['Q65'], { var1: id, var2: insertTechnician.rows[0].id, var3: file.path, var4: file.type, var5: file.size })
                            let uploadDocs = await connection.query(s3)
                        }
                    }
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
//Inset techinician using file upload By manager Only
module.exports.insertTechnician = async (req, res) => {
    try {
        let { id, position } = req.user;
        let s1 = dbScript(db_sql['Q7'], { var1: id });
        let findManager = await connection.query(s1);
        if (findManager.rowCount > 0 && position === 'Manager') {
            if (!req.file) {
                return res.status(400).send('No file was uploaded.');
            }
            let path = req.file.path;
            var workbook = XLSX.readFile(path);
            var sheet_name_list = workbook.SheetNames;
            let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            if (jsonData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Excel sheet has no data",
                });
            }

            const duplicateEmails = [];

            for (const row of jsonData) {
                const {
                    'Name': name,
                    'Surname': surname,
                    'Email Address': emailAddress,
                    'Password': password,
                    'Phone': phone,
                    'Nationality': nationality,
                    'Qualification': qualification,
                    'Level': level,
                } = row;

                await connection.query('BEGIN');
                let s2 = dbScript(db_sql['Q25'], { var1: emailAddress.toLowerCase() });
                let findTechnician = await connection.query(s2);

                if (findTechnician.rowCount == 0) {
                    let profilePic = process.env.DEFAULT_PROFILE_PIC_TECHNICIAN;

                    const saltRounds = 10;
                    const salt = bcrypt.genSaltSync(saltRounds);
                    const encryptedPassword = bcrypt.hashSync(password, salt);

                    let s2 = dbScript(db_sql['Q24'], { var1: mysql_real_escape_string(name), var2: mysql_real_escape_string(surname), var3: mysql_real_escape_string("Technician"), var4: mysql_real_escape_string(emailAddress.toLowerCase()), var5: encryptedPassword, var6: phone, var7: mysql_real_escape_string(nationality), var8: mysql_real_escape_string(qualification), var9: (level), var10: profilePic, var11: id })

                    let insertTechnician = await connection.query(s2)
                } else {
                    duplicateEmails.push(emailAddress);
                }
            }

            if (duplicateEmails.length > 0) {
                await connection.query("ROLLBACK")
                res.json({
                    status: 400,
                    success: false,
                    message: "Duplicate email addresses found",
                    duplicates: duplicateEmails,
                });
            } else {
                await connection.query("COMMIT")
                res.json({
                    status: 201,
                    success: true,
                    message: "Technicians inserted successfully",
                });
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Manager not found",
            });
        }
    } catch (error) {
        await connection.query('ROLLBACK');
        res.json({
            success: false,
            status: 400,
            message: error.message,
        });
    }
}
//by manager
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
        const { error } = techLoginSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        let s1 = dbScript(db_sql['Q25'], { var1: mysql_real_escape_string(email.toLowerCase()) })
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
                        role: "Technician",
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

module.exports.techLogout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            res.redirect('/techLogin'); // Redirect to the homepage or any other appropriate page
        }
    });
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
//for bothtechnician
module.exports.showProfile = async (req, res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q66'], { var1: id })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0 && position == "Technician") {
            res.json({
                status: 200,
                success: true,
                message: `Technicians Details`,
                data: findUser.rows
            })
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

module.exports.changePassword = async (req, res) => {

    try {
        let userEmail = req.user.email
        const { oldPassword, newPassword } = req.body;
        const { error } = techChangePasswordSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q25'], { var1: mysql_real_escape_string(userEmail.toLowerCase()) })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0) {
            const result = await bcrypt.compare(oldPassword, findTechnician.rows[0].encrypted_password);
            if (result) {
                const saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                const encryptedPassword = bcrypt.hashSync(newPassword, salt);
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q60'], { var1: encryptedPassword, var2: findTechnician.rows[0].id, var3: _dt })
                let updatePass = await connection.query(s2)

                if (updatePass.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.send({
                        status: 201,
                        success: true,
                        message: "Password Changed Successfully!",
                    });
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }

            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Incorrect Old Password"
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
        await connection.query('ROLLBACK')
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        let {
            emailAddress
        } = req.body
        const { error } = techForgetPassword.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        let s1 = dbScript(db_sql['Q25'], { var1: mysql_real_escape_string(emailAddress.toLowerCase()) })
        let findTechnician = await connection.query(s1);
        if (findTechnician.rows.length > 0) {
            await connection.query("BEGIN")
            let otp = Math.floor(1000 + Math.random() * 9000);
            let s2 = dbScript(db_sql['Q58'], { var1: otp, var2: findTechnician.rows[0].id })
            let updateOtp = await connection.query(s2);
            if (updateOtp.rowCount > 0) {
                await connection.query("COMMIT")
                await resetPasswordMail(emailAddress.toLowerCase(), otp, findTechnician.rows[0].name);
                res.json({
                    status: 200,
                    success: true,
                    message: `Password reset link has sent on your registered ${emailAddress.toLowerCase()} account`,
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
                status: 400,
                success: false,
                message: "This user is not exits",
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
            data: ""
        })
    }
}

module.exports.resetPassword = async (req, res) => {
    try {
        let {
            emailAddress,
            otp,
            password
        } = req.body
        const { error } = techResetPassword.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q25'], { var1: mysql_real_escape_string(emailAddress.toLowerCase()) })
        let findTechnician = await connection.query(s1);
        if (findTechnician.rows.length > 0) {
            if (findTechnician.rows[0].otp == otp) {
                const saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                const encryptedPassword = bcrypt.hashSync(password, salt);
                let _dt = new Date().toISOString();

                let s2 = dbScript(db_sql['Q59'], { var1: encryptedPassword, var2: findTechnician.rows[0].id, var3: _dt })
                let updatePassword = await connection.query(s2)

                if (updatePassword.rowCount == 1) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Password changed successfully"
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
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Please Enter correct OTP"
                })
            }


        } else {
            res.json({
                status: 404,
                success: false,
                message: "This user is not exits",
                data: ""
            })
        }

    } catch (error) {
        await connection.query('ROLLBACK')
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
        let { name, surname, emailAddress, phoneNumber, nationality, qualification, level, profilePic } = req.body
        const { error } = techEditTechnicianSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        await connection.query("BEGIN")
        let s2 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s2)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q29'], { var1: name, var2: surname, var3: emailAddress, var4: phoneNumber, var5: nationality, var6: qualification, var7: level, var8: profilePic, var9: _dt, var10: id })
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
                res.json({
                    status: 200,
                    success: true,
                    message: "Projects List ",
                    data: findAssignedProjectList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "No Projects Found on your dashboard",
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

module.exports.assignedProjectCounts = async (req, res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q30'], { var1: id })
            let findAssignedProjectList = await connection.query(s2)
            if (findAssignedProjectList.rows.length > 0) {
                let assignedProjectCount = 0;
                let completedProjectCount = 0;
                let projectWaitingApprovalCount = 0;

                findAssignedProjectList.rows.forEach(project => {
                    if (project.timesheet_data.length === 0) {
                        // If timesheet_data is empty, increment assignedProjectCount
                        assignedProjectCount++;
                    } else {
                        const isRequestedForApproval = project.timesheet_data.some(
                            timesheet => timesheet.is_timesheet_requested_for_approval
                        );
                        const isApproved = project.timesheet_data.every(
                            timesheet => timesheet.is_timesheet_approved
                        );

                        if (!isRequestedForApproval && !isApproved) {
                            // If none of the timesheets are requested for approval or approved, increment assignedProjectCount
                            assignedProjectCount++;
                        } else if (isRequestedForApproval && !isApproved) {
                            // If at least one timesheet is requested for approval and none are approved, increment projectWaitingApprovalCount
                            projectWaitingApprovalCount++;
                        } else if (!isRequestedForApproval && isApproved) {
                            // If none of the timesheets are requested for approval but all are approved, increment completedProjectCount
                            completedProjectCount++;
                        }
                    }
                });
                res.json({
                    status: 200,
                    success: true,
                    message: "Project Counts",
                    data: {
                        assignedProjectCount,
                        completedProjectCount,
                        projectWaitingApprovalCount
                    }
                });
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "No Projects Found on your dashboard"
                });
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Technician not found"
            });
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        });
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
                    message: "project details",
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
        let { projectID, date, startTime, endTime, comments, attachment, lunchtime } = req.body
        const { error } = createTimesheetSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        await connection.query("BEGIN")
        let s0 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s0)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s0 = dbScript(db_sql['Q45'], { var1: projectID })
            let findProjectDetails = await connection.query(s0)
            let s2 = dbScript(db_sql['Q32'], { var1: projectID, var2: id, var3: date, var4: startTime, var5: endTime, var6: mysql_real_escape_string(comments), var7: findProjectDetails.rows[0].manager_id, var8: lunchtime })
            let createTimeSheet = await connection.query(s2)
            if (createTimeSheet.rowCount > 0) {
                if (attachment.length > 0) {
                    for (let files of attachment) {
                        let s3 = dbScript(db_sql['Q34'], { var1: projectID, var2: id, var3: files.path, var4: files.mimetype, var5: files.size, var6: createTimeSheet.rows[0].id })
                        let uploadAttach = await connection.query(s3)
                    }
                }
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
        let fileDetails = [];
        // Iterate through the uploaded files and gather their details
        for (const file of files) {
            let path = `${process.env.TIMESHEET_ATTACHEMENTS}/${file.filename}`;
            let size = file.size;
            let mimetype = file.mimetype;
            let originalName = file.originalname;
            fileDetails.push({ path, size, mimetype, originalName });
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

            let s3 = dbScript(db_sql['Q54'], { var1: true, var2: projectId, var3: false })
            let updateProject = await connection.query(s3)

            let s4 = dbScript(db_sql['Q90'], { var1: true, var2: projectId, var3: id })
            let updateSignedPaper = await connection.query(s4)
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
        let { projectId, timeSheetId } = req.query
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q52'], { var1: _dt, var2: projectId, var3: id, var4: timeSheetId })
            let deleteTimesheet = await connection.query(s2)
            let s3 = dbScript(db_sql['Q53'], { var1: _dt, var2: projectId, var3: id, var4: timeSheetId })
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

//for manager
module.exports.deleteTechnician = async (req, res) => {
    try {
        let { id, position } = req.user;
        let { techId } = req.query
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id });
        let findManager = await connection.query(s1);
        if (findManager.rowCount > 0 && position === 'Manager') {
            let s2 = dbScript(db_sql['Q77'], { var1: techId });
            let findProject = await connection.query(s2);
            let _dt = new Date().toISOString()
            if (findProject.rowCount > 0) {
                const canDeleteTechnician = findProject.rows.some(project => project.is_completed === false);

                if (canDeleteTechnician) {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Can not delete technician since he is currently assigned to a project",
                    });
                } else {

                    let s3 = dbScript(db_sql['Q78'], { var1: 'technician', var2: _dt, var3: techId });
                    let deleteTechnician = await connection.query(s3);

                    let s4 = dbScript(db_sql['Q78'], { var1: 'tech_documents', var2: _dt, var3: techId });
                    let deleteTecDocs = await connection.query(s4);

                    let s5 = dbScript(db_sql['Q78'], { var1: 'tech_machine', var2: _dt, var3: techId });
                    let deleteTechMachine = await connection.query(s5);

                    let s6 = dbScript(db_sql['Q78'], { var1: 'timesheet', var2: _dt, var3: techId });
                    let deleteTimesheet = await connection.query(s6);

                    let s7 = dbScript(db_sql['Q78'], { var1: 'timesheet_attach', var2: _dt, var3: techId });
                    let deleteTimesheetAttach = await connection.query(s7);

                    let s8 = dbScript(db_sql['Q78'], { var1: 'project_report', var2: _dt, var3: techId });
                    let deleteReport = await connection.query(s8);

                    let s9 = dbScript(db_sql['Q78'], { var1: 'report_attach', var2: _dt, var3: techId });
                    let deleteReportAttach = await connection.query(s9);

                    if (deleteTechnician.rowCount > 0) {
                        await connection.query("COMMIT")
                        res.json({
                            status: 200,
                            success: true,
                            message: "technician deleted successfully",
                        });
                    } else {
                        await connection.query("ROLLBACK")
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong.",
                        });
                    }

                }
            } else {
                let s3 = dbScript(db_sql['Q78'], { var1: 'technician', var2: _dt, var3: techId });
                let deleteTechnician = await connection.query(s3);

                let s4 = dbScript(db_sql['Q78'], { var1: 'tech_documents', var2: _dt, var3: techId });
                let deleteTecDocs = await connection.query(s4);

                let s5 = dbScript(db_sql['Q78'], { var1: 'tech_machine', var2: _dt, var3: techId });
                let deleteTechMachine = await connection.query(s5);

                let s6 = dbScript(db_sql['Q78'], { var1: 'timesheet', var2: _dt, var3: techId });
                let deleteTimesheet = await connection.query(s6);

                let s7 = dbScript(db_sql['Q78'], { var1: 'timesheet_attach', var2: _dt, var3: techId });
                let deleteTimesheetAttach = await connection.query(s7);

                let s8 = dbScript(db_sql['Q78'], { var1: 'project_report', var2: _dt, var3: techId });
                let deleteReport = await connection.query(s8);

                let s9 = dbScript(db_sql['Q78'], { var1: 'report_attach', var2: _dt, var3: techId });
                let deleteReportAttach = await connection.query(s9);

                if (deleteTechnician.rowCount > 0) {
                    await connection.query("COMMIT")
                    res.json({
                        status: 200,
                        success: true,
                        message: "technician deleted successfully",
                    });
                } else {
                    await connection.query("ROLLBACK")
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong.",
                    });
                }
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Manager not found",
            });
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

module.exports.uploadAgreement = async (req, res) => {
    try {
        let { id, position } = req.user;
        let { projectId } = req.query;
        let files = req.files;  // Use req.files to access multiple files
        let paths = [];

        await connection.query('BEGIN');

        let s0 = dbScript(db_sql['Q27'], { var1: id });
        let findTechnician = await connection.query(s0);

        if (findTechnician.rowCount > 0 && position === 'Technician') {
            for (let file of files) {

                let path = `${process.env.SIGNED_AGREEMENT}/${file.filename}`;
                let s1 = dbScript(db_sql['Q83'], {
                    var1: projectId,
                    var2: id,
                    var3: findTechnician.rows[0].manager_id,
                    var4: path,
                    var5: file.mimetype,
                    var6: file.size,
                    var7: file.originalname
                });

                let uploadPaper = await connection.query(s1);

                if (uploadPaper.rowCount > 0) {
                    paths.push(path);
                }
            }

            await connection.query('COMMIT');
            res.json({
                status: 201,
                success: true,
                message: 'Papers Uploaded successfully!',
                data: paths,
            });
        } else {
            res.json({
                status: 404,
                success: false,
                message: 'Technician not found',
            });
        }
    } catch (error) {
        await connection.query('ROLLBACK');
        res.json({
            status: 400,
            success: false,
            message: error.message,
        });
    }
};

module.exports.showSignedPaper = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == 'Technician') {
            let s2 = dbScript(db_sql['Q84'], { var1: projectId, var2: id, var3: findTechnician.rows[0].manager_id })
            let showPaper = await connection.query(s2)
            if (showPaper.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: `Signed paper`,
                    data: showPaper.rows
                })
            } else {
                return res.json({
                    status: 200,
                    success: false,
                    message: `No attachement found`,
                    data: []
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "technician not found"
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

module.exports.deleteSignedPaper = async (req, res) => {
    try {

        let { id, position } = req.user
        let { projectId, paperId } = req.query
        await connection.query("BEGIN")
        let s0 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s0)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let _dt = new Date().toISOString()
            let s1 = dbScript(db_sql['Q85'], { var1: _dt, var2: id, var3: projectId, var4: paperId })
            let deleteFile = await connection.query(s1)
            if (deleteFile.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Signed Paper deleted successfully"
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
        })
    }
}


