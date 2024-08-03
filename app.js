const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()

const app = express()

app.set("view engine", "ejs")
app.set("views", "views")

const postRoutes = require("./routes/post")
const adminRoutes = require("./routes/admin")
const authRoutes = require("./routes/auth")

const User = require("./models/user")

app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
  User.findById("66ae088505ad8b1632d53764").then((user) => {
    req.user = user
    next()
  })
})

app.use(postRoutes)
app.use("/admin", adminRoutes)
app.use(authRoutes)

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDb")
    app.listen(8080)

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
