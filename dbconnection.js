const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'smp'
});

conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});
module.exports = conn;