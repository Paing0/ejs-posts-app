const mongodb = require("mongodb")
const mongodbClient = mongodb.MongoClient
const dotenv = require("dotenv").config()

let db

const mongodbConnector = () => {
  mongodbClient
    .connect(process.env.MONGODB_URL)
    .then((result) => {
      console.log("Connected to DB.")
      db = result.db()
      console.log(result)
    })
    .catch((err) => console.log(err))
}

const getDatabase = () => {
  if (db) {
    return db
  }
  throw "No DB"
}

module.exports = { mongodbConnector, getDatabase }
