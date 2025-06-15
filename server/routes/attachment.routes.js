const controller = require("../controllers/attachment.controller");

module.exports = (app) => {
  app.get("/api/attachments", controller.findAll);
};
