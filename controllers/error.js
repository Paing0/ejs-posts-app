exports.get404Page = (req, res) => {
  return res.status(404).render("error/404", { title: "404, Page not found" })
}
exports.get500Page = (err, req, res, next) => {
  return res
    .status(500)
    .render("error/500", {
      title: "500, Something went wrong",
      message: err.message,
    })
}
