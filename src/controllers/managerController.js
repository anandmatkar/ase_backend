const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string, verifyTokenFn } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { welcomeEmail2, notificationMailToAdmin, resetPasswordMail } = require('../utils/sendMail');


module.exports.createManager = async (req, res) => {
    try {
        let { name, surname, company, position, emailAddress, password, phone } = req.body
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q5'], { var1: emailAddress })
        let findManager = await connection.query(s1)
        if (findManager.rowCount == 0) {
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const encryptedPassword = bcrypt.hashSync(password, salt);

            let s2 = dbScript(db_sql['Q6'], { var1: mysql_real_escape_string(name), var2: mysql_real_escape_string(surname), var3: mysql_real_escape_string(company), var4: mysql_real_escape_string(position), var5: mysql_real_escape_string(emailAddress), var6: encryptedPassword, var7: phone, var8: 0 })
            let insertManager = await connection.query(s2)
            if (insertManager.rowCount > 0) {
                await connection.query('COMMIT')
                let token = await issueJWT(insertManager.rows[0], 'Manager')
                link = `${process.env.AUTH_LINK}/verify-email/${token}`
                await welcomeEmail2(emailAddress, link, name);
                await connection.query('COMMIT')
                return res.json({
                    status: 201,
                    success: true,
                    message: ` Manager Created Successfully and verification link send on ${emailAddress.toLowerCase()} `,
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
                status: 200,
                success: false,
                message: "Email already exists",
                data: ""
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

module.exports.verifyManager = async (req, res) => {
    try {
        let user = await verifyTokenFn(req)
        await connection.query('BEGIN')
        if (user) {
            let s1 = dbScript(db_sql['Q7'], { var1: user.id })
            let checkuser = await connection.query(s1)
            if (checkuser.rows.length > 0) {
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q4'], { var1: 1, var2: user.id, var3: _dt })
                let updateuser = await connection.query(s2)
                if (updateuser.rowCount == 1) {
                    await connection.query('COMMIT')
                    await notificationMailToAdmin(updateuser.rows[0])
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
                    message: "This User Is Not Exits"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Token not found OR Invalid Token",
            });
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
        let s1 = dbScript(db_sql['Q5'], { var1: email })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0) {
            if (findManager.rows[0].status == 2) {
                const result = await bcrypt.compare(password, findManager.rows[0].encrypted_password);
                if (result) {
                    let jwtToken = await issueJWT(findManager.rows[0], "Manager");
                    res.send({
                        status: 200,
                        success: true,
                        message: "Login successfull",
                        data: {
                            token: jwtToken
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
                    status: 200,
                    success: false,
                    message: "Account is not approved yet. Please wait..."
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Please verify your email address before logging in"
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

module.exports.changePassword = async (req, res) => {
    try {
        let userEmail = req.user.email
        const { oldPassword, newPassword } = req.body;
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
                status: 400,
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
        let s1 = dbScript(db_sql['Q5'], { var1: mysql_real_escape_string(emailAddress) })
        let findManager = await connection.query(s1);
        if (findManager.rows.length > 0) {
            let token = await issueJWT(findManager.rows[0], 'Manager')
            let link = `${process.env.AUTH_LINK}/reset-password/${token}`
            await resetPasswordMail(emailAddress, link, findManager.rows[0].name);
            res.json({
                status: 200,
                success: true,
                message: `Password reset link has sent on your registered ${emailAddress} account`,
            })
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
            password
        } = req.body
        await connection.query('BEGIN')
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q7'], { var1: user.id })
            let findManager = await connection.query(s1);
            if (findManager.rows.length > 0) {

                const saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                const encryptedPassword = bcrypt.hashSync(password, salt);
                let _dt = new Date().toISOString();

                let s2 = dbScript(db_sql['Q13'], { var1: encryptedPassword , var2: user.id, var3: _dt })
                let updatePassword = await connection.query(s2)

                if (updatePassword.rowCount == 1) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Password changed successfully",
                        data: ""
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong",
                        data: ""
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Token not found",
            });
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

module.exports.createCustomer = async (req, res) => {
    try {
        let { id, position } = req.user
        let { customerName, customerContactName, customerAccount, email, phone, country, city, address, scopeOfWork } = req.body
        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {

            let s2 = dbScript(db_sql['Q9'], { var1: mysql_real_escape_string(customerName), var2: mysql_real_escape_string(customerContactName), var3: customerAccount, var4: mysql_real_escape_string(email), var5: phone, var6: mysql_real_escape_string(country), var7: mysql_real_escape_string(city), var8: mysql_real_escape_string(address), var9: mysql_real_escape_string(scopeOfWork), var10: id })
            let createCustomer = await connection.query(s2)

            if (createCustomer.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Customer created successfully"
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
            message: error.message,
        })
    }
}

module.exports.customerList = async (req, res) => {
    try {
        let { id, position } = req.user

        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)

        if (findManager.rowCount > 0 && position == 'Manager') {
            let s1 = dbScript(db_sql['Q10'], { var1: id })
            let customerList = await connection.query(s1)

            if (customerList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Customer List",
                    data: customerList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Customer List"
                })
            }
        }
        else {
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

module.exports.createProject = async (req, res) => {
    try {
        let { id, position } = req.user
        let { customerId, projectType, description, startDate, endDate } = req.body
        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s3 = dbScript(db_sql['Q12'], {})
            let findProject = await connection.query(s3)

            let orderId = findProject.rowCount > 0 ? findProject.rows[0].id + 1 : 1
            console.log(orderId)
            let s2 = dbScript(db_sql['Q11'], { var1: orderId, var2: customerId, var3: mysql_real_escape_string(projectType), var4: mysql_real_escape_string(description), var6: startDate, var7: endDate })
            let createProject = await connection.query(s2)
            if (createProject.rowCount > 0) {
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
            message: error.message,
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
            message: error.message,
            data: []
        });
    }
};

