const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")

const app = express()

app.set("view engine", "ejs")
app.set("views", "views")

const postRoutes = require("./routes/post")
const adminRoutes = require("./routes/admin")
const { mongodbConnector } = require("./utils/database")

app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: false }))

app.use(postRoutes)
app.use("/admin", adminRoutes)

mongodbConnector()
app.listen(8080)
