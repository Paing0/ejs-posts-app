const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()
const session = require("express-session")
const mongoStore = require("connect-mongodb-session")(session)

const store = new mongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
})

// server
const app = express()

// view engine
app.set("view engine", "ejs")
app.set("views", "views")

// routes
const postRoutes = require("./routes/post")
const adminRoutes = require("./routes/admin")
const authRoutes = require("./routes/auth")

// models
const User = require("./models/user")

// middlewares
app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
)

app.use((req, res, next) => {
  User.findById("66ae088505ad8b1632d53764").then((user) => {
    req.user = user
    next()
  })
})

app.use("/admin", adminRoutes)
app.use(postRoutes)
app.use(authRoutes)

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(8080)
    console.log("Connected to MongoDb")

    return User.findOne().then((user) => {
      if (!user) {
        User.create({
          username: "Paing",
          email: "abc@gmail.com",
          password: "abcdefg",
        })
      }
      return user
    })
  })
  .catch((err) => console.log(err))
