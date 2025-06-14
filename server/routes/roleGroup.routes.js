// Routes for Role Groups
const controller = require("../controllers/roleGroup.controller");

module.exports = function(app) {
  app.get("/api/role-groups", controller.findAll);
  app.get("/api/role-groups/:id", controller.findOne);
  app.post("/api/role-groups", controller.create);
  app.put("/api/role-groups/:id", controller.update);
  app.delete("/api/role-groups/:id", controller.delete);
};
