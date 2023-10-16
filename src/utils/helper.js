const jsonwebtoken = require("jsonwebtoken");
const PDFDocument = require('pdfkit');
const pdfmake = require('pdfmake');

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

// module.exports.generatePDF = (projectData, callback) => {
//     const doc = new PDFDocument();
//     let pdfBuffer = [];

//     doc.on('data', chunk => {
//       pdfBuffer.push(chunk);
//     });

//     doc.on('end', () => {
//       const pdfData = Buffer.concat(pdfBuffer);
//       callback(pdfData);
//     });

//     const tableX = 50;
//     let initialY = 100;
//     const rowHeight = 30;

//     doc.font('Helvetica-Bold')
//        .text('Project Details', tableX, initialY);

//     doc.moveDown(0.5);
//     doc.font('Helvetica');

//     function formatData(data) {
//       for (const key in data) {
//         if (data.hasOwnProperty(key)) {
//           const value = data[key];

//           if (typeof value === 'object' && !Array.isArray(value)) {
//             doc.text(`${key}:`, tableX, doc.y);
//             doc.moveDown(0.5);
//             formatData(value);
//           } else if (Array.isArray(value)) {
//             if (value.length > 0) {
//               doc.text(`${key}:`, tableX, doc.y);
//               doc.moveDown(0.5);

//               // Create a table for array items
//               for (const item of value) {
//                 formatData(item);
//               }
//             }
//           } else {
//             doc.text(`${key}: ${value}`, tableX, doc.y);
//             doc.moveDown(0.5);
//           }
//         }
//       }
//     }

//     formatData(projectData[0]);

//     doc.end();
//   };

module.exports.generatePDF = (projectData, callback) => {
    const fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
        },
    };

    const printer = new pdfmake(fonts);

    const docDefinition = {
        content: [
            { text: 'Project Details', style: 'header' },
            { text: '\n' },
            formatData(projectData[0]),
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
            },
        },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    let chunks = [];

    pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
    });

    pdfDoc.on('end', () => {
        const pdfData = Buffer.concat(chunks);
        callback(pdfData);
    });

    pdfDoc.end();
};

function formatData(data) {
    const rows = [];
  
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
  
        if (typeof value === 'object') {
          // Handle nested objects by recursively formatting them
          const nestedTable = formatData(value);
          rows.push([{ text: key, style: 'tableHeader' }, nestedTable]);
        } else {
          // Handle simple values
          rows.push([{ text: key, style: 'tableHeader' }, value]);
        }
      }
    }
  
    return {
      style: 'table',
      table: {
        widths: ['40%', 'auto'],
        body: rows,
      },
    };
  }
  

module.exports.formatProjectData = (projectData) => {
    let formattedData = '';

    for (const key in projectData[0]) {
        if (projectData[0].hasOwnProperty(key)) {
            const value = projectData[0][key];

            if (typeof value === 'object') {
                // Handle nested objects or arrays
                if (Array.isArray(value)) {
                    formattedData += `${key}: ${value.map(item => JSON.stringify(item)).join(', ')}\n`;
                } else {
                    formattedData += `${key}: ${JSON.stringify(value)}\n`;
                }
            } else {
                formattedData += `${key}: ${value}\n`;
            }
        }
    }

    return formattedData;
}