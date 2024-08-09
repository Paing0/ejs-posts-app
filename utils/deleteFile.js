const fs = require("fs")
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) throw err
    console.log("Image was deleted")
  })
}

module.exports = deleteFile
