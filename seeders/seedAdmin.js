const { Pool } = require('pg')
const uuid = require("node-uuid");
const { sha3_512 } = require('js-sha3')
const bcrypt = require('bcrypt');

var connection = new Pool({
    host: "localhost",
    user:"postgres",
    password:"Chetan@123",
    database: "ase_project",
    charset: 'utf8mb4'
});

connection.connect()
let id = uuid.v4()
const password = 'Admin@123#';

const saltRounds = 10; 
const salt = bcrypt.genSaltSync(saltRounds);
const encryptedPassword = bcrypt.hashSync(password, salt);


console.log("running seed");

connection.query(`insert into admin (id,name,email_address,encrypted_password) values('${id}','admin', 'aseadmin@yopmail.com', '${encryptedPassword}')`, err => {
    if(err){
        throw err
    }
    console.log("seed complete");
    connection.end()
    process.exit()
})
