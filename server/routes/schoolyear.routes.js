const db = require("../models");

module.exports = (app) => {
  app.get("/api/schoolyear", async (req, res) => {
    try {
      const years = await db.schoolyear.findAll({
        attributes: ["id", "school_year", "created_by", "created_at", "updated_at"],
        order: [["school_year", "DESC"]]
      });
      res.json(years);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch academic years" });
    }
  });
};
