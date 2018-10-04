"use strict";

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const petSchema = mongoose.Schema({
  basic_information: {
    name: { type: String, required: true },
    photo_url: { type: String },
    breed: { type: String },
    age: { type: String },
    notes: { type: String }
  },
  veterinary_information: {
    name: { type: String },
    phone: { type: String }
  },
  health_conditions: {
    allergies: { type: String },
    chronic_conditions: { type: String }
  },
  checkups: [{ type: String }],
  vaccinations: [{ type: String }],
  weight_history: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }
});

petSchema.methods.serialize = function() {
  return {
    basic_information: {
      name: this.basic_information.name,
      photo_url: this.basic_information.photo_url,
      breed: this.basic_information.breed,
      age: this.basic_information.age,
      notes: this.basic_information.notes
    },
    veterinary_information: {
      name: this.veterinary_information.name,
      phone: this.veterinary_information.phone
    },
    health_conditions: {
      allergies: this.health_conditions.allergies,
      chronic_conditions: this.health_conditions.chronic_conditions
    },
    checkups: this.checkups,
    vaccinations: this.vaccinations,
    weight_history: this.weight_history,
    id: this._id
  };
};

const Pet = mongoose.model("Pet", petSchema);

module.exports = { Pet };
