
module.exports = {
  secret: process.env.JWT_SECRET || "your-secret-key",
  expiresIn: process.env.JWT_EXPIRY || "24h",
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret-key"
};