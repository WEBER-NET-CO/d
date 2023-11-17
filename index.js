const qrcode = require("qrcode-terminal");

const { Client, LocalAuth, Buttons } = require("whatsapp-web.js");
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ["--no-sandbox"] },
});
const db = require("./db/getdata");
const filter_dt = require("./db/filterdata");
const db_con = require("./db/database");
const { admin_profile_no, control_grp_id } = require("./setting/grpids");
const { banner, name, adminlist, lecture_list } = require("./setting/details");
const grp = require("./db/getgroup");
const cron = require("node-cron");
const heldupdate = require("./db/updateheld");
const moment = require("moment-timezone");

// print time
const colomboTimezone = "Asia/Colombo";
const currentTime = moment().tz(colomboTimezone);
console.log(currentTime.toDate());

var start = false;
var notistart = true;

var about = `
🔰 ${banner}

*Special for managing lecture schedule*
---------------------- \n
 🤖 *𝒩𝒪𝒯𝐼𝐹𝒴 𝐵𝒪𝒯*

  👨‍💻 ~Coding By ShAlItHa <WeBeR/>~
  ⚡ Powerd BY ${name} 
  📞 ${admin_profile_no}
  🌐 https://github.com/shalithamadhuwantha
  
💥 This BOT will inform everyone about your lecture and assignment  

❌ This is for education and study purpose only, this is *not a funny and general purpose bot*

📌 If you have any suggestions, please tell us

ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
`;
const colomboTimeZone = "Asia/Colombo";
var cmd_print = `
🔰 ${banner}

*Special for managing lecture schedule*
---------------------- \n
  🤖 *𝒩𝒪𝒯𝐼𝐹𝒴 𝐵𝒪𝒯*

  👨‍💻 ~Coding By ShAlItHa <WeBeR/>~
  ⚡ Powerd BY ${name} 
  📞 ${admin_profile_no}
  🌐 https://github.com/shalithamadhuwantha
  

╭──( CoMmAnDs )
│ *.htag* => hide tag
│ *.tag* => tag
│ *.cmdlist*  => command list
│ *.help*  => command list
│ *.about* => about bot
│ *.admins* => admin list
│ *.ttable <dep>* => today time table
│ *.now <dep>* => get now lecture
╰────────────⦁
<dep> = ict , ent , bst , all

╭──( Admin CoMmAnDs )
│ *.start* => start bot
│ *.stop* => stop bot
│ *.restart* => start reminder
│ *.restop* => stop reminder
│ *.fullstop* => stop bot
│ *.wcgroup*  => group list
│ *.wcabout* => about bot
│ *.wcdetail* => server detail
╰────────────⦁

╭──( moderator CoMmAnDs )
│ *.wcadd* => add lect 
│ *.wcupdate* => update lecture
│ *.wcaddgroup*  => add group
│ *.wcdownsub* => lecture postponed msg 
│ *.wcupsub* => remove lecture postponed msg 
│ *.wcsearch <lec id>* => search lecture
│ *.noti * => notification 
╰────────────⦁

ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
      `;
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready! > Bot father is a Shalitha!");

  let run = [];

  // ****** auto sending lectrure link
  //   every minit run
  //   cron.schedule("* * * * *", () => {
  // shedule run
  cron.schedule(
    "*/1 7-20 * * 1-5",
    () => {
      if (!notistart) {
        return;
      }
      // console.log("sss5");
      // Your code to run every minute goes here

      db.getAllData((err, data) => {
        // console.log(data);

        for (let itemNO = 0; itemNO < data.length; itemNO++) {
          //   console.log(data);
          //   console.log("sss8");
          if (err) {
            console.error("Error retrieving data:", err);
            return;
          }
          //   console.log("sss6");
          const colomboTimezone = "Asia/Colombo";
          const databaseTime = moment.tz(
            data[itemNO].shedule,
            "HH:mm:ss",
            colomboTimezone
          );
          // console.log(databaseTime);
          const currentTime = moment().tz(colomboTimezone);
          //   console.log(currentTime);

          // Check if the current time is within 10 minutes before and after the database time
          const isWithin10Minutes = currentTime.isBetween(
            databaseTime.clone().subtract(10, "minutes"),
            databaseTime.clone().add(10, "minutes"),
            null,
            "[]"
          );

          //   update held oprater
          const remove_held = currentTime.isBetween(
            databaseTime.clone().add(120, "minutes"),
            databaseTime.clone().add(240, "minutes"),
            null,
            "[]"
          );
          //   console.log(remove_held);
          //   console.log(data[itemNO].held);
          if (remove_held) {
            if (data[itemNO].held.toLowerCase() == "no") {
              updateheld(data[itemNO].id, "YES", data[itemNO].name);
            }
          }
          //   genral send data
          if (isWithin10Minutes) {
            if (!run.includes(itemNO)) {
              //*** * get group id list
              grp.getAllgroup((err, grolst) => {
                for (let group_id = 0; group_id < grolst.length; group_id++) {
                  // selct sending group
                  if (
                    data[itemNO].course.toLowerCase() ==
                      grolst[group_id].tag.toLowerCase() ||
                    data[itemNO].course.toLowerCase() == "all" ||
                    grolst[group_id].tag.toLowerCase() == "all"
                  ) {
                    if (data[itemNO].held.toLowerCase() != "no") {
                      //   console.log(data[itemNO].courseid);
                      //   console.log(grolst[group_id].grpid);
                      client.sendMessage(
                        grolst[group_id].grpid,
                        `
🔔 *LECTURE REMINDER* 🔔

🎓 *Lecture*: ${data[itemNO].name}

⌚ *Time*: ${data[itemNO].time}

🔢 *course code*: ${data[itemNO].courseid}

🔗 *Link*: ${data[itemNO].link} 

🔐 *password*: ${data[itemNO].password}

⚙ *Meeting id*: ${data[itemNO].meetingid}

👨‍🎓 *FOR*: ${data[itemNO].course}

ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
                `
                      );
                      // send password
                      client.sendMessage(
                        grolst[group_id].grpid,
                        `${data[itemNO].password}`
                      );
                      run.push(itemNO);
                    }
                    //   lecture not held msg
                    else {
                      client.sendMessage(
                        grolst[group_id].grpid,
                        `
🔔 *LECTURE REMINDER* 🔔

🛑 *The following lecture will not be held today*

🛑 *පහත දේශනය අද දින නොපැවැත්වේ*

🛑 *பின்வரும் விரிவுரை இன்று நடைபெறாது*

🎓 *Lecture*: ${data[itemNO].name}

🔢 *course code*: ${data[itemNO].courseid}

⌚ *Time*: ${data[itemNO].time}
  
👨‍🎓 *FOR*: ${data[itemNO].course}
  
  ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
                  `
                      );
                      // rember send msg
                      run.push(itemNO);
                    }
                  }
                }
              });
            }
          } else {
            // remove send msg memory after time out
            const indexToRemoveFive = run.indexOf(itemNO);

            if (indexToRemoveFive !== -1) {
              run.splice(indexToRemoveFive, 1);
            }
          }
        }
      });
      //   console.log("This message is sent every minute!");
    },
    { timezone: colomboTimeZone }
  );
});

