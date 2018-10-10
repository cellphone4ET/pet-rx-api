"use strict";

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const petSchema = mongoose.Schema({
  name: { type: String, required: true },
  photo_url: { type: String },
  breed: { type: String },
  age: { type: String },
  notes: { type: String },
  vet_name: { type: String },
  phone: { type: String },
  allergies: { type: String },
  chronic_conditions: { type: String },
  checkups: [{ type: String }],
  vaccinations: [{ type: String }],
  weight_history: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }
});

petSchema.methods.serialize = function() {
  return {
    name: this.name,
    photo_url: this.photo_url,
    breed: this.breed,
    age: this.age,
    notes: this.notes,
    vet_name: this.vet_name,
    phone: this.phone,
    allergies: this.allergies,
    chronic_conditions: this.chronic_conditions,
    checkups: this.checkups,
    vaccinations: this.vaccinations,
    weight_history: this.weight_history,
    id: this._id
  };
};

const Pet = mongoose.model("Pet", petSchema);

module.exports = { Pet };
