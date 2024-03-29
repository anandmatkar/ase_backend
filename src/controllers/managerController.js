const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { welcomeEmail2, notificationMailToAdmin, resetPasswordMail } = require('../utils/sendMail');
const { managerCreationSchema, verifyManagerSchema, updateManagerSchema, managerChangePasswordSchema, editTechnicianSchema } = require('../utils/managerValidation');


module.exports.createManager = async (req, res) => {
    try {
        const { name, surname, company, position, emailAddress, password, phone, profilePic } = req.body;

        const { error } = managerCreationSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }

        // Check if the email already exists in the database
        const findManager = await connection.query(dbScript(db_sql['Q5'], { var1: emailAddress.toLowerCase() }));

        if (findManager.rowCount > 0) {
            return res.json({
                status: 409,
                success: false,
                message: "Email already exists",
                data: ""
            });
        }

        // Hash the password asynchronously
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Use transactions for database operations
        await connection.query("BEGIN");
        let otp = Math.floor(1000 + Math.random() * 9000);
        // Insert the manager data into the database
        const insertManager = await connection.query(
            dbScript(db_sql['Q6'], {
                var1: mysql_real_escape_string(name),
                var2: mysql_real_escape_string(surname),
                var3: mysql_real_escape_string(company),
                var4: mysql_real_escape_string(position),
                var5: mysql_real_escape_string(emailAddress),
                var6: encryptedPassword,
                var7: phone,
                var8: 0,
                var9: profilePic || process.env.DEFAULT_PROFILE_PIC_MANAGER,
                var10: otp
            })
        );

        if (insertManager.rowCount > 0) {
            // Commit the transaction
            await connection.query('COMMIT');

            // Send the email in the background
            // const token = await issueJWT(insertManager.rows[0], 'Manager');
            const link = `http://3.110.86.245/verifyManager`;


            welcomeEmail2(emailAddress, link, otp, name);

            return res.json({
                status: 201,
                success: true,
                message: `Manager Created Successfully and verification OTP sent to ${emailAddress.toLowerCase()}`,
            });
        } else {
            await connection.query("ROLLBACK");
            return res.json({
                status: 400,
                success: false,
                message: "Something went wrong"
            });
        }
    } catch (error) {
        await connection.query("ROLLBACK");
        res.json({
            status: 400,
            success: false,
            message: error.message
        });
    }
};

// module.exports.verifyManager = async (req, res) => {
//     try {
//         let user = await verifyTokenFn(req)
//         if (user) {
//             let s1 = dbScript(db_sql['Q7'], { var1: user.id })
//             let checkuser = await connection.query(s1)
//             if (checkuser.rows.length > 0) {
//                 await connection.query('BEGIN')
//                 let _dt = new Date().toISOString();
//                 let s2 = dbScript(db_sql['Q4'], { var1: 1, var2: user.id, var3: _dt })
//                 let updateuser = await connection.query(s2)
//                 if (updateuser.rowCount == 1) {
//                     await connection.query('COMMIT')
//                     notificationMailToAdmin(updateuser.rows[0])
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "User verified Successfully"
//                     })
//                 } else {
//                     await connection.query('ROLLBACK')
//                     res.json({
//                         status: 400,
//                         success: false,
//                         message: "Something went wrong"
//                     })
//                 }
//             } else {
//                 res.json({
//                     status: 404,
//                     success: false,
//                     message: "This User Is Not Exits"
//                 })
//             }
//         } else {
//             res.json({
//                 status: 400,
//                 success: false,
//                 message: "Token not found OR Invalid Token",
//             });
//         }
//     } catch (error) {
//         await connection.query('ROLLBACK')
//         res.json({
//             success: false,
//             status: 400,
//             message: error.message,
//             data: ""
//         })
//     }
// }

