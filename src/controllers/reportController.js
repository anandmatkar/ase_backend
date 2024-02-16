const connection = require('../database/connection');
const { mysql_real_escape_string } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');


//Create Report by Technician
module.exports.createReport = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectID, date, description, attachment, duration, comments, machineID } = req.body

        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q48'], { var1: projectID, var2: id, var3: findTechnician.rows[0].manager_id, var4: date, var5: mysql_real_escape_string(description), var6: duration, var7: mysql_real_escape_string(comments), var8: machineID })
            let createReport = await connection.query(s2)
            if (createReport.rowCount > 0) {
                if (attachment.length > 0) {
                    for (let files of attachment) {
                        console.log(files, "filesssss");
                        let s3 = dbScript(db_sql['Q61'], { var1: projectID, var2: id, var3: files.path, var4: files.mimetype, var5: files.size, var6: createReport.rows[0].id })
                        console.log(s3, "s33333");
                        let createReportAttach = await connection.query(s3)
                        console.log(createReport.rows, "create report");
                    }
                }
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
        let { projectId, machineId } = req.query
        connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q49'], { var1: true, var2: projectId, var3: id, var4: machineId })
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
        let { projectId, techId, machineId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q67'], { var1: projectId, var2: techId, var3: machineId })
            console.log(s2, "s222");
            let reportDetails = await connection.query(s2)
            console.log(reportDetails.rows, "reportdetails");
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

module.exports.deleteReport = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, reportId } = req.query
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q62'], { var1: _dt, var2: projectId, var3: id, var4: reportId })
            let deleteReport = await connection.query(s2)
            let s3 = dbScript(db_sql['Q63'], { var1: _dt, var2: projectId, var3: id, var4: reportId })
            let deletereportAttach = await connection.query(s3)

            if (deleteReport.rowCount > 0) {
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
//validate report for manager
module.exports.validateReport = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, techId, machineId } = req.query

        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q51'], { var1: true, var2: false, var3: projectId, var4: techId, var5: machineId })
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

module.exports.reportDetailsForTech = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId, machineId } = req.query
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q67'], { var1: projectId, var2: id, var3: machineId })
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

module.exports.editReport = async (req, res) => {
    try {
        let { id, position } = req.user
        let { reportId, description, duration, comments, date } = req.body
        connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q87'], { var1: date, var2: duration, var3: mysql_real_escape_string(description), var4: mysql_real_escape_string(comments), var5: reportId })
            let updateReport = await connection.query(s2)
            if (updateReport.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    status: 200,
                    success: true,
                    message: "Report updated successfully"
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

module.exports.editReportDoc = async (req, res) => {
    try {
        let { id, position } = req.user;
        let { docId } = req.body;
        let file = req.file
        let path = `${process.env.REPORT_ATTACHEMENTS}/${file.filename}`;
        let size = file.size;
        let mimetype = file.mimetype;

        console.log(path, size, mimetype);

        await connection.query('BEGIN');

        let s0 = dbScript(db_sql['Q27'], { var1: id });
        let findTechnician = await connection.query(s0);

        if (findTechnician.rowCount > 0 && position === 'Technician') {
            let _dt = new Date().toISOString()
            let s1 = dbScript(db_sql['Q88'], { var1: path, var2: mimetype, var3: size, var4: _dt, var5: docId });
            let editDocs = await connection.query(s1);
            if (editDocs.rowCount > 0) {
                await connection.query('COMMIT');
                res.json({
                    status: 201,
                    success: true,
                    message: 'Papers Uploaded successfully!'
                });
            } else {
                await connection.query('ROLLBACK');
                res.json({
                    status: 400,
                    success: false,
                    message: 'Something Went Wrong!'
                });
            }

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

module.exports.showReportAttach = async (req, res) => {
    try {
        let { id, position } = req.user
        let { reportId } = req.query
        let s1 = dbScript(db_sql['Q27'], { var1: id })
        let findTechnician = await connection.query(s1)
        if (findTechnician.rowCount > 0 && position == "Technician") {
            let s2 = dbScript(db_sql['Q89'], { var1: reportId })
            let attachementList = await connection.query(s2)
            if (attachementList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Report Details.",
                    data: attachementList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Attachment Details.",
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

