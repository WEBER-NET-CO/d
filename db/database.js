// dbConfig.js

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'thush.local',
  user: 'root',
  password: '',
  database: 'wa-bot'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
  console.log('Connected to the database');
});

module.exports = connection;
