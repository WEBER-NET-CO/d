const moment = require("moment");
const db = require("./database");
const { admin_profile_no, control_grp_id } = require("../setting/grpids");
const { Client } = require("whatsapp-web.js");

function updateData(newValue, type, val) {
  if (type == "auto") {
    held_auto_update(newValue, val);
  }
  if (type == "add") {
    addlect(newValue, val);
  }
}

function addlect(newValue, msg) {
  whtsmsg = newValue;
  let fullcmd = msg;
  let data = fullcmd.split(".wcadd=>")[1].split(",");
  return new Promise((resolve, reject) => {
    // Get the current time
    if (
      data[0].length <= 11 &&
      data[2].length == 1 &&
      data[3] == 1 &&
      data[7].split(":").length == 3 &&
      data[8].split(":").length == 3
    ) {
      let values = `'${data[0]}','${data[1]}',${data[2]},${data[3]},'${data[4]}','${data[5]}','${data[6]}','${data[7]}','${data[8]}','${data[9]}','${data[10]}','${data[11]}'`;
      let quary =
        "INSERT INTO `lecture_shedule`( `courseid`, `name`, `year`, `sem`, `link`, `meetingid`, `password`, `time`, `shedule`, `rundate`, `course`, `held`) VALUES (" +
        values +
        ")";

      // Execute the query with the provided value
      db.query(quary, [newValue], (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          whtsmsg.sendMessage(
            control_grp_id,
            `
✅ *New Lecture Added*

🔢 *course code*: ${data[0]}

🎓 *Lecture*: ${data[1]}

⌚ *Time*: ${data[7]}

📆 *Date*: ${data[9]}

🔔 *noti time*: ${data[8]}

🔗 *Link*: ${data[4]} 

🔐 *password*: ${data[6]}

⚙ *Meeting id*: ${data[5]}

👨‍🎓 *FOR*: ${data[10]}

📅 *Year*: ${data[2]}

⏳ *Sem*: ${data[3]}

👨‍🏫 *is Held*: ${data[11]}

`
          );
        }

        console.log("Rows affected:", results.affectedRows);
        resolve(results);
      });
    }
  });
}

function held_auto_update(newValue, val) {
  return new Promise((resolve, reject) => {
    // Get the current time

    console.log(newValue);
    console.log(val);

    // Your SQL UPDATE statement
    const updateQuery = `UPDATE \`lecture_shedule\` SET \`held\`='${val}' WHERE \`id\` =${newValue} `;

    // Execute the query with the provided value
    db.query(updateQuery, [newValue], (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        console.log("Rows affected:", results.affectedRows);
        resolve(results);
      }
    });
  });
}

function held_auto_update(newValue, val) {
  return new Promise((resolve, reject) => {
    // Get the current time

    console.log(newValue);
    console.log(val);

    // Your SQL UPDATE statement
    const updateQuery = `UPDATE \`lecture_shedule\` SET \`held\`='${val}' WHERE \`id\` =${newValue} `;

    // Execute the query with the provided value
    db.query(updateQuery, [newValue], (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        console.log("Rows affected:", results.affectedRows);
        resolve(results);
      }
    });
  });
}

module.exports = updateData;
