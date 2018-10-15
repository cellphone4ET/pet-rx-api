"use strict";

require("dotenv").config();
const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");

const { app, runServer, closeServer } = require("../server");
const { User } = require("../users");
const { JWT_SECRET } = require("../config");
const { TEST_DATABASE_URL } = require("../config");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Protected endpoint", function() {
  const username = "exampleUser";
  const password = "examplePass";

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password
      })
    );
  });

  afterEach(function() {
    return User.remove({});
  });

  describe("/api/pets", function() {
    it("Should reject requests with no credentials", function() {
      return chai
        .request(app)
        .get("/api/pets")
        .then(function(res) {
          expect(res).to.have.status(401);
        });
    });

    it("Should reject requests with an invalid token", function() {
      const token = jwt.sign(
        {
          username
        },
        "wrongSecret",
        {
          algorithm: "HS256",
          expiresIn: "7d"
        }
      );

      return chai
        .request(app)
        .get("/api/pets")
        .set("Authorization", `Bearer ${token}`)
        .then(function(res) {
          expect(res).to.have.status(401);
        });
    });
    it("Should reject requests with an expired token", function() {
      const token = jwt.sign(
        {
          user: {
            username
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: "HS256",
          subject: username
        }
      );

      return chai
        .request(app)
        .get("/api/pets")
        .set("authorization", `Bearer ${token}`)
        .then(function(res) {
          expect(res).to.have.status(401);
        });
    });
    it("Should send protected data", function() {
      const token = jwt.sign(
        {
          user: {
            username
          }
        },
        JWT_SECRET,
        {
          algorithm: "HS256",
          subject: username,
          expiresIn: "7d"
        }
      );

      return chai
        .request(app)
        .get("/api/pets")
        .set("authorization", `Bearer ${token}`)
        .then(res => {
          console.log(res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          // expect(res.body.data).to.equal([]);
        });
    });
  });
});
