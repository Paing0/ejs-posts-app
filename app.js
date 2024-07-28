const express = require("express")
const path = require("path")

const bodyParser = require("body-parser")

const sequelize = require("./utils/database")

const Post = require("./models/post")
const User = require("./models/user")
const app = express()

app.set("view engine", "ejs")
app.set("views", "views")

const postRoutes = require("./routes/post")
const adminRoutes = require("./routes/admin")

app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: false }))

app.use(postRoutes)
app.use("/admin", adminRoutes)

Post.belongsTo(User, { constraints: true, onDelete: "CASCADE" })
Post.hasMany(Post)

sequelize
  .sync({ force: true })
  .then(() => {
    app.listen(8080)
  })
  .catch((err) => console.log(err))
