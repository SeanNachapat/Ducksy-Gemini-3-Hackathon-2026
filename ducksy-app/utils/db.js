const Database = require("better-sqlite3");

const db = new Database("ducksy.db");

module.exports = db;