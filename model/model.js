const {Pool, Client} = require("pg");

const pool = new Pool({
    user:"postgres",
    password:"post30",
    host:"localhost",
    database:"wakala_ms",
    port:5432
});

module.exports = pool;