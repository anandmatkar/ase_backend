const jsonwebtoken = require("jsonwebtoken");
const { PDFDocument, rgb } = require('pdf-lib');


module.exports.mysql_real_escape_string = (str) => {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return " ";
            case "\r":
                return "\\r";
            case "\"":
                return "\"" + char;
            case "'":
                return "'" + char;
            case "\\":
                return "'" + char;
            case "%":
                return "\%"; // prepends a backslash to backslash, percent,
            // and double/single quotes
        }
    })
}

module.exports.verifyTokenFn = async (req) => {
    let token = req.body && req.body.token ? req.body.token : req.headers.authorization
    let user = jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
        if (err) {
            return 0
        } else {
            var decoded = {
                id: decoded.id,
                email: decoded.email,
            };
            return decoded;
        }
    });
    return user
}


module.exports.createPDF = async (data) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]); // Create the first page
    const { width, height } = page.getSize();

    const addPageAndDrawText = (text, yOffset) => {
        const newPage = pdfDoc.addPage([width, height]);
        newPage.drawText(text, {
            x: 50,
            y: height - 50,
            size: 20,
            color: rgb(0, 0, 0),
        });
        return newPage;
    };

    data.forEach((order) => {
        let yOffset = height - 100;
        let page = addPageAndDrawText('Order Details:', yOffset);

        function addDataToPage(data) {
            console.log(data, "data")
            if (typeof data === 'object') {
                Object.keys(data).forEach((key) => {
                    yOffset -= 20;
                    if (yOffset < 50) {
                        page = addPageAndDrawText('Continued...', height - 100);
                        yOffset = height - 100;
                    }
                    page.drawText(`${key}:`, {
                        x: 50,
                        y: yOffset,
                        size: 14,
                        color: rgb(0, 0, 0),
                    });
                    addDataToPage(data[key]);
                });
            } else {
                if (yOffset < 50) {
                    page = addPageAndDrawText('Continued...', height - 100);
                    yOffset = height - 100;
                }
                page.drawText(data, {
                    x: 150,
                    y: yOffset,
                    size: 14,
                    color: rgb(0, 0, 0),
                });
            }
        }

        addDataToPage(order);
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};


// module.exports.createPDF = async(data) => {
//     const pdfDoc = await PDFDocument.create();
//     const { width, height } = pdfDoc.addPage([600, 400]).getSize();

//     const addPageAndDrawText = (text, yOffset) => {
//         const page = pdfDoc.addPage([width, height]);
//         page.drawText(text, {
//             x: 50,
//             y: height - 50,
//             size: 20,
//             color: rgb(0, 0, 0),
//         });
//         return page;
//     };

//     function createTimesheetTable(timesheet, page, yOffset) {
//         const table = page.createTable(timesheet.length + 1, 6).setWidths([100, 100, 100, 100, 100, 100]);
        
//         table.getCell(0, 0).setText('DATE');
//         table.getCell(0, 1).setText('CHECK_IN');
//         table.getCell(0, 2).setText('CHECK_OUT');
//         table.getCell(0, 3).setText('LUNCH_TIME');
//         table.getCell(0, 4).setText('COMMENTS');

//         timesheet.forEach((entry, index) => {
//             table.getCell(index + 1, 0).setText(entry.DATE);
//             table.getCell(index + 1, 1).setText(entry.CHECK_IN);
//             table.getCell(index + 1, 2).setText(entry.CHECK_OUT);
//             table.getCell(index + 1, 3).setText(entry.LUNCH_TIME);
//             table.getCell(index + 1, 4).setText(entry.COMMENTS);
//         });

//         table.setPosition(50, yOffset);
//     }

//     data.forEach((order) => {
//         let yOffset = height - 100;
//         let page = addPageAndDrawText('Order Details:', yOffset);

//         function addDataToPage(data) {
//             if (typeof data === 'object') {
//                 Object.keys(data).forEach((key) => {
//                     yOffset -= 20;
//                     if (yOffset < 50) {
//                         page = addPageAndDrawText('Continued...', height - 100);
//                         yOffset = height - 100;
//                     }
//                     page.drawText(`${key}:`, {
//                         x: 50,
//                         y: yOffset,
//                         size: 14,
//                         color: rgb(0, 0, 0),
//                     });
//                     addDataToPage(data[key]);
//                 });
//             } else {
//                 if (yOffset < 50) {
//                     page = addPageAndDrawText('Continued...', height - 100);
//                     yOffset = height - 100;
//                 }
//                 page.drawText(data, {
//                     x: 150,
//                     y: yOffset,
//                     size: 14,
//                     color: rgb(0, 0, 0),
//                 });
//             }
//         }

//         if (order.technician_data[0].timesheet_data.length > 0) {
//             addPageAndDrawText('Timesheet Data:', yOffset);
//             yOffset -= 30;
//             createTimesheetTable(order.technician_data[0].timesheet_data, page, yOffset);
//         }

//         addDataToPage(order);
//     });

//     const pdfBytes = await pdfDoc.save();
//     return pdfBytes;
// }
