
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'j0k4',
    host: 'localhost',
    port: 5432,
    database: 'si-24-7a'
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};