// queryDatabase.js

const db = require('./database');

function getAllgroup(callback) {
  db.query('SELECT * FROM grp_list ', (err, results, fields) => {
    if (err) {
      console.error('Error executing query:', err);
      return callback(err, null);
    }

    // console.log('Query results:', results);
    // console.log('SELECT * FROM lecture_shedule where LOWER("rundate") ="'+date_week()+'")');
    callback(null, results);
  });
}

module.exports = {
    getAllgroup 
};
