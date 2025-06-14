
const authJwt = require("./auth.jwt");
const verifySignUp = require("./verify.signup");
const roleMiddleware = require("./role.middleware");
const pagination = require("./pagination.middleware");
const filter = require("./filter.middleware");
const { errorHandler, notFoundHandler } = require("./error.middleware");
const { validate } = require("./validation.middleware");
const { auditLogger, detailedAuditLog } = require("./audit-logger.middleware");

module.exports = {
  authJwt,
  verifySignUp,
  roleMiddleware,
  pagination,
  filter,
  errorHandler,
  notFoundHandler,
  validate,
  auditLogger,
  detailedAuditLog
};
