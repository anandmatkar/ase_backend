const { Pool } = require('pg')
var connection = new Pool({
    host: "localhost",
    user:"postgres",
    password:"Developer123#",
    database: "fse_project",
    charset: 'utf8mb4'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("database Connected successfully!");
})

module.exports = connection;
