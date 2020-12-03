const { Pool, Client } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    port: "5432",
    database: 'mystocks',
    password: 'root',
})
module.exports = pool;