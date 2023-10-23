const connection = require('../database/connection');
const { mysql_real_escape_string, generateDynamicHtmlTemplate, createPDF } = require('../utils/helper')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { sendProjectNotificationEmail, sendprojectDetails } = require('../utils/sendMail');
const { PDFDocument, rgb } = require('pdf-lib');


//Create Project by Manager
module.exports.createProject = async (req, res) => {
    try {
        let { id, position, email } = req.user
        let { customerId, projectType, description, startDate, endDate, projectAttach, machineDetails } = req.body
        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q12'], { var1: id })
            let findProject = await connection.query(s2)

            let orderId = findProject.rowCount > 0 ? Number(findProject.rows[0].order_id) + 1 : 1

            let s3 = dbScript(db_sql['Q11'], { var1: orderId, var2: customerId, var3: mysql_real_escape_string(projectType), var4: mysql_real_escape_string(description), var5: startDate, var6: endDate, var7: id })
            let createProject = await connection.query(s3)

            if (projectAttach.length > 0) {
                for (let files of projectAttach) {
                    let s4 = dbScript(db_sql['Q17'], { var1: createProject.rows[0].id, var2: files.path, var3: files.mimetype, var4: files.size, var5: id })
                    let storeProjectAttach = await connection.query(s4)
                }
            }
            //Insert data into Machine table

            for (let data of machineDetails) {

                let s5 = dbScript(db_sql['Q15'], { var1: customerId, var2: createProject.rows[0].id, var3: createProject.rows[0].order_id, var4: mysql_real_escape_string(data.MachineType), var5: mysql_real_escape_string(data.MachineSerial), var6: mysql_real_escape_string(data.hourCount), var7: mysql_real_escape_string(data.nomSpeed), var8: mysql_real_escape_string(data.actSpeed), var9: mysql_real_escape_string(description), var10: id })
                let createMachine = await connection.query(s5)
                for (let techId of data.techIds) {
                    //Assign the machine to technicians
                    let s6 = dbScript(db_sql['Q16'], { var1: createProject.rows[0].id, var2: techId, var3: createMachine.rows[0].id, var4: id })
                    let assignTechToMachine = await connection.query(s6)
                }

                if (data.machineAttach.length > 0) {
                    //storing the machine attachments
                    for (let attach of data.machineAttach) {
                        let s7 = dbScript(db_sql['Q18'], { var1: createProject.rows[0].id, var2: createMachine.rows[0].id, var3: attach.path, var4: attach.mimetype, var5: attach.size, var6: id })
                        let storeMachineAttactements = await connection.query(s7)
                    }
                }
            }
            if (createProject.rowCount > 0) {
                await connection.query("COMMIT")
                this.sendProjectMail(createProject.rows[0].id)
                res.json({
                    status: 200,
                    success: true,
                    message: "Project created successfully",
                    data: createProject.rows
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
        await connection.query('ROLLBACK')
        res.json({
            success: false,
            status: 400,
            message: error.message,
        })
    }
}

module.exports.uploadProjectAttach = async (req, res) => {
    try {
        let files = req.files;
        let fileDetails = [];
        // Iterate through the uploaded files and gather their details
        for (const file of files) {
            let path = `${process.env.PROJECT_ATTACHEMENTS}/${file.filename}`;
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

module.exports.sendProjectMail = async (req, res) => {
    let s1 = dbScript(db_sql['Q47'], { var1: req })
    let selectProjectData = await connection.query(s1)

    if (selectProjectData.rowCount > 0) {
        let emailArr = []
        for (let data of selectProjectData.rows[0].technicians) {
            emailArr.push(data.email_address)
        }
        sendProjectNotificationEmail(emailArr, selectProjectData.rows[0])

    }

}

//Project LIST for Manager
module.exports.projectList = async (req, res) => {
    try {
        let { id, position } = req.user
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q22'], { var1: id })
            let projectList = await connection.query(s2)
            if (projectList.rowCount > 0) {
                let completedProjects = []
                let projectInProgress = []
                let projectRequestedForApproval = []
                projectList.rows.forEach(row => {
                    if (row.is_completed == true && row.is_requested_for_approval == false) {
                        completedProjects.push(row)
                    } else if (row.is_completed == false && row.is_requested_for_approval == false) {
                        projectInProgress.push(row)
                    } else if (row.is_requested_for_approval == true) {
                        projectRequestedForApproval.push(row)
                    }
                })
                res.json({
                    status: 200,
                    success: true,
                    message: "Project List",
                    data: {
                        completedProjects,
                        projectInProgress,
                        projectRequestedForApproval
                    }
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty project list",
                    data: {}
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

module.exports.projectCount = async (req, res) => {
    try {
        let { id, position } = req.user;
        let s1 = dbScript(db_sql['Q7'], { var1: id });
        let findManager = await connection.query(s1);
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q22'], { var1: id });
            let projectList = await connection.query(s2);
            if (projectList.rowCount > 0) {
                let completedProjectsCount = 0;
                let projectInProgressCount = 0;
                let projectRequestedForApprovalCount = 0;

                projectList.rows.forEach(row => {
                    if (row.is_completed == true && row.is_requested_for_approval == false) {
                        completedProjectsCount++;
                    } else if (row.is_completed == false && row.is_requested_for_approval == false) {
                        projectInProgressCount++;
                    } else if (row.is_requested_for_approval == true) {
                        projectRequestedForApprovalCount++;
                    }
                });

                res.json({
                    status: 200,
                    success: true,
                    message: "Project Counts",
                    data: {
                        completedProjectsCount,
                        projectInProgressCount,
                        projectRequestedForApprovalCount
                    }
                });
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty project list",
                    data: {}
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
        res.json({
            success: false,
            status: 400,
            message: error.message,
        });
    }
}

//Project Details for Manager
module.exports.projectDetails = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {
            let s2 = dbScript(db_sql['Q23'], { var1: projectId })
            let projectDetails = await connection.query(s2)
            if (projectDetails.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Project List",
                    data: projectDetails.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty project details",
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

module.exports.deleteProject = async (req, res) => {
    try {
        let { id, position } = req.user
        let { projectId } = req.query
        await connection.query("BEGIN")
        let s1 = dbScript(db_sql['Q7'], { var1: id })
        let findManager = await connection.query(s1)
        if (findManager.rowCount > 0 && position == 'Manager') {

            let s0 = dbScript(db_sql['Q45'], { var1: projectId })
            let findProject = await connection.query(s0)
            let _dt = new Date().toISOString()
            console.log(findProject.rows[0].start_date <= _dt);
            if (findProject.rows[0].is_completed == false && findProject.rows[0].start_date <= _dt) {
                return res.json({
                    status: 400,
                    success: false,
                    message: "Can not delete project since project is under progress."
                })
            }
            else {
                let s2 = dbScript(db_sql['Q37'], { var1: _dt, var2: projectId })
                let deleteProjectDetails = await connection.query(s2)

                let s3 = dbScript(db_sql['Q38'], { var1: _dt, var2: projectId })
                let deleteProjectAttach = await connection.query(s3)

                let s4 = dbScript(db_sql['Q39'], { var1: _dt, var2: projectId })
                let deleteMachine = await connection.query(s4)

                let s5 = dbScript(db_sql['Q40'], { var1: _dt, var2: projectId })
                let deleteMachineAttach = await connection.query(s5)

                let s6 = dbScript(db_sql['Q41'], { var1: _dt, var2: projectId })
                let deleteTimesheet = await connection.query(s6)

                let s7 = dbScript(db_sql['Q42'], { var1: 'timesheet_attach', var2: _dt, var3: projectId })
                let deleteTimesheetAttach = await connection.query(s7)
                if (deleteProjectDetails.rowCount > 0) {
                    await connection.query("COMMIT")
                    res.json({
                        status: 200,
                        success: true,
                        message: "Project deleted successfully."
                    })
                } else {
                    await connection.query("ROLLBACK")
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong."
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
        await connection.query("ROLLBACK")
        res.json({
            success: false,
            status: 400,
            message: error.stack,
        })
    }
}

module.exports.completeProject = async (req, res) => {
    let { id, position } = req.user
    let { projectId } = req.query
    await connection.query("BEGIN")
    let s1 = dbScript(db_sql['Q7'], { var1: id })
    let findManager = await connection.query(s1)
    if (findManager.rowCount > 0 && position == 'Manager') {
        let _dt = new Date().toISOString()
        let s2 = dbScript(db_sql['Q75'], { var1: true, var2: false, var3: _dt, var4: projectId })
        let approveProject = await connection.query(s2)

        let s3 = dbScript(db_sql['Q79'], { var1: true, var2: false, var3: _dt, var4: projectId })
        let approveTimesheet = await connection.query(s3)

        let s4 = dbScript(db_sql['Q80'], { var1: true, var2: false, var3: _dt, var4: projectId })
        let approveReport = await connection.query(s4)
        if (approveProject.rowCount > 0) {
            await connection.query("COMMIT")

            let s3 = dbScript(db_sql['Q76'], { var1: projectId });
            let projectDetails = await connection.query(s3);

            let pdfBytes = await createPDF(projectDetails.rows)
            sendprojectDetails(findManager.rows[0].email_address, pdfBytes)
            res.json({
                status: 200,
                success: true,
                message: "Project approved successfully.",
                data: projectDetails.rows
            })
        } else {
            await connection.query("ROLLBACK")
            res.json({
                status: 400,
                success: false,
                message: "Something went wrong."
            })
        }
    } else {
        await connection.query("ROLLBACK")
        res.json({
            status: 404,
            success: false,
            message: "Manager not found"
        })
    }
}



