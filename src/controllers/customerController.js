const connection = require('../database/connection');
const { issueJWT } = require("../utils/jwt")
const { mysql_real_escape_string, verifyTokenFn } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const bcrypt = require('bcrypt');
const { welcomeEmail2, notificationMailToAdmin, resetPasswordMail, sendProjectNotificationEmail } = require('../utils/sendMail');
const XLSX = require('xlsx');

module.exports.createCustomer = async (req, res) => {
    try {
        let { id, position } = req.user
        let { customerName, customerContactName, customerAccount, email, phone, country, city, address, scopeOfWork } = req.body
        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q57'], { var1: email })
            let findCustomer = await connection.query(s2)
            if (findCustomer.rowCount == 0) {
                let s3 = dbScript(db_sql['Q9'], { var1: mysql_real_escape_string(customerName), var2: mysql_real_escape_string(customerContactName), var3: customerAccount, var4: mysql_real_escape_string(email), var5: phone, var6: mysql_real_escape_string(country), var7: mysql_real_escape_string(city), var8: mysql_real_escape_string(address), var9: mysql_real_escape_string(scopeOfWork), var10: id })
                let createCustomer = await connection.query(s3)

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
                    message: "Email address is already Exists"
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

module.exports.customerDetails = async (req, res) => {
    try {
        let { id, position } = req.user
        let { customerId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q20'], { var1: customerId })
            let customerDetails = await connection.query(s2)
            if (customerDetails.rowCount > 0) {
                res.json({
                    status: 201,
                    success: true,
                    message: "Customer Details",
                    data: customerDetails.rows[0]
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
            success: false,
            status: 400,
            message: error.message,
        })
    }
}

module.exports.updateCustomer = async (req, res) => {
    try {
        let { id, position } = req.user;
        let {
            customer_id,
            customer_name,
            customer_contact,
            customer_account,
            email_address,
            phone_number,
            country,
            city,
            address,
            scope_of_work,
        } = req.body;
        await connection.query('BEGIN');

        let s1 = dbScript(db_sql['Q7'], { var1: id });
        let findManager = await connection.query(s1);
        if (findManager.rowCount > 0 && position == 'Manager') {
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q19'], {
                var1: mysql_real_escape_string(customer_name),
                var2: mysql_real_escape_string(customer_contact),
                var3: customer_account,
                var4: mysql_real_escape_string(email_address),
                var5: phone_number,
                var6: mysql_real_escape_string(country),
                var7: mysql_real_escape_string(city),
                var8: mysql_real_escape_string(address),
                var9: mysql_real_escape_string(scope_of_work),
                var10: _dt,
                var11: customer_id,
            });
            let updateCustomer = await connection.query(s2);

            if (updateCustomer.rowCount > 0) {
                await connection.query('COMMIT');
                res.json({
                    status: 200,
                    success: true,
                    message: 'Customer updated successfully',
                });
            } else {
                await connection.query('ROLLBACK');
                res.json({
                    status: 400,
                    success: false,
                    message: 'Something went wrong',
                });
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: 'Manager not found',
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
};

module.exports.deleteCustomer = async (req, res) => {
    try {
        let { id, position } = req.user
        let { customerId } = req.query
        await connection.query("BEGIN")
        let s0 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s0)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s1 = dbScript(db_sql['Q43'], { var1: customerId })
            let findProject = await connection.query(s1)
            if (findProject.rowCount > 0) {
                let isInProgress = false;

                for (let project of findProject.rows) {
                    if (project.is_completed === false) {
                        isInProgress = true;
                        break; // Exit the loop as soon as we find a project in progress
                    }
                }
                if (isInProgress) {
                    res.json({
                        status: 409,
                        success: true,
                        message: "Can not delete customer because a project is already in progress"
                    });
                } else {
                    for (let project of findProject.rows) {
                        let _dt = new Date().toISOString()
                        let s2 = dbScript(db_sql['Q21'], { var1: _dt, var2: customerId })
                        let deleteCustomer = await connection.query(s2)

                        let s3 = dbScript(db_sql['Q37'], { var1: _dt, var2: project.id })
                        let deleteProjectDetails = await connection.query(s3)

                        let s4 = dbScript(db_sql['Q38'], { var1: _dt, var2: project.id })
                        let deleteProjectAttach = await connection.query(s4)

                        let s5 = dbScript(db_sql['Q39'], { var1: _dt, var2: project.id })
                        let deleteMachine = await connection.query(s5)

                        let s6 = dbScript(db_sql['Q40'], { var1: _dt, var2: project.id })
                        let deleteMachineAttach = await connection.query(s6)

                        let s7 = dbScript(db_sql['Q41'], { var1: _dt, var2: project.id })
                        let deleteTimesheet = await connection.query(s7)

                        let s8 = dbScript(db_sql['Q42'], { var1: 'timesheet_attach', var2: _dt, var3: project.id })
                        let deleteTimesheetAttach = await connection.query(s8)

                        let s9 = dbScript(db_sql['Q42'], { var1: 'tech_machine', var2: _dt, var3: project.id })
                        let deleteTechMachine = await connection.query(s9)
                    
                        let s10 = dbScript(db_sql['Q42'], { var1: 'project_report', var2: _dt, var3: project.id })
                        let deleteReport = await connection.query(s10)
                        
                        let s11 = dbScript(db_sql['Q42'], { var1: 'report_attach', var2: _dt, var3: project.id })
                        let deleteReportAttach = await connection.query(s11)
                    }
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Customer deleted successfully"
                    })
                }
            } else {
                let _dt = new Date().toISOString()

                let s2 = dbScript(db_sql['Q21'], { var1: _dt, var2: customerId })
                let deleteCustomer = await connection.query(s2)
                if (deleteCustomer.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Customer deleted successfully"
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
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
            success: false,
            status: 400,
            message: error.stack,
        })
    }
}

module.exports.insertCustomer = async (req, res) => {
    try {
        let { id, position } = req.user;
        let s1 = dbScript(db_sql['Q7'], { var1: id });
        let findManager = await connection.query(s1);
        if (findManager.rowCount > 0 && position == 'Manager') {
            if (!req.file) {
                return res.status(400).send('No file was uploaded.');
            }

            const originalname = req.file.originalname;
            const fileExtension = originalname.split('.').pop().toLowerCase();
            
            if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
                return res.status(400).json({
                    success: false,
                    message: "Only Excel files can be uploaded"
                });
            }
            
            let file = req.file
            let path = file.path;
            let workbook = XLSX.readFile(path);
            let sheet_name_list = workbook.SheetNames;
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
                    'Customer Name': customerName,
                    'Customer Contact': customerContactName,
                    'Account Number': customerAccount,
                    'Email Address': email,
                    'Phone Number': phone,
                    'Country': country,
                    'City': city,
                    'Address': address,
                    'Scope of Work': scopeOfWork,
                } = row;

                await connection.query("BEGIN");
                let s2 = dbScript(db_sql['Q57'], { var1: email });
                let findCustomer = await connection.query(s2);

                if (findCustomer.rowCount == 0) {
                    let s3 = dbScript(db_sql['Q9'], {
                        var1: mysql_real_escape_string(customerName),
                        var2: mysql_real_escape_string(customerContactName),
                        var3: customerAccount,
                        var4: mysql_real_escape_string(email),
                        var5: phone,
                        var6: mysql_real_escape_string(country),
                        var7: mysql_real_escape_string(city),
                        var8: mysql_real_escape_string(address),
                        var9: mysql_real_escape_string(scopeOfWork),
                        var10: id
                    });
                    let createCustomer = await connection.query(s3);
                } else {
                    duplicateEmails.push(email);
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
                    message: "Customers inserted successfully",
                });
            }
        } else {
            res.json({
                status: 404,
                success: false,
                message: "Manager not found"
            });
        }
    } catch (error) {
        await connection.query('ROLLBACK');
        res.json({
            success: false,
            status: 400,
            message: error.stack,
        });
    }
}



