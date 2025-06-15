const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Public access endpoint
  app.get("/api/test/all", controller.allAccess);

  // User management endpoints
  app.post(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.create
  );

  app.get(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findAll
  );

  app.get(
    "/api/users/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  app.put(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.update
  );

  app.delete(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );

  // Role-based access testing endpoints
  app.get(
    "/api/test/user",
    [authJwt.verifyToken],
    controller.userBoard
  );

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, (req, res, next) => {
      const { roleMiddleware } = require("../middleware");
      return roleMiddleware.hasRole("moderator")(req, res, next);
    }],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
};