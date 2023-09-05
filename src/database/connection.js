const { Pool } = require('pg')
var connection = new Pool({
    host: "localhost",
    user:"postgres",
    password:"Chetan@123",
    database: "ase_project",
    charset: 'utf8mb4'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("database Connected successfully!");
})

module.exports = connection;
