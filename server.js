"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");
const app = express();

const { router: petsRouter, pet: pet } = require("./pets");
const { router: usersRouter } = require("./users");
const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");

// logging
app.use(morgan("common"));
app.use(express.json());

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  if (req.method === "OPTIONS") {
    return res.send(204);
  }
  next();
});

app.use(passport.initialize());
passport.use("local", localStrategy);
passport.use(jwtStrategy);

app.use("/api/users/", usersRouter);
app.use("/api/auth/", authRouter);
app.use("/api/pets", petsRouter);

// start server
let server;

function runServer(DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }

      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on("error", err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };