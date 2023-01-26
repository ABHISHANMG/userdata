const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDateBase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server worked http://localhost:3000/");
    });
  } catch (error) {
    console.log(`error ${error.message}`);
  }
};
initializeDateBase();

//API 1

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUser = `SELECT * FROM user WHERE username = '${username}';`;

  const dbUser = await db.get(selectUser);

  //username exist

  if (dbUser === undefined) {
    //Creating user
    const createUser = `INSERT INTO
    user (username, name, password, gender, location)
  VALUES
    (
      '${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}'  
    );`;
    const dbResponse = await db.run(createUser);
    if (password.length < 5) {
      //Password length
      const newUser = dbResponse.lastId;
      response.status(400);
      response.send(`Password is too short`);
    } else {
    }
    const newUser = dbResponse.lastId;
    response.status(400);
    response.send(`User created successfully`);
  } else {
    //Already exists
    response.status(400);
    response.send("User already exists");
  }
});

module.exports = app;
