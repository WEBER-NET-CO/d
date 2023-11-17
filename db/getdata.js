// queryDatabase.js

const db = require('./database');

function getAllData(callback) {
  db.query('SELECT * FROM lecture_shedule where `rundate` = "'+date_week()+'"', (err, results, fields) => {
    if (err) {
      console.error('Error executing query:', err);
      return callback(err, null);
    }

    // console.log('Query results:', results);
    // console.log('SELECT * FROM lecture_shedule where LOWER("rundate") ="'+date_week()+'")');
    callback(null, results);
  });
}



function date_week(){
  const options = { timeZone: 'Asia/Colombo', weekday: 'long' };
  
  // Get the current date in the specified time zone
  const currentDate = new Date().toLocaleDateString('en-US', options);
  
  return(currentDate);
  }
module.exports = {
  getAllData
};
