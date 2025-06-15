// Routes for Roles
const controller = require("../controllers/role.controller");

module.exports = function(app) {
  app.get("/api/roles", controller.findAll);
};