// ******************************** msg handling
client.on("message", async (msg) => {
  // Mention everyone hide tag method
  // start / starts
  if (msg.body == ".wcdetail") {
    if (
      (await client.getNumberId(admin_profile_no))._serialized == msg.from ||
      msg.from == control_grp_id
    ) {
      let dtls = `
*Time* : ${currentTime.toDate()}

*bot* : ${start}

*REMINDER*: ${notistart}

        `;
      msg.reply(dtls);
      start = true;
    } else {
      msg.reply(
        "Sorry you don't have privileges! \n\nᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  }
  // *** bot start
  if (msg.body == ".start") {
    if ((await client.getNumberId(admin_profile_no))._serialized == msg.from) {
      msg.reply("started >> " + currentTime.toDate());
      start = true;
    } else {
      msg.reply(
        "Sorry you don't have privileges, please request in private " +
          admin_profile_no +
          "\n\nᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  } else if (msg.body == ".stop") {
    if ((await client.getNumberId(admin_profile_no))._serialized == msg.from) {
      msg.reply("stoped >> " + currentTime.toDate());
      start = false;
    } else {
      msg.reply(
        "Sorry you don't have privileges \n\nᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  }

  //*** */   full stop
  if (msg.body == ".fullstop") {
    if ((await client.getNumberId(admin_profile_no))._serialized == msg.from) {
      msg.reply("full top >> " + currentTime.toDate());
      start = false;
      notistart = false;
    } else {
      msg.reply(
        "Sorry you don't have privileges! \n\nᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  }

  //   ********* stop reminder

  if (msg.body == ".restop") {
    if ((await client.getNumberId(admin_profile_no))._serialized == msg.from) {
      msg.reply("reminder spoted >> " + currentTime.toDate());

      notistart = false;
    } else {
      msg.reply(
        "Sorry you don't have privileges! \n\n ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  } else if (msg.body == ".restart") {
    if ((await client.getNumberId(admin_profile_no))._serialized == msg.from) {
      msg.reply("reminder start >> " + currentTime.toDate());

      notistart = true;
    } else {
      msg.reply(
        "Sorry you don't have privileges! \n\n ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  }

  if (!start) {
    return;
  }

  if (msg.body.startsWith(".htag")) {
    if (!(await client.getChatById(msg.from)).isGroup) {
      return;
    }
    const chat = await msg.getChat();

    let text = "";
    let mentions = [];

    for (let participant of chat.participants) {
      const contact = await client.getContactById(participant.id._serialized);

      mentions.push(contact);

      text += `@${participant.id.user} `;
    }
    // await chat.sendMessage(msg.body.split(".wc.htag")[1], { mentions });

    msg.reply(msg.body.split(".htag")[1], msg.from, { mentions });

    // await chat.reply(msg.body.split(".wc.htag")[1], { mentions });
  }

  // command list
  else if (msg.body == ".cmdlist" || msg.body == ".help") {
    msg.reply(cmd_print);
  }

  // cordinater mention
  else if (msg.body == ".admins") {
    msg.reply(adminlist);
  }

  // get all group
  else if (msg.body == ".wcgroup") {
    if ((await client.getNumberId(admin_profile_no))._serialized == msg.from) {
      client.getChats().then((chats) => {
        chats.forEach((chat) => {
          // Check if the chat is a group
          if (chat.isGroup) {
            // Print information about the group
            msg.reply(`Group Name: ${chat.name}
                    Group ID: ${chat.id._serialized}
                    ---`);
          }
        });
      });
    } else {
      msg.reply(
        "Sorry you don't have privileges \n\n ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  }
  // about cmd
  else if (msg.body == ".about") {
    msg.reply(about);
  }
  //   normal tag
  else if (msg.body == ".tag") {
    if (!(await client.getChatById(msg.from)).isGroup) {
      return;
    }
    const chat = await msg.getChat();

    let text = "";
    let mentions = [];

    for (let participant of chat.participants) {
      const contact = await client.getContactById(participant.id._serialized);

      mentions.push(contact);

      text += `@${participant.id.user} `;
    }
    // await chat.sendMessage(msg.body.split(".wc.htag")[1], { mentions });

    msg.reply(text, msg.from, { mentions });
  }
  //   *** today all lecture
  else if (msg.body.includes(".ttable")) {
    let comds = msg.body.split(".ttable ");
    // console.log(comds.length);

    // console.log(comds);
    // console.log(comds[1] == "");
    if (comds[1] == "" || comds.length <= 1) {
      msg.reply(
        `
❌*Incomplete command* 

 EX: *.ttable bict* 

 you can use ${lecture_list}

 ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
 `
      );
      return;
    } else {
      ttable(msg.from, comds[1]);
    }
  }
  //   *** now lecture list
  else if (msg.body.includes(".now")) {
    let comds_n = msg.body.split(".now ");
    // console.log(comds.length);

    // console.log(comds_n);
    // console.log(comds_n[1] == "");
    if (comds_n[1] == "" || comds_n.length <= 1) {
      msg.reply(
        `
❌*Incomplete command* 

 EX: *.now bict* 

 you can use ${lecture_list}

 ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
         `
      );
      return;
    } else if (lecture_list.includes(comds_n[1])) {
      now(msg.from, msg.body.split(".now ")[1]);
    } else {
      msg.reply(
        `
❌ *Wrong options* 

EX: *.now bict* 

you can use ${lecture_list}

ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
`
      );
    }
  }
  //   add lecture cmd
  else if (msg.body.includes(".wcadd")) {
    // console.log("s");
    if (
      (await client.getNumberId(admin_profile_no))._serialized == msg.from ||
      msg.from == control_grp_id
    ) {
      if (msg.body.includes(".wcadd=>")) {
        add_lecture(msg.body);
      } else {
        msg.reply(`
❌*Wrong options* 

💬 EX: 
*.wcadd=>course id,course name,year,sem,link,meeting id,passsword,time,notification time,date,department,is Held*

⚓ *Navigate:*

*course id* : ICT 1234 (you must add space)

*notification time*: You should add notification time before lecture time .. I recommend 10 minutes before lecture time

*department*: ${lecture_list}

*time*: 24h EX: 18:50:00

*is Held*: yes or no

*date* : Date is a day of the week
Monday, Tuesday, Wednesday, Thursday, Friday

*year & sem*: Year and half must be 1 character like 1 year for 1 , 2nd = 2 

EX: 
*.wcadd=>ABC 123,ABC course,1,1,https://learn.zoom.us/,12345678,abc123,08:00:00,07:50:00,Friday,ALL,YES*

ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
`);
      }
    } else {
      msg.reply(
        "Sorry you don't have privileges! \n\n ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  }

  // serach id
  else if (msg.body.startsWith(".wcsearch")) {
    if (
      (await client.getNumberId(admin_profile_no))._serialized == msg.from ||
      msg.from == control_grp_id
    ) {
      if (msg.body.split(".wcsearch ").length > 1) {
        searchbyid(msg.body.split(".wcsearch ")[1]);
      } else {
        msg.reply(
          `
❌ *Wrong options* 
  
EX: *.wcsearch ict 123* 
  
you can use course code 
  
ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
  `
        );
      }
    } else {
      msg.reply(
        "Sorry you don't have privileges! \n\n ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  }

  // ** custome notification
  else if (msg.body.startsWith(".noti")) {
    if (
      (await client.getNumberId(admin_profile_no))._serialized == msg.from ||
      msg.from == control_grp_id
    ) {
      if (msg.body.startsWith(".noti=>")) {
        data = msg.body.split("=>");
        grp.getAllgroup((err, grolst) => {
          // console.log(grolst);
          for (let group_id = 0; group_id < grolst.length; group_id++) {
            if (
              data[1].toLowerCase() == grolst[group_id].tag ||
              data[1].toLowerCase() == "all" ||
              grolst[group_id].tag.toLowerCase() == "all"
            ) {
              // console.log("true");
              // client.sendMessage(grolst[group_id].grpid,data[2]);
              noti(grolst[group_id].grpid,data[2])
            }
          }
        });
      } else {
        msg.reply(`
❌*Wrong options* 

💬 EX: 
*.noti=> group type => MSG*

⚓ *Navigate:*

*group type* : ${lecture_list}

📌EX: 
*.noti=>ALL=> this is a test msg 
test
tst*

ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
`);
      }
    }else {
      msg.reply(
        "Sorry you don't have privileges! \n\n ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ"
      );
    }
  }
});

// ****** all time table
function ttable(usrid, type) {
  db.getAllData((err, data) => {
    // console.log(data);

    for (let itemNO = 0; itemNO < data.length; itemNO++) {
      //   console.log(data);
      //   console.log("sss8");
      if (err) {
        console.error("Error retrieving data:", err);
        return;
      }

      if (
        data[itemNO].course.toLowerCase() == "all" ||
        data[itemNO].course.toLowerCase() == type.toLowerCase() ||
        type.toLowerCase() == "all"
      ) {
        if (data[itemNO].held.toLowerCase() != "no") {
          //   console.log(data[itemNO].courseid);
          //   console.log(grolst[group_id].grpid);
          client.sendMessage(
            usrid,
            `
🔔 *LECTURE REMINDER* 🔔

🎓 *Lecture*: ${data[itemNO].name}

⌚ *Time*: ${data[itemNO].time}

🔢 *course code*: ${data[itemNO].courseid}

🔗 *Link*: ${data[itemNO].link} 

🔐 *password*: ${data[itemNO].password}

⚙ *Meeting id*: ${data[itemNO].meetingid}

👨‍🎓 *FOR*: ${data[itemNO].course}

ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
                `
          );
          // send password
        }
        //   lecture not held msg
        else {
          client.sendMessage(
            usrid,

            `
🔔 *LECTURE REMINDER* 🔔

🛑 *The following lecture will not be held today*

🛑 *පහත දේශනය අද දින නොපැවැත්වේ*

🛑 *பின்வரும் விரிவுரை இன்று நடைபெறாது*

🎓 *Lecture*: ${data[itemNO].name}

🔢 *course code*: ${data[itemNO].courseid}

⌚ *Time*: ${data[itemNO].time}
  
👨‍🎓 *FOR*: ${data[itemNO].course}
  
  ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
                  `
          );
          // rember send msg
        }
      }
    }
  });
}

// ***** now lecture

function now(usrid, type) {
  db.getAllData((err, data) => {
    // console.log(data);

    for (let itemNO = 0; itemNO < data.length; itemNO++) {
      const colomboTimezone = "Asia/Colombo";
      const databaseTime = moment.tz(
        data[itemNO].time,
        "HH:mm:ss",
        colomboTimezone
      );
      // console.log(databaseTime);
      const currentTime = moment().tz(colomboTimezone);
      // console.log(currentTime);

      // Check if the current time is within 10 minutes before and after the database time
      const isWithin120Minutes = currentTime.isBetween(
        databaseTime.clone().subtract(2, "minutes"),
        databaseTime.clone().add(120, "minutes"),
        null,
        "[]"
      );

      //   console.log(data);
      // console.log("sss8");
      if (err) {
        console.error("Error retrieving data:", err);
        return;
      }
      if (isWithin120Minutes) {
        if (
          data[itemNO].course.toLowerCase() == "all" ||
          data[itemNO].course.toLowerCase() == type.toLowerCase() ||
          type.toLowerCase() == "all"
        ) {
          if (data[itemNO].held.toLowerCase() != "no") {
            //   console.log(data[itemNO].courseid);
            //   console.log(grolst[group_id].grpid);
            client.sendMessage(
              usrid,
              `
  🔔 *LECTURE REMINDER* 🔔
  
  🎓 *Lecture*: ${data[itemNO].name}
  
  ⌚ *Time*: ${data[itemNO].time}
  
  🔢 *course code*: ${data[itemNO].courseid}
  
  🔗 *Link*: ${data[itemNO].link} 
  
  🔐 *password*: ${data[itemNO].password}
  
  ⚙ *Meeting id*: ${data[itemNO].meetingid}
  
  👨‍🎓 *FOR*: ${data[itemNO].course}
  
  ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
                  `
            );
            client.sendMessage(usrid, `${data[itemNO].password}`);
            // send password
          }
          //   lecture not held msg
          else {
            client.sendMessage(
              usrid,

              `
  🔔 *LECTURE REMINDER* 🔔
  
  🛑 *The following lecture will not be held today*
  
  🛑 *පහත දේශනය අද දින නොපැවැත්වේ*
  
  🛑 *பின்வரும் விரிவுரை இன்று நடைபெறாது*
  
  🎓 *Lecture*: ${data[itemNO].name}
  
  🔢 *course code*: ${data[itemNO].courseid}
  
  ⌚ *Time*: ${data[itemNO].time}
    
  👨‍🎓 *FOR*: ${data[itemNO].course}
    
    ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ
                    `
            );
            // rember send msg
          }
        }
      }
    }
  });
}

// function serach by id
function searchbyid(lecid) {
  filter_dt.filterdt(lecid, (err, data) => {
    // console.log(data);

    for (let itemNO = 0; itemNO < data.length; itemNO++) {
      client.sendMessage(
        control_grp_id,
        `
✅ *Lecture found ${data[itemNO].courseid}*

🔑 *KEY*: ${data[itemNO].id}

🔢 *course code*: ${data[itemNO].courseid}

🎓 *Lecture*: ${data[itemNO].name}

⌚ *Time*: ${data[itemNO].time}

📆 *Date*: ${data[itemNO].rundate}

🔔 *noti time*: ${data[itemNO].shedule}

🔗 *Link*: ${data[itemNO].link} 

🔐 *password*: ${data[itemNO].password}

⚙ *Meeting id*: ${data[itemNO].meetingid}

👨‍🎓 *FOR*: ${data[itemNO].course}

📅 *Year*: ${data[itemNO].year}

⏳ *Sem*: ${data[itemNO].sem}

👨‍🏫 *is Held*: ${data[itemNO].held}

`
      );
    }
  });
}

// /********* add lecture
async function add_lecture(msg) {
  try {
    // Run the update logic with the provided value and await the result
    const result = await heldupdate(client, "add", msg);

    // client.sendMessage(control_grp_id,`${name} \nchanged lecture postponed status = NO > YES`)
  } catch (error) {
    console.error("Error:", error);
  }
}


// *** noti function 

async function noti(grpid,msg){
  try{
    // console.log(grpid);
    // console.log("-------------------------------------------");
    const chat = await client.getChatById(grpid);

    let text = "";
    let mentions = [];

    for (let participant of chat.participants) {
      const contact = await client.getContactById(participant.id._serialized);

      mentions.push(contact);

      text += `@${participant.id.user} `;
    }
    await chat.sendMessage(msg, { mentions });
  }catch(error){
console.log(error);
  }
  
}
// *** held update function
async function updateheld(id, type, name) {
  try {
    // Define the new value you want to set
    const newValue = id;

    // Run the update logic with the provided value and await the result
    const result = await heldupdate(newValue, "auto", type);

    client.sendMessage(
      control_grp_id,
      `${name} \nchanged lecture postponed status = NO > YES \n\n ᴬᵘᵗᵒ ᵍᵉⁿʳᵃᵗᵉᵈ ᵐˢᵍ ᵇʸ ᴺᴼᵀᴵᶠʸ ᴮᴼᵀ`
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

client.initialize();
