const nodemailer = require("nodemailer");
const welcomeTemplate = require('../templates/welcome')
const adminNotificationTemplate = require('../templates/adminNotification')
const managerNotificationTemplate = require('../templates/managerNotification');
const resetPassTemplate = require("../templates/resetPassword");
const projectNotificationTemplate = require("../templates/projectNotification");

module.exports.welcomeEmail2 = async (email, link, otp, userName) => {
    const smtpEndpoint = 'smtp.titan.email';
    const port = 465;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let welcomeTemp = welcomeTemplate.welcome(link, userName, otp)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    var subject = "Welcome to FSE";
    var body_text = `Please use the below OTP to activate your account`;


    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: (port == 465) ? true : false,
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });

    // Specify the fields in the email.
    let mailOptions = {
        from: senderAddress,
        to: toAddresses,
        subject: subject,
        cc: ccAddresses,
        bcc: bccAddresses,
        text: body_text,
        html: welcomeTemp,
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.notificationMailToAdmin = async (userData) => {
    const smtpEndpoint = "smtp.titan.email";
    const port = 465;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = 'admin@fseworks.com';
    let welcomeTemp = adminNotificationTemplate.adminNotification(userData)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    var subject = "Manager Approval Mail to Admin";
    var body_text = `Please verify Approval request for manager account Given Below are the details of manager`;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: (port == 465) ? true : false,
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });
    let mailOptions = {
        from: senderAddress,
        to: toAddresses,
        subject: subject,
        cc: ccAddresses,
        bcc: bccAddresses,
        text: body_text,
        html: welcomeTemp,
        headers: {}
    };

    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.notificationMailToManager = async (userData) => {
    const smtpEndpoint = "smtp.titan.email";
    const port = 465;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = userData.email_address;
    let welcomeTemp = managerNotificationTemplate.managerNotification(userData)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    var subject = "Account approved Successfully";
    var body_text = `Your account has been approved successfully from ASE Team`;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: (port == 465) ? true : false,
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });

    let mailOptions = {
        from: senderAddress,
        to: toAddresses,
        subject: subject,
        cc: ccAddresses,
        bcc: bccAddresses,
        text: body_text,
        html: welcomeTemp,
        headers: {}
    };

    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.resetPasswordMail = async (email, otp, userName) => {
    const smtpEndpoint = "smtp.titan.email";
    const port = 465;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let resetPass = resetPassTemplate.resetPassword(otp, email, userName)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    var subject = "Reset password";
    var body_text = `Please use the below link to reset your password`;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: (port == 465) ? true : false,
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });

    let mailOptions = {
        from: senderAddress,
        to: toAddresses,
        subject: subject,
        cc: ccAddresses,
        bcc: bccAddresses,
        text: body_text,
        html: resetPass,
        headers: {}
    };

    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.sendProjectNotificationEmail = async (emails, data) => {
    const smtpEndpoint = "smtp.titan.email"
    const port = 465
    const senderAddress = data.manager_email_address;
    let toAddresses = emails;

    let sendEmail = projectNotificationTemplate.projectNotification(data)


    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    let subject = "New Project assignment";
    var body_text = `New Project Assignment`;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: (port == 465) ? true : false,
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });

    let mailOptions = {
        from: senderAddress,
        to: toAddresses,
        subject: subject,
        text: body_text,
        html: sendEmail,
        headers: {}
    };

    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.sendprojectDetails = async (emails, pdfData) => {
    const smtpEndpoint = "smtp.titan.email"
    const port = 465
    const senderAddress = process.env.SMTP_USERNAME;
    let toAddresses = emails;

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    let subject = "Project Details";

    var body_text = `Project Details`;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: (port == 465) ? true : false,
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });

    let mailOptions = {
        from: senderAddress,
        to: toAddresses,
        subject: subject,
        text: body_text,
        attachments: [
            {
                filename: 'project_details.pdf',
                content: pdfData,
            },
        ],
        headers: {}
    };

    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}