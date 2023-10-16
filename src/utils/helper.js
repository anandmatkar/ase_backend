const jsonwebtoken = require("jsonwebtoken");
const PDFDocument = require('pdfkit');

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

module.exports.generatePDF = (projectData, callback) => {
    const doc = new PDFDocument();
    let pdfBuffer = [];
  
    doc.on('data', chunk => {
      pdfBuffer.push(chunk);
    });
  
    doc.on('end', () => {
      const pdfData = Buffer.concat(pdfBuffer);
      callback(pdfData);
    });
  
    const tableX = 50;
    let initialY = 100; // Updated to let, not const
    const rowHeight = 30;
  
    doc.font('Helvetica-Bold')
       .text('Project Details', tableX, initialY);
  
    doc.moveDown(0.5);
    doc.font('Helvetica');
  
    // Function to recursively format data
    function formatData(data, parentKey = '') {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
  
          if (typeof value === 'object') {
            // Handle nested objects and arrays recursively
            formatData(value, parentKey + key + '.');
          } else {
            // Display key-value pairs
            doc.text(`${parentKey + key}: ${value}`, tableX, initialY + rowHeight);
            initialY += rowHeight;
          }
        }
      }
    }
  
    formatData(projectData[0]);
  
    doc.end();
  };

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