module.exports.verifyManager = async (req, res) => {
    try {
        let { email, otp } = req.body

        const { error } = verifyManagerSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        if (!otp) {
            res.json({
                status: 400,
                success: false,
                message: "Please provide OTP."
            })
        }
        let s1 = dbScript(db_sql['Q5'], { var1: email.toLowerCase() })
        let checkuser = await connection.query(s1)
        if (checkuser.rows.length > 0) {
            if (checkuser.rows[0].otp == otp) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q4'], { var1: 1, var2: checkuser.rows[0].id, var3: _dt })
                let updateuser = await connection.query(s2)
                if (updateuser.rowCount == 1) {
                    await connection.query('COMMIT')
                    notificationMailToAdmin(updateuser.rows[0])
                    res.json({
                        status: 200,
                        success: true,
                        message: "User verified Successfully"
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
                    message: "OTP is incorrect"
                })
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "This User Is Not Exits"
            })
        }

    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            success: false,
            status: 400,
            message: error.message,
            data: ""
        })
    }
}

module.exports.managerLogin = async (req, res) => {
    try {
        let { email, password } = req.body
        if (!email || !password) {
            res.json({
                status: 400,
                success: false,
                message: "Please Provide all credentials."
            })
        }
        let s1 = dbScript(db_sql['Q5'], { var1: mysql_real_escape_string(email.toLowerCase()) })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0) {
            if (findManager.rows[0].status != -1) {
                if (findManager.rows[0].status == 2) {
                    const result = await bcrypt.compare(password, findManager.rows[0].encrypted_password);
                    if (result) {
                        let jwtToken = await issueJWT(findManager.rows[0], "Manager");
                        res.send({
                            status: 200,
                            success: true,
                            message: "Login successfull",
                            data: {
                                token: jwtToken,
                                role: "Manager",
                                id: findManager.rows[0].id,
                                name: findManager.rows[0].name,
                                surname: findManager.rows[0].surname,
                                company: findManager.rows[0].company,
                                position: findManager.rows[0].position,
                                email_address: findManager.rows[0].email_address,
                                phone_number: findManager.rows[0].phone_number,
                                avatar: findManager.rows[0].avatar,
                                created_at: findManager.rows[0].created_at,
                                updated_at: findManager.rows[0].updated_at,
                                deleted_at: findManager.rows[0].deleted_at
                            }
                        });
                    } else {
                        res.json({
                            status: 401,
                            success: false,
                            message: "Incorrect Password"
                        })
                    }
                } else if (findManager.rows[0].status == 1) {
                    res.json({
                        status: 402,
                        success: false,
                        message: "Account is not approved yet. Please wait..."
                    })
                } else {
                    res.json({
                        status: 401,
                        success: false,
                        message: "Please verify your email address before logging in"
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "You are deactivated, please contact the administrator"
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
        return res.json({
            success: false,
            status: 400,
            message: error.message,
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

module.exports.showProfile = async (req, res) => {
    try {
        let { id, position } = req.user
        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q7'], { var1: id })
            let showProfile = await connection.query(s2)

            if (showProfile.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Manager Profile",
                    data: showProfile.rows[0]
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
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}

module.exports.updateProfile = async (req, res) => {
    try {
        let { id, position } = req.user
        let { name, surname, email_address, phone_number, profilePic } = req.body
        const { error } = updateManagerSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q7'], { var1: id });
        let findManager = await connection.query(s1)
        console.log(findManager.rows[0]);
        if (findManager.rowCount > 0 && position == 'Manager') {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q14'], {
                var1: mysql_real_escape_string(name),
                var2: mysql_real_escape_string(surname),
                var3: mysql_real_escape_string(email_address),
                var4: phone_number, var5: profilePic, var6: id, var7: _dt
            })
            let updateProfile = await connection.query(s2)

            if (updateProfile.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Profile Updated successfully"
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
                message: "Manager not found"
            })
        }

    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 500,
            success: false,
            message: error.stack
        })
    }
}

module.exports.changePassword = async (req, res) => {
    try {
        let userEmail = req.user.email
        const { oldPassword, newPassword } = req.body;
        const { error } = managerChangePasswordSchema.validate(req.body); // Validate the request body
        if (error) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: error.details[0].message
            });
        }
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q5'], { var1: userEmail })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0) {
            const result = await bcrypt.compare(oldPassword, findManager.rows[0].encrypted_password);
            if (result) {
                const saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                const encryptedPassword = bcrypt.hashSync(newPassword, salt);
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q13'], { var1: encryptedPassword, var2: findManager.rows[0].id, var3: _dt })
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
        let s1 = dbScript(db_sql['Q5'], { var1: mysql_real_escape_string(emailAddress.toLowerCase()) })
        let findManager = await connection.query(s1);
        if (findManager.rows.length > 0) {
            await connection.query("BEGIN")
            let otp = Math.floor(1000 + Math.random() * 9000);
            let s2 = dbScript(db_sql['Q56'], { var1: otp, var2: findManager.rows[0].id })
            let updateOtp = await connection.query(s2);
            if (updateOtp.rowCount > 0) {
                await connection.query("COMMIT")
                await resetPasswordMail(emailAddress.toLowerCase(), otp, findManager.rows[0].name);
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
            email,
            otp,
            password
        } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q5'], { var1: mysql_real_escape_string(email.toLowerCase()) })
        let findManager = await connection.query(s1);
        if (findManager.rows.length > 0) {
            if (findManager.rows[0].otp == otp) {
                const saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                const encryptedPassword = bcrypt.hashSync(password, salt);
                let _dt = new Date().toISOString();

                let s2 = dbScript(db_sql['Q13'], { var1: encryptedPassword, var2: findManager.rows[0].id, var3: _dt })
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

module.exports.uploadMachineFiles = async (req, res) => {
    try {
        let files = req.files;
        let fileDetails = [];

        // Iterate through the uploaded files and gather their details
        for (const file of files) {
            let path = `${process.env.MACHINE_ATTACHEMENTS}/${file.filename}`;
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
            message: error.message
        });
    }
};
//not used anywhere in project
module.exports.timesheetListsForApproval = async (req, res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q44'], { var1: id })
            let timesheetListTobeApproved = await connection.query(s2)
            if (timesheetListTobeApproved.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Timesheet list for approval",
                    data: timesheetListTobeApproved.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Timesheet list for approval",
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

module.exports.timesheetDetails = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, techId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q64'], { var1: techId, var2: projectId })
            let timesheetListTobeApproved = await connection.query(s2)
            if (timesheetListTobeApproved.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Timesheet Details",
                    data: timesheetListTobeApproved.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Timesheet",
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

module.exports.acceptTimesheetRequest = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, techId } = req.query

        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s0 = dbScript(db_sql['Q84'], { var1: projectId, var2: techId, var3: id })
            let findAttactSignedPaper = await connection.query(s0)

            if (findAttactSignedPaper.rowCount > 0) {
                let s2 = dbScript(db_sql['Q46'], { var1: true, var2: false, var3: projectId, var4: techId, var5: id })
                let updateApprovalStatus = await connection.query(s2)

                let s3 = dbScript(db_sql['Q91'], { var1: true, var2: false, var3: projectId, var4: techId, var5: id })
                let approveSignedPaper = await connection.query(s3)

                if (updateApprovalStatus.rowCount > 0) {
                    await connection.query("COMMIT")
                    res.json({
                        status: 200,
                        success: true,
                        message: "Timesheet approved successfully"
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
                await connection.query("ROLLBACK")
                res.json({
                    status: 400,
                    success: false,
                    message: 'Can not approve unless signed paper uploaded by technician'
                });
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

module.exports.disapproveTimeSheet = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, techId } = req.query

        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q46'], { var1: false, var2: false, var3: projectId, var4: techId, var5: id })
            let updateApprovalStatus = await connection.query(s2)
            if (updateApprovalStatus.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Timesheet rejected successfully"
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

//technicianDetails for manager
module.exports.technicianDetailsForManager = async (req, res) => {
    try {
        let { id } = req.user
        let { techId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0) {
            let s2 = dbScript(db_sql['Q66'], { var1: techId })
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

module.exports.showSignedPaper = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, techId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q84'], { var1: projectId, var2: techId, var3: id })
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

//only for Manager
module.exports.editTechnician = async (req, res) => {
    try {
        let { id, position } = req.user
        let { techId, name, surname, email_address, phone_number, nationality, qualification, level, avatar } = req.body
        const { error } = editTechnicianSchema.validate(req.body); // Validate the request body
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
            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q29'], { var1: mysql_real_escape_string(name), var2: mysql_real_escape_string(surname), var3: mysql_real_escape_string(email_address.toLowerCase()), var4: phone_number, var5: mysql_real_escape_string(nationality), var6: mysql_real_escape_string(qualification), var7: mysql_real_escape_string(level), var8: avatar, var9: _dt, var10: techId })
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
                message: "Manager not found"
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



