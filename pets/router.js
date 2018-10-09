const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");

const { Pet } = require("./models");
const { jwtStrategy } = require("../auth");
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate("jwt", { session: false });

router.get("/", jwtAuth, (req, res) => {
  Pet.find({ user: req.user.id })
    .then(pets => {
      return res.json(pets.map(pet => pet.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
    });
});

router.get("/:id", jwtAuth, (req, res) => {
  Pet.findById(req.params.id)
    .then(pet => res.json(pet.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
    });
});

router.post("/", jwtAuth, jsonParser, (req, res) => {
  const requiredFields = ["basic_information"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Pet.create({
    basic_information: {
      name: req.body.basic_information.name,
      photo_url: req.body.basic_information.photo_url,
      breed: req.body.basic_information.breed,
      age: req.body.basic_information.age,
      notes: req.body.basic_information.notes
    },
    veterinary_information: {
      name: req.body.veterinary_information.name,
      phone: req.body.veterinary_information.phone
    },
    health_conditions: {
      allergies: req.body.health_conditions.allergies,
      chronic_conditions: req.body.health_conditions.chronic_conditions
    },
    checkups: req.body.checkups,
    vaccinations: req.body.vaccinations,
    weight_history: req.body.weight_history,
    user: req.user.id
  })
    .then(Pet => res.status(201).json(Pet.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    });
});

router.delete("/:id", jwtAuth, (req, res) => {
  Pet.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: "success" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
    });
});

router.put("/:id", jwtAuth, (req, res) => {
  console.log(req.params.id, req.body);
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: "Request path id and request body id values must match"
    });
  }

  Pet.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    .then(updatedPet => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

module.exports = { router };
