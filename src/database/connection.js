const { Pool } = require('pg')
var connection = new Pool({
    host: "localhost",
    user: "postgres",
    password: "FseWorks1234!",
    database: "fse_project",
    charset: 'utf8mb4'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("database Connected successfully!");
})

module.exports = connection;
