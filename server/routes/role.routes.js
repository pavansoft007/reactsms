// Routes for Roles
const controller = require("../controllers/role.controller");

module.exports = function(app) {
  app.get("/api/roles", controller.findAll);
  app.get("/api/roles/:id", controller.findOne);
  app.post("/api/roles", controller.create);
  app.put("/api/roles/:id", controller.update);
  app.delete("/api/roles/:id", controller.delete);
  
  // Permission management routes
  app.get("/api/roles/:id/permissions", controller.getRolePermissions);
  app.post("/api/roles/:id/permissions", controller.saveRolePermissions);
  
  // Additional route to list all available permissions
  app.get("/api/permissions", controller.getAllPermissions);
};
