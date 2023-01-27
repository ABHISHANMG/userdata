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
    if (password.length < 5) {
      //Password length
      const dbResponse = await db.run(createUser);
      const newUser = dbResponse.lastId;
      response.status(400);
      response.send(`Password is too short`);
    } else {
      const dbResponse = await db.run(createUser);
      const newUser = dbResponse.lastId;
      response.status(400);
      response.send(`User created successfully`);
    }
  } else {
    //Already exists
    response.status(400);
    response.send("User already exists");
  }
});

//API 2

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUser = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUser);

  if (dbUser === undefined) {
    response.send(400);
    response.send("Invalid user");
  } else {
    const passwordIsValid = await bcrypt.compare(password, dbUser.password);
    if (password === true) {
      response.send(400);
      response.send("Login success!");
    } else {
      response.send(400);
      response.send("Invalid password");
    }
  }
});

//API 3

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  
  const selectUser = `SELECT * FROM user WHERE username = '${username};`;
  const dbUser = await db.get(selectUser);

  if (dbUser === undefined) {
    response.send(400);
    response.send("User not registered");
  } else {
    const validPassword = await bcrypt.compare(oldPassword, dbUser.password);
    if (validPassword === true) {
      const lengthOfNewPassword = newPassword.length;
      if (lengthOfNewPassword < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        const encryptPassword = await bcrypt.hash(newPassword, 10);
        const updatePassword = `UPDATE user SET password = '${encryptPassword} WHERE username = '${username};`;
        await db.run(updatePassword);
        response.send(400);
        response.send("password updated");
      }
    } else {
      response.send(400);
      response.send("invalid current password");
    }
  }
});

module.exports = app;
