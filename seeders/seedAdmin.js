const { Pool } = require('pg')
const uuid = require("node-uuid");
const { sha3_512 } = require('js-sha3')
const bcrypt = require('bcrypt');
require('dotenv').config()

var connection = new Pool({
    host: "localhost",
    user: "postgres",
    password: "FseWorks1234!",
    database: "fse_project",
    charset: 'utf8mb4'
});

connection.connect()
let id = uuid.v4()
const password = 'FseWorks1234!';

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const encryptedPassword = bcrypt.hashSync(password, salt);

let avatar = process.env.DEFAULT_ADMIN_PIC

console.log("running seed");

connection.query(`insert into admin (id,name,email_address,encrypted_password, avatar) values('${id}','admin', 'nader@fseworks.com', '${encryptedPassword}', '${avatar}')`, err => {
    if (err) {
        throw err
    }
    console.log("seed complete");
    connection.end()
    process.exit()
})
