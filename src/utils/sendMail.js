const nodemailer = require("nodemailer");
const welcomeTemplate = require('../templates/welcome')
const adminNotificationTemplate = require('../templates/adminNotification')
const managerNotificationTemplate = require('../templates/managerNotification');
const resetPassTemplate = require("../templates/resetPassword");
const projectNotificationTemplate = require("../templates/projectNotification");

module.exports.welcomeEmail2 = async (email, link,otp, userName) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let welcomeTemp = welcomeTemplate.welcome(link, userName, otp)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Welcome to HiRise";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please use the below link to activate your account and reset your password`;

    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: false, // true for 465, false for other ports
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
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.notificationMailToAdmin = async (userData) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = 'aseadmin@yopmail.com';
    let welcomeTemp = adminNotificationTemplate.adminNotification(userData)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Manager Approval Mail to Admin";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please verify Approval request for manager account Given Below are the details of manager`;

    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: false, // true for 465, false for other ports
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
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.notificationMailToManager = async (userData) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = userData.email_address;
    let welcomeTemp = managerNotificationTemplate.managerNotification(userData)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Account approved Successfully";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Your account has been approved successfully from ASE Team`;

    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: false, // true for 465, false for other ports
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
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.resetPasswordMail = async (email, link, userName) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let resetPass = resetPassTemplate.resetPassword(link, email, userName)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Reset password";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please use the below link to reset your password`;

    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: false, // true for 465, false for other ports
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
        html: resetPass,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.sendProjectNotificationEmail = async (emails, data) => {
    console.log(emails, data, "in sendProjectNotificationEmail")
    const smtpEndpoint = "smtp.gmail.com"
    const senderAddress = data.manager_email_address;
    let toAddresses = emails;

    let sendEmail = projectNotificationTemplate.projectNotification(data)

    // let ccAddresses = (cc.length > 0) ? cc : "";
    // var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    let subject = "New Project assignment";
    // The email body for recipients with non-HTML email clients.
    var body_text = `New Project Assignment`;

    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;
    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: 587,
        secure: false, // true for 465, false for other ports
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
        text: body_text,
        html: sendEmail,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}