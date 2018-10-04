require("dotenv").config();

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/pet-rx";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/pet-rx-test";
exports.PORT = process.env.PORT;

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
