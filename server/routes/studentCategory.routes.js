const studentCategoryController = require("../controllers/studentCategory.controller.js");
const { authJwt } = require("../middleware");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create a new Student Category
  app.post(
    "/api/admission/categories",
    [authJwt.verifyToken, authJwt.isAdmin], // Assuming only admins can create categories
    studentCategoryController.create
  );

  // Retrieve all Student Categories
  app.get(
    "/api/admission/categories",
    [authJwt.verifyToken], // Assuming all authenticated users can view categories
    studentCategoryController.findAll
  );

  // Retrieve a single Student Category with categoryId
  app.get(
    "/api/admission/categories/:categoryId",
    [authJwt.verifyToken],
    studentCategoryController.findOne
  );

  // Update a Student Category with categoryId
  app.put(
    "/api/admission/categories/:categoryId",
    [authJwt.verifyToken, authJwt.isAdmin],
    studentCategoryController.update
  );

  // Delete a Student Category with categoryId
  app.delete(
    "/api/admission/categories/:categoryId",
    [authJwt.verifyToken, authJwt.isAdmin],
    studentCategoryController.delete
  );
};
