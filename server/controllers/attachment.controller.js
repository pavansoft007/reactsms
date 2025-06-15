const db = require("../models");
const Attachment = db.attachment;
const Op = db.Sequelize.Op;

exports.findAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.session_id) {
      where.session_id = req.query.session_id;
    }
    // Add more filters as needed
    const attachments = await Attachment.findAll({ where });
    res.json({ attachments });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch attachments" });
  }
};
