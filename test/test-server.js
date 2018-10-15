"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const faker = require("faker");
const jwt = require("jsonwebtoken");
const expect = chai.expect;
const should = chai.should();
const { User } = require("../users");
const { Pet } = require("../pets");
const { app, runServer, closeServer } = require("../server.js");
const { TEST_DATABASE_URL, JWT_SECRET } = require("../config");

let test_token = "";

const username = "exampleUser";
const password = "examplePass";

chai.use(chaiHttp);

function seedPetData() {
  console.info("seeding pet data");
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      name: faker.name.firstName(),
      photo_url: faker.image.avatar(),
      breed: faker.lorem.word(),
      age: faker.random.number(60),
      notes: faker.lorem.sentences(),
      vet_name: faker.name.firstName(),
      phone: faker.lorem.word(),
      allergies: faker.lorem.word(),
      chronic_conditions: faker.lorem.word(),
      checkups: [faker.lorem.word()],
      vaccinations: [faker.lorem.word()],
      weight_history: [faker.lorem.word()]
    });
  }
  return Pet.insertMany(seedData);
}

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn("Deleting database");
    mongoose.connection
      .dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe("pet-rx api", function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return User.hashPassword(password)
      .then(password =>
        User.create({
          username,
          password
        })
      )
      .then(function() {
        return seedPetData();
      })
      .then(function() {
        test_token = jwt.sign(
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
      });
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  // GET endpoints
  describe("it should return all existing pets", function() {
    it("should have status of 200", function() {
      let res;
      return chai
        .request(app)
        .get("/api/pets")
        .set("Authorization", `Bearer ${test_token}`)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return Pet.count();
        });
      res.body.should.have.lengthOf(count);
    });
  });

  it("should return posts with the right fields", function() {
    let resPet;
    return chai
      .request(app)
      .get("/api/pets")
      .set("Authorization", `Bearer ${test_token}`)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).is.a("array");
        expect(res.body).to.have.lengthOf.at.least(1);

        res.body.forEach(function(pet) {
          expect(pet).is.a("object");
          expect(pet).to.include.keys(
            "id",
            "name",
            "photo_url",
            "breed",
            "age",
            "notes",
            "vet_name",
            "phone",
            "allergies",
            "chronic_conditions",
            "checkups",
            "vaccinations",
            "weight_history"
          );
        });

        resPet = res.body[0];
        return Pet.findById(resPet.id);
      })
      .then(pet => {
        resPet.name.should.equal(pet.name);
        expect(resPet.breed).to.equal(pet.breed);
        expect(resPet.phone).to.equal(pet.phone);
      });
  });

  describe("POST endpoint", function() {
    it("should add a new pet", function() {
      const newPet = {
        name: faker.name.firstName(),
        photo_url: faker.image.avatar(),
        breed: faker.lorem.word(),
        age: faker.random.number(60),
        notes: faker.lorem.sentences(),
        vet_name: faker.name.firstName(),
        phone: faker.lorem.word(),
        allergies: faker.lorem.word(),
        chronic_conditions: faker.lorem.word(),
        checkups: [faker.lorem.word()],
        vaccinations: [faker.lorem.word()],
        weight_history: [faker.lorem.word()]
      };

      return chai
        .request(app)
        .post("/api/pets")
        .set("Authorization", `Bearer ${test_token}`)
        .send(newPet)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res.body).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.include.keys(
            "id",
            "name",
            "photo_url",
            "breed",
            "age",
            "notes",
            "vet_name",
            "phone",
            "allergies",
            "chronic_conditions",
            "checkups",
            "vaccinations",
            "weight_history"
          );
          expect(res.body.name).to.equal(newPet.name);
          res.body.id.should.not.be.null;
          res.body.breed.should.equal(newPet.breed);
          expect(res.body.photo_url).to.equal(newPet.photo_url);
          return Pet.findById(res.body.id);
        })
        .then(function(Pet) {
          Pet.name.should.equal(newPet.name);
          Pet.breed.should.equal(newPet.breed);
          Pet.photo_url.should.equal(newPet.photo_url);
        });
    });
  });
  //
  // describe("PUT endpoint", function() {
  //   it("should update fields you send over", function() {
  //     const updateData = {
  //       name: "Mary",
  //       relation: "mother",
  //       significant_other: "Joseph"
  //     };
  //
  //     return FamilyMember.findOne()
  //       .then(familyMember => {
  //         updateData.id = familyMember.id;
  //
  //         return chai
  //           .request(app)
  //           .put(`/api/family-members/${familyMember.id}`)
  //           .set("Authorization", `Bearer ${test_token}`)
  //           .send(updateData);
  //       })
  //
  //       .then(res => {
  //         res.should.have.status(204);
  //         return FamilyMember.findById(updateData.id);
  //       })
  //
  //       .then(familyMember => {
  //         familyMember.name.should.equal(updateData.name);
  //         familyMember.relation.should.equal(updateData.relation);
  //         familyMember.significant_other.should.equal(
  //           updateData.significant_other
  //         );
  //       });
  //   });
  // });
  //
  // describe("DELETE endpoint", function() {
  //   it("should delete a post by id", function() {
  //     let familyMember;
  //
  //     return FamilyMember.findOne()
  //       .then(_familyMember => {
  //         familyMember = _familyMember;
  //         return chai
  //           .request(app)
  //           .delete(`/api/family-members/${familyMember.id}`)
  //           .set("Authorization", `Bearer ${test_token}`);
  //       })
  //       .then(res => {
  //         res.should.have.status(204);
  //         return FamilyMember.findById(familyMember.id);
  //       })
  //       .then(_familyMember => {
  //         should.not.exist(_familyMember);
  //       });
  //   });
  // });
});